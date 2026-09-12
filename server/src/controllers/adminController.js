import { supabase, isConfigured } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  mockItemsStore,
  mockClaimsStore,
  mockMatchesStore,
  formatItem,
  formatClaim,
} from '../services/store.js';
import { mockUsers } from '../middleware/auth.js';

/**
 * Get system statistics
 * GET /api/admin/stats
 */
export const getStats = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      const [
        { count: totalLost },
        { count: totalFound },
        { count: resolved },
        { count: activeMatches },
      ] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('type', 'lost'),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('type', 'found'),
        supabase.from('items').select('*', { count: 'exact', head: true }).in('status', ['resolved', 'claimed']),
        supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      return successResponse(res, {
        totalLost: totalLost || 0,
        totalFound: totalFound || 0,
        resolved: resolved || 0,
        activeMatches: activeMatches || 0,
      });
    }

    const totalLost = mockItemsStore.filter((i) => i.type === 'lost').length;
    const totalFound = mockItemsStore.filter((i) => i.type === 'found').length;
    const resolved = mockItemsStore.filter((i) => i.status === 'resolved' || i.status === 'claimed').length;
    const activeMatches = mockMatchesStore.filter((m) => m.status === 'pending').length;

    return successResponse(res, {
      totalLost,
      totalFound,
      resolved,
      activeMatches,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all registered users
 * GET /api/admin/users
 */
export const getUsers = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return errorResponse(res, error.message, 'FETCH_USERS_FAILED', 400);
      }

      return successResponse(
        res,
        data.map((u) => ({
          id: u.id,
          name: u.name,
          studentId: u.student_id,
          email: u.email,
          role: u.role,
          createdAt: u.created_at,
        }))
      );
    }

    const users = Array.from(mockUsers.values()).map((u) => ({
      id: u.id,
      name: u.name,
      studentId: u.student_id,
      email: u.email,
      role: u.role,
      createdAt: new Date().toISOString(),
    }));

    return successResponse(res, users);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all items (admin overview)
 * GET /api/admin/items
 */
export const getAdminItems = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return errorResponse(res, error.message, 'FETCH_ITEMS_FAILED', 400);
      }
      return successResponse(res, data.map(formatItem));
    }

    return successResponse(res, mockItemsStore.map(formatItem));
  } catch (err) {
    next(err);
  }
};

/**
 * Get all claims across platform
 * GET /api/admin/claims
 */
export const getAdminClaims = async (req, res, next) => {
  try {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return errorResponse(res, error.message, 'FETCH_CLAIMS_FAILED', 400);
      }
      return successResponse(res, data.map(formatClaim));
    }

    return successResponse(res, mockClaimsStore.map(formatClaim));
  } catch (err) {
    next(err);
  }
};

/**
 * Moderate/update item as admin
 * PATCH /api/admin/items/:id
 */
export const updateAdminItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'UPDATE_FAILED', 400);
      }
      return successResponse(res, formatItem(data));
    }

    const item = mockItemsStore.find((i) => i.id === id);
    if (!item) {
      return errorResponse(res, 'Item not found', 'NOT_FOUND', 404);
    }
    Object.assign(item, updates, { updated_at: new Date().toISOString() });
    return successResponse(res, formatItem(item));
  } catch (err) {
    next(err);
  }
};

/**
 * Moderate user (e.g. change role, suspend)
 * PATCH /api/admin/users/:id
 */
export const updateAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isSuspended } = req.body;

    if (isConfigured && supabase) {
      const updates = {};
      if (role) updates.role = role;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'UPDATE_USER_FAILED', 400);
      }

      return successResponse(res, {
        id: data.id,
        name: data.name,
        studentId: data.student_id,
        email: data.email,
        role: data.role,
      });
    }

    const user = mockUsers.get(id);
    if (!user) {
      return errorResponse(res, 'User not found', 'NOT_FOUND', 404);
    }
    if (role) user.role = role;

    return successResponse(res, {
      id: user.id,
      name: user.name,
      studentId: user.student_id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin claim status update / dispute resolution
 * PATCH /api/admin/claims/:id
 */
export const updateAdminClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'UPDATE_CLAIM_FAILED', 400);
      }

      if (status === 'approved') {
        await supabase
          .from('items')
          .update({ status: 'resolved', updated_at: new Date().toISOString() })
          .eq('id', data.item_id);
      }

      return successResponse(res, formatClaim(data));
    }

    const claim = mockClaimsStore.find((c) => c.id === id);
    if (!claim) {
      return errorResponse(res, 'Claim not found', 'NOT_FOUND', 404);
    }
    claim.status = status;
    claim.updated_at = new Date().toISOString();

    if (status === 'approved') {
      const item = mockItemsStore.find((i) => i.id === claim.item_id);
      if (item) item.status = 'resolved';
    }

    return successResponse(res, formatClaim(claim));
  } catch (err) {
    next(err);
  }
};
