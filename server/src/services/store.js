import { supabase, isConfigured } from '../config/supabase.js';

// In-memory collections for local/testing fallback mode
export const mockItemsStore = [
  {
    id: 'i1',
    user_id: 'u1',
    type: 'lost',
    title: 'Apple AirPods Pro',
    category: 'Electronics',
    description: 'White AirPods Pro in a clear case. Left earbud has a small scratch.',
    brand: 'Apple',
    color: 'White',
    date: '2026-09-10',
    time: '14:30',
    location: 'Library',
    latitude: 37.7749,
    longitude: -122.4194,
    image_url: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'i2',
    user_id: 'u2',
    type: 'found',
    title: 'White Wireless Earbuds',
    category: 'Electronics',
    description: 'Found a pair of white Apple earbuds near the 2nd floor study area in library.',
    brand: 'Apple',
    color: 'White',
    date: '2026-09-10',
    time: '15:00',
    location: 'Library',
    latitude: 37.7750,
    longitude: -122.4195,
    image_url: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&q=80&w=600',
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'i3',
    user_id: 'u3',
    type: 'lost',
    title: 'Black HP Laptop',
    category: 'Electronics',
    description: 'HP Envy x360, 15 inch, black color. Has a sticker of a cat on the back.',
    brand: 'HP',
    color: 'Black',
    date: '2026-09-11',
    time: '10:00',
    location: 'Cafeteria',
    image_url: null,
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'i4',
    user_id: 'u4',
    type: 'found',
    title: 'Blue Nike Backpack',
    category: 'Bags',
    description: 'Contains some notebook and a water bottle.',
    brand: 'Nike',
    color: 'Blue',
    date: '2026-09-11',
    time: '09:15',
    location: 'Sports Complex',
    image_url: null,
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export const mockMatchesStore = [];
export const mockClaimsStore = [];

/**
 * Format database row (snake_case) to frontend Item entity (camelCase)
 */
export function formatItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    category: row.category,
    description: row.description,
    brand: row.brand || '',
    color: row.color || '',
    date: row.date,
    time: row.time,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    imageUrl: row.image_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Format database row to frontend Match entity
 */
export function formatMatch(row, lostItem = null, foundItem = null) {
  if (!row) return null;
  return {
    id: row.id,
    lostItemId: row.lost_item_id,
    foundItemId: row.found_item_id,
    categoryScore: Number(row.category_score),
    locationScore: Number(row.location_score),
    timeScore: Number(row.time_score),
    descriptionScore: Number(row.description_score),
    colorScore: Number(row.color_score),
    brandScore: Number(row.brand_score),
    finalScore: Number(row.final_score),
    status: row.status,
    explanation: row.explanation,
    reasons: row.reasons || (row.explanation ? [row.explanation] : []),
    createdAt: row.created_at,
    lostItem: lostItem ? formatItem(lostItem) : undefined,
    foundItem: foundItem ? formatItem(foundItem) : undefined,
  };
}

/**
 * Format database row to frontend Claim entity
 */
export function formatClaim(row) {
  if (!row) return null;
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    message: row.message,
    proofImage: row.proof_image_url,
    proofImageUrl: row.proof_image_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
