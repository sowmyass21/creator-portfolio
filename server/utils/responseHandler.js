/**
 * Standardized API Response Utilities
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {any} data - Payload data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP Status Code (default 200)
 * @param {Object} meta - Additional metadata like pagination or source info
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    data,
    meta: Object.keys(meta).length > 0 ? meta : undefined,
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error description
 * @param {number} statusCode - HTTP Status Code (default 500)
 * @param {any} errors - Validation errors or details array
 */
export const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    errors: errors || undefined,
  });
};
