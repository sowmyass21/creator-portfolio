import { validationResult } from 'express-validator';
import { sendError } from '../utils/responseHandler.js';

/**
 * Validates request parameters and queries using express-validator
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      'Validation Failed',
      400,
      errors.array().map(err => ({ field: err.param || err.path, message: err.msg }))
    );
  }
  next();
};
