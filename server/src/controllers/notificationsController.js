import { successResponse, errorResponse } from '../utils/response.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService.js';

/**
 * Get user's notifications
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await getUserNotifications(userId);
    return successResponse(res, notifications);
  } catch (err) {
    next(err);
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updated = await markNotificationAsRead(id, userId);

    if (!updated) {
      return errorResponse(res, 'Notification not found', 'NOT_FOUND', 404);
    }

    return successResponse(res, updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await markAllNotificationsAsRead(userId);
    return successResponse(res, { message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
