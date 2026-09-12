import { supabase, isConfigured } from '../config/supabase.js';

// In-memory fallback notifications store
export const mockNotificationsStore = [];

/**
 * Creates and persists a notification
 */
export async function createNotification({ userId, type, title, message, relatedItemId = null }) {
  try {
    const notificationPayload = {
      user_id: userId,
      type, // 'match' | 'claim' | 'system'
      title,
      message,
      read: false,
      related_item_id: relatedItemId,
      created_at: new Date().toISOString(),
    };

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationPayload])
        .select()
        .single();

      if (error) {
        console.error('[NotificationService] Supabase insert error:', error);
      } else {
        return data;
      }
    }

    // In-memory fallback
    const localNotif = {
      id: `n_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...notificationPayload,
    };
    mockNotificationsStore.unshift(localNotif);
    return localNotif;
  } catch (err) {
    console.error('[NotificationService] Error creating notification:', err);
  }
}

/**
 * Retrieves notifications for a given user
 */
export async function getUserNotifications(userId) {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map(formatNotification);
    }
  }

  // In-memory fallback
  const userNotifs = mockNotificationsStore.filter((n) => n.user_id === userId);
  return userNotifs.map(formatNotification);
}

/**
 * Marks notification as read
 */
export async function markNotificationAsRead(notificationId, userId) {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error && data) return formatNotification(data);
  }

  const notif = mockNotificationsStore.find((n) => n.id === notificationId && n.user_id === userId);
  if (notif) {
    notif.read = true;
    return formatNotification(notif);
  }
  return null;
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId) {
  if (isConfigured && supabase) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
  }

  mockNotificationsStore.forEach((n) => {
    if (n.user_id === userId) {
      n.read = true;
    }
  });

  return true;
}

/**
 * Formats notification for frontend compatibility (both isRead and read, link)
 */
function formatNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    read: row.read,
    isRead: row.read,
    type: row.type,
    relatedItemId: row.related_item_id,
    createdAt: row.created_at,
    link: row.type === 'match' ? '/matches' : row.related_item_id ? `/item/${row.related_item_id}` : undefined,
  };
}
