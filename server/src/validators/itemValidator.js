import { errorResponse } from '../utils/response.js';
import { CATEGORIES, LOCATIONS } from '../config/constants.js';

export const validateCreateItem = (req, res, next) => {
  const { title, category, description, location, date, time } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return errorResponse(res, 'Item title is required', 'VALIDATION_ERROR', 400);
  }

  if (!category || !CATEGORIES.includes(category)) {
    return errorResponse(res, `Category must be one of: ${CATEGORIES.join(', ')}`, 'VALIDATION_ERROR', 400);
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    return errorResponse(res, 'Description is required and must be at least 5 characters', 'VALIDATION_ERROR', 400);
  }

  if (!location || !LOCATIONS.includes(location)) {
    return errorResponse(res, `Location must be one of: ${LOCATIONS.join(', ')}`, 'VALIDATION_ERROR', 400);
  }

  if (!date) {
    return errorResponse(res, 'Date is required (YYYY-MM-DD)', 'VALIDATION_ERROR', 400);
  }

  if (!time) {
    return errorResponse(res, 'Time is required (HH:MM)', 'VALIDATION_ERROR', 400);
  }

  next();
};

export const validateUpdateItem = (req, res, next) => {
  const { category, location } = req.body;

  if (category && !CATEGORIES.includes(category)) {
    return errorResponse(res, `Category must be one of: ${CATEGORIES.join(', ')}`, 'VALIDATION_ERROR', 400);
  }

  if (location && !LOCATIONS.includes(location)) {
    return errorResponse(res, `Location must be one of: ${LOCATIONS.join(', ')}`, 'VALIDATION_ERROR', 400);
  }

  next();
};

export const validateItemStatus = (req, res, next) => {
  const { status } = req.body;
  const allowed = ['active', 'resolved', 'claimed'];

  if (!status || !allowed.includes(status)) {
    return errorResponse(res, `Status must be one of: ${allowed.join(', ')}`, 'VALIDATION_ERROR', 400);
  }

  next();
};
