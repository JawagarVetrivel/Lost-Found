import { supabase, isConfigured } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { mockItemsStore, mockMatchesStore, formatItem } from '../services/store.js';
import {
  filterCandidateItems,
  compareItems,
} from '../services/matchingService.js';
import { MATCH_THRESHOLDS } from '../config/constants.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Triggers the Smart Matching Engine asynchronously after item creation
 */
export async function triggerSmartMatching(newItem) {
  try {
    let allCandidates = [];

    if (isConfigured && supabase) {
      const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('type', oppositeType)
        .eq('status', 'active');

      if (!error && data) {
        allCandidates = data.map(formatItem);
      }
    } else {
      allCandidates = mockItemsStore.map(formatItem);
    }

    const filteredCandidates = filterCandidateItems(newItem, allCandidates);

    for (const candidate of filteredCandidates) {
      const lostItem = newItem.type === 'lost' ? newItem : candidate;
      const foundItem = newItem.type === 'found' ? newItem : candidate;

      const matchResult = await compareItems(lostItem, foundItem);

      // Only record matches meeting minimum display threshold
      if (matchResult.finalScore >= MATCH_THRESHOLDS.MINIMUM_DISPLAY) {
        const matchPayload = {
          lost_item_id: lostItem.id,
          found_item_id: foundItem.id,
          category_score: matchResult.categoryScore,
          location_score: matchResult.locationScore,
          time_score: matchResult.timeScore,
          description_score: matchResult.descriptionScore,
          color_score: matchResult.colorScore,
          brand_score: matchResult.brandScore,
          final_score: matchResult.finalScore,
          status: 'pending',
          explanation: matchResult.explanation,
        };

        if (isConfigured && supabase) {
          await supabase.from('matches').upsert([matchPayload], {
            onConflict: 'lost_item_id,found_item_id',
          });
        }

        // Store in mock memory
        const existingIdx = mockMatchesStore.findIndex(
          (m) => m.lost_item_id === lostItem.id && m.found_item_id === foundItem.id
        );
        const matchRecord = {
          id: existingIdx >= 0 ? mockMatchesStore[existingIdx].id : `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          ...matchPayload,
          reasons: matchResult.reasons,
          created_at: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          mockMatchesStore[existingIdx] = matchRecord;
        } else {
          mockMatchesStore.push(matchRecord);
        }

        // Notify both parties if high-confidence match
        if (matchResult.finalScore >= MATCH_THRESHOLDS.LIKELY) {
          await Promise.all([
            createNotification({
              userId: lostItem.userId || lostItem.user_id,
              type: 'match',
              title: `High Confidence Match (${matchResult.finalScore}%)`,
              message: `A potential match was found for your lost "${lostItem.title}"!`,
              relatedItemId: lostItem.id,
            }),
            createNotification({
              userId: foundItem.userId || foundItem.user_id,
              type: 'match',
              title: `High Confidence Match (${matchResult.finalScore}%)`,
              message: `A reported lost item matches the "${foundItem.title}" you found!`,
              relatedItemId: foundItem.id,
            }),
          ]);
        }
      }
    }
  } catch (err) {
    console.error('[Smart Matching Engine Error]', err);
  }
}

/**
 * Create Lost Item
 * POST /api/items/lost
 */
export const createLostItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      category,
      description,
      brand,
      color,
      date,
      time,
      location,
      latitude,
      longitude,
      imageUrl,
    } = req.body;

    const itemData = {
      user_id: userId,
      type: 'lost',
      title,
      category,
      description,
      brand: brand || null,
      color: color || null,
      date,
      time,
      location,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      image_url: imageUrl || null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let createdItem;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'CREATE_ITEM_FAILED', 400);
      }
      createdItem = formatItem(data);
    } else {
      const localItem = {
        id: `i_${Date.now()}`,
        ...itemData,
      };
      mockItemsStore.unshift(localItem);
      createdItem = formatItem(localItem);
    }

    // Run matching engine asynchronously
    triggerSmartMatching(createdItem);

    return successResponse(res, createdItem, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Create Found Item
 * POST /api/items/found
 */
export const createFoundItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      category,
      description,
      brand,
      color,
      date,
      time,
      location,
      latitude,
      longitude,
      imageUrl,
    } = req.body;

    const itemData = {
      user_id: userId,
      type: 'found',
      title,
      category,
      description,
      brand: brand || null,
      color: color || null,
      date,
      time,
      location,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      image_url: imageUrl || null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let createdItem;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'CREATE_ITEM_FAILED', 400);
      }
      createdItem = formatItem(data);
    } else {
      const localItem = {
        id: `i_${Date.now()}`,
        ...itemData,
      };
      mockItemsStore.unshift(localItem);
      createdItem = formatItem(localItem);
    }

    // Run matching engine asynchronously
    triggerSmartMatching(createdItem);

    return successResponse(res, createdItem, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get items with filters and pagination
 * GET /api/items
 */
export const getItems = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      type,
      date,
      status,
      userId,
      page = 1,
      limit = 50,
    } = req.query;

    if (isConfigured && supabase) {
      let query = supabase.from('items').select('*', { count: 'exact' });

      if (type && type !== 'all') query = query.eq('type', type);
      if (category && category !== 'all') query = query.eq('category', category);
      if (location && location !== 'all') query = query.eq('location', location);
      if (status && status !== 'all') query = query.eq('status', status);
      if (userId) query = query.eq('user_id', userId);
      if (date) query = query.eq('date', date);

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`
        );
      }

      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit, 10) - 1);

      const { data, error, count } = await query;

      if (error) {
        return errorResponse(res, error.message, 'FETCH_FAILED', 400);
      }

      return successResponse(res, data.map(formatItem));
    }

    // Fallback in-memory items
    let results = [...mockItemsStore];

    if (type && type !== 'all') {
      results = results.filter((i) => i.type === type);
    }
    if (category && category !== 'all') {
      results = results.filter((i) => i.category === category);
    }
    if (location && location !== 'all') {
      results = results.filter((i) => i.location === location);
    }
    if (status && status !== 'all') {
      results = results.filter((i) => i.status === status);
    }
    if (userId) {
      results = results.filter((i) => i.user_id === userId);
    }
    if (date) {
      results = results.filter((i) => i.date === date);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.brand && i.brand.toLowerCase().includes(q))
      );
    }

    // Sort descending by created_at
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return successResponse(res, results.map(formatItem));
  } catch (err) {
    next(err);
  }
};

