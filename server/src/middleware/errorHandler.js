import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  // Multer specific file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File size exceeds maximum limit of 5MB', 'FILE_TOO_LARGE', 400);
    }
    return errorResponse(res, `Upload error: ${err.message}`, 'UPLOAD_ERROR', 400);
  }

  // JSON syntax errors in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Malformed JSON payload', 'INVALID_JSON', 400);
  }

  // Custom status code if provided
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred';
  const code = err.code || 'INTERNAL_ERROR';

  return errorResponse(res, message, code, status);
};
