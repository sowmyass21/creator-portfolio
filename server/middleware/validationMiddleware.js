import { body, validationResult } from 'express-validator';
import { sendError } from '../utils/responseHandler.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return sendError(res, firstError, 400, { errors: errors.array() });
  }
  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateForgotPassword = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  handleValidationErrors
];

export const validateResetPassword = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateProjectInput = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required'),
  body('summary')
    .trim()
    .notEmpty()
    .withMessage('Project summary is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Project category is required'),
  handleValidationErrors
];

export const validateProfileInput = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty'),
  body('handle')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Handle cannot be empty'),
  handleValidationErrors
];
