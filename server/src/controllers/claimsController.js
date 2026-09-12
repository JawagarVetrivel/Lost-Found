import { supabase, isConfigured } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  mockClaimsStore,
  mockItemsStore,
  formatClaim,
} from '../services/store.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Submit claim for an item
 * POST /api/claims
 */
export const createClaim = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId, message, proofImageUrl } = req.body;

    // Verify item exists
    let item;
    if (isConfigured && supabase) {
      const { data } = await supabase.from('items').select('*').eq('id', itemId).single();
      item = data;
    } else {
      item = mockItemsStore.find((i) => i.id === itemId);
    }

    if (!item) {
      return errorResponse(res, 'Item not found', 'NOT_FOUND', 404);
    }

    // A user cannot claim their own report
    if (item.user_id === userId) {
      return errorResponse(res, 'You cannot submit a claim on your own report', 'INVALID_ACTION', 400);
    }

    const claimData = {
      item_id: itemId,
      user_id: userId,
      message,
      proof_image_url: proofImageUrl || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let createdClaim;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .insert([claimData])
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'CLAIM_FAILED', 400);
      }
      createdClaim = formatClaim(data);
    } else {
      const localClaim = {
        id: `c_${Date.now()}`,
        ...claimData,
      };
      mockClaimsStore.unshift(localClaim);
      createdClaim = formatClaim(localClaim);
    }

    // Notify the item owner that someone submitted a claim/message
    await createNotification({
      userId: item.user_id,
      type: 'claim',
      title: 'New Claim Received',
      message: `Someone submitted a claim regarding your report "${item.title}".`,
      relatedItemId: item.id,
    });

    return successResponse(res, createdClaim, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get claims submitted by the current user
 * GET /api/claims/my
 */
export const getMyClaims = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return errorResponse(res, error.message, 'FETCH_FAILED', 400);
      }
      return successResponse(res, data.map(formatClaim));
    }

    const claims = mockClaimsStore.filter((c) => c.user_id === userId);
    return successResponse(res, claims.map(formatClaim));
  } catch (err) {
    next(err);
  }
};

/**
 * Get claim by ID
 * GET /api/claims/:id
 */
export const getClaimById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let claim;
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return errorResponse(res, 'Claim not found', 'NOT_FOUND', 404);
      }
      claim = data;
    } else {
      claim = mockClaimsStore.find((c) => c.id === id);
      if (!claim) {
        return errorResponse(res, 'Claim not found', 'NOT_FOUND', 404);
      }
    }

    // Check authorization (must be claimer, item owner, or admin)
    let item;
    if (isConfigured && supabase) {
      const { data } = await supabase.from('items').select('*').eq('id', claim.item_id).single();
      item = data;
    } else {
      item = mockItemsStore.find((i) => i.id === claim.item_id);
    }

    const isOwner = item?.user_id === userId;
    const isClaimer = claim.user_id === userId;

    if (!isOwner && !isClaimer && !isAdmin) {
      return errorResponse(res, 'Forbidden: You cannot view this claim', 'FORBIDDEN', 403);
    }

    return successResponse(res, formatClaim(claim));
  } catch (err) {
    next(err);
  }
};

/**
 * Approve or reject claim
 * PATCH /api/claims/:id
 */
export const updateClaimStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let claim;
    if (isConfigured && supabase) {
      const { data } = await supabase.from('claims').select('*').eq('id', id).single();
      claim = data;
    } else {
      claim = mockClaimsStore.find((c) => c.id === id);
    }

    if (!claim) {
      return errorResponse(res, 'Claim not found', 'NOT_FOUND', 404);
    }

    // Verify item ownership
    let item;
    if (isConfigured && supabase) {
      const { data } = await supabase.from('items').select('*').eq('id', claim.item_id).single();
      item = data;
    } else {
      item = mockItemsStore.find((i) => i.id === claim.item_id);
    }

    const isItemOwner = item && item.user_id === userId;
    if (!isItemOwner && !isAdmin) {
      return errorResponse(res, 'Forbidden: Only item owner or admin can review claims', 'FORBIDDEN', 403);
    }

    if (isConfigured && supabase) {
      const { data: updatedClaim, error } = await supabase
        .from('claims')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'UPDATE_FAILED', 400);
      }

      if (status === 'approved') {
        // Mark item as resolved/claimed
        await supabase
          .from('items')
          .update({ status: 'resolved', updated_at: new Date().toISOString() })
          .eq('id', claim.item_id);

        // Notify claimer
        await createNotification({
          userId: claim.user_id,
          type: 'claim',
          title: 'Claim Approved!',
          message: `Your claim on "${item?.title || 'the item'}" was approved by the owner.`,
          relatedItemId: claim.item_id,
        });
      } else if (status === 'rejected') {
        await createNotification({
          userId: claim.user_id,
          type: 'claim',
          title: 'Claim Rejected',
          message: `Your claim on "${item?.title || 'the item'}" was declined.`,
          relatedItemId: claim.item_id,
        });
      }

      return successResponse(res, formatClaim(updatedClaim));
    }

    claim.status = status;
    claim.updated_at = new Date().toISOString();

    if (status === 'approved') {
      if (item) item.status = 'resolved';
      await createNotification({
        userId: claim.user_id,
        type: 'claim',
        title: 'Claim Approved!',
        message: `Your claim on "${item?.title || 'the item'}" was approved by the owner.`,
        relatedItemId: claim.item_id,
      });
    } else if (status === 'rejected') {
      await createNotification({
        userId: claim.user_id,
        type: 'claim',
        title: 'Claim Rejected',
        message: `Your claim on "${item?.title || 'the item'}" was declined.`,
        relatedItemId: claim.item_id,
      });
    }

    return successResponse(res, formatClaim(claim));
  } catch (err) {
    next(err);
  }
};
