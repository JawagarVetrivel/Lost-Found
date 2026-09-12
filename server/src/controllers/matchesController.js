import { supabase, isConfigured } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  mockMatchesStore,
  mockItemsStore,
  formatMatch,
} from '../services/store.js';

/**
 * Helper to hydrate a match with its lostItem and foundItem
 */
async function hydrateMatch(matchRow) {
  let lostItem = null;
  let foundItem = null;

  if (isConfigured && supabase) {
    const [lostRes, foundRes] = await Promise.all([
      supabase.from('items').select('*').eq('id', matchRow.lost_item_id).single(),
      supabase.from('items').select('*').eq('id', matchRow.found_item_id).single(),
    ]);
    lostItem = lostRes.data;
    foundItem = foundRes.data;
  } else {
    lostItem = mockItemsStore.find((i) => i.id === matchRow.lost_item_id);
    foundItem = mockItemsStore.find((i) => i.id === matchRow.found_item_id);
  }

  return formatMatch(matchRow, lostItem, foundItem);
}

/**
 * Get all active matches for the authenticated user
 * GET /api/matches
 */
export const getMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let matchRows = [];

    if (isConfigured && supabase) {
      if (isAdmin) {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .neq('status', 'dismissed')
          .order('final_score', { ascending: false });

        if (!error && data) matchRows = data;
      } else {
        // Fetch items owned by user first
        const { data: userItems } = await supabase
          .from('items')
          .select('id')
          .eq('user_id', userId);

        const itemIds = (userItems || []).map((i) => i.id);

        if (itemIds.length > 0) {
          const { data, error } = await supabase
            .from('matches')
            .select('*')
            .neq('status', 'dismissed')
            .or(`lost_item_id.in.(${itemIds.join(',')}),found_item_id.in.(${itemIds.join(',')})`)
            .order('final_score', { ascending: false });

          if (!error && data) matchRows = data;
        }
      }
    } else {
      // In-memory fallback
      if (isAdmin) {
        matchRows = mockMatchesStore.filter((m) => m.status !== 'dismissed');
      } else {
        const userItemIds = mockItemsStore
          .filter((i) => i.user_id === userId)
          .map((i) => i.id);

        matchRows = mockMatchesStore.filter(
          (m) =>
            m.status !== 'dismissed' &&
            (userItemIds.includes(m.lost_item_id) || userItemIds.includes(m.found_item_id))
        );
      }
    }

    const hydratedMatches = await Promise.all(matchRows.map(hydrateMatch));
    return successResponse(res, hydratedMatches);
  } catch (err) {
    next(err);
  }
};

/**
 * Get match by ID
 * GET /api/matches/:id
 */
export const getMatchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let matchRow = null;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return errorResponse(res, 'Match not found', 'NOT_FOUND', 404);
      }
      matchRow = data;
    } else {
      matchRow = mockMatchesStore.find((m) => m.id === id);
      if (!matchRow) {
        return errorResponse(res, 'Match not found', 'NOT_FOUND', 404);
      }
    }

    const hydrated = await hydrateMatch(matchRow);
    return successResponse(res, hydrated);
  } catch (err) {
    next(err);
  }
};

/**
 * Get matches for a specific item
 * GET /api/items/:id/matches
 */
export const getItemMatches = async (req, res, next) => {
  try {
    const { id } = req.params;

    let matchRows = [];

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`lost_item_id.eq.${id},found_item_id.eq.${id}`)
        .order('final_score', { ascending: false });

      if (!error && data) matchRows = data;
    } else {
      matchRows = mockMatchesStore.filter(
        (m) => m.lost_item_id === id || m.found_item_id === id
      );
    }

    const hydrated = await Promise.all(matchRows.map(hydrateMatch));
    return successResponse(res, hydrated);
  } catch (err) {
    next(err);
  }
};

/**
 * Dismiss match
 * PATCH /api/matches/:id/dismiss
 */
export const dismissMatch = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('matches')
        .update({ status: 'dismissed' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'DISMISS_FAILED', 400);
      }
      return successResponse(res, { message: 'Match dismissed successfully' });
    }

    const match = mockMatchesStore.find((m) => m.id === id);
    if (match) {
      match.status = 'dismissed';
    }

    return successResponse(res, { message: 'Match dismissed successfully' });
  } catch (err) {
    next(err);
  }
};
