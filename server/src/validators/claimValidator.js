import { errorResponse } from '../utils/response.js';

export const validateCreateClaim = (req, res, next) => {
  const { itemId, message } = req.body;

  if (!itemId) {
    return errorResponse(res, 'Target item ID is required', 'VALIDATION_ERROR', 400);
  }

  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    return errorResponse(res, 'A claim message of at least 5 characters is required', 'VALIDATION_ERROR', 400);
  }

  next();
};

export const validateUpdateClaim = (req, res, next) => {
  const { status } = req.body;
  const allowed = ['pending', 'approved', 'rejected'];

  if (!status || !allowed.includes(status)) {
    return errorResponse(res, `Claim status must be one of: ${allowed.join(', ')}`, 'VALIDATION_ERROR', 400);
  }

  next();
};
