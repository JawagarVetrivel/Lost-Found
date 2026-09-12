import { errorResponse } from '../utils/response.js';

export const validateRegister = (req, res, next) => {
  const { name, email, password, studentId } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return errorResponse(res, 'Valid full name (at least 2 characters) is required', 'VALIDATION_ERROR', 400);
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return errorResponse(res, 'A valid email address is required', 'VALIDATION_ERROR', 400);
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return errorResponse(res, 'Password must be at least 6 characters long', 'VALIDATION_ERROR', 400);
  }

  if (!studentId || typeof studentId !== 'string' || studentId.trim().length < 2) {
    return errorResponse(res, 'A valid Student ID is required', 'VALIDATION_ERROR', 400);
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 'VALIDATION_ERROR', 400);
  }

  next();
};

export const validatePasswordReset = (req, res, next) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return errorResponse(res, 'A valid email address is required for password reset', 'VALIDATION_ERROR', 400);
  }

  next();
};