/**
 * Get item by ID
 * GET /api/items/:id
 */
export const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return errorResponse(res, 'Item not found', 'NOT_FOUND', 404);
      }
      return successResponse(res, formatItem(data));
    }

    const item = mockItemsStore.find((i) => i.id === id);
    if (!item) {
      return errorResponse(res, 'Item not found', 'NOT_FOUND', 404);
    }

    return successResponse(res, formatItem(item));
  } catch (err) {
    next(err);
  }
};

/**
 * Update item (Only owner or admin)
 * PUT /api/items/:id
 */
export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Verify ownership
    let existingItem;
    if (isConfigured && supabase) {
      const { data } = await supabase.from('items').select('*').eq('id', id).single();
      existingItem = data;
    } else {
      existingItem = mockItemsStore.find((i) => i.id === id);
    }

    if (!existingItem) {
      return errorResponse(res, 'Item not found', 'NOT_FOUND', 404);
    }

    if (existingItem.user_id !== userId && !isAdmin) {
      return errorResponse(res, 'Forbidden: You do not own this report', 'FORBIDDEN', 403);
    }

    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    delete updates.id;
    delete updates.user_id;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'UPDATE_FAILED', 400);
      }
      return successResponse(res, formatItem(data));
    }

    Object.assign(existingItem, updates);
    return successResponse(res, formatItem(existingItem));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete item (Only owner or admin)
 * DELETE /api/items/:id
 */
export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let existingItem;
    if (isConfigured && supabase) {
      const { data } = await supabase.from('items').select('*').eq('id', id).single();
      existingItem = data;
    } else {
      existingItem = mockItemsStore.find((i) => i.id === id);
    }

    if (!existingItem) {
      return errorResponse(res, 'Item not found', 'NOT_FOUND', 404);
    }

    if (existingItem.user_id !== userId && !isAdmin) {
      return errorResponse(res, 'Forbidden: You do not own this report', 'FORBIDDEN', 403);
    }

    if (isConfigured && supabase) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) {
        return errorResponse(res, error.message, 'DELETE_FAILED', 400);
      }
    } else {
      const idx = mockItemsStore.findIndex((i) => i.id === id);
      if (idx >= 0) mockItemsStore.splice(idx, 1);
    }

    return successResponse(res, { message: 'Item deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Update item status
 * PATCH /api/items/:id/status
 */
export const updateItemStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let existingItem;
    if (isConfigured && supabase) {
      const { data } = await supabase.from('items').select('*').eq('id', id).single();
      existingItem = data;
    } else {
      existingItem = mockItemsStore.find((i) => i.id === id);
    }

    if (!existingItem) {
      return errorResponse(res, 'Item not found', 'NOT_FOUND', 404);
    }

    if (existingItem.user_id !== userId && !isAdmin) {
      return errorResponse(res, 'Forbidden: You do not own this report', 'FORBIDDEN', 403);
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse(res, error.message, 'STATUS_UPDATE_FAILED', 400);
      }

      if (status === 'resolved') {
        createNotification({
          userId: existingItem.user_id,
          type: 'system',
          title: 'Item Resolved',
          message: `Your report "${existingItem.title}" was marked as resolved.`,
          relatedItemId: id,
        });
      }

      return successResponse(res, formatItem(data));
    }

    existingItem.status = status;
    existingItem.updated_at = new Date().toISOString();

    if (status === 'resolved') {
      createNotification({
        userId: existingItem.user_id,
        type: 'system',
        title: 'Item Resolved',
        message: `Your report "${existingItem.title}" was marked as resolved.`,
        relatedItemId: id,
      });
    }

    return successResponse(res, formatItem(existingItem));
  } catch (err) {
    next(err);
  }
};
