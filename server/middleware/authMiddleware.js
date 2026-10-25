import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/responseHandler.js';
import { getFallbackUserById } from '../services/authService.js';

export const authenticate = async (req, res, next) => {
  let token = null;

  // Read JWT from HTTP-only cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // Fallback to Bearer token header if present
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Authentication required. Please log in to access this resource.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_creator_portfolio_2026_x89f');
    
    // Find user in database or fallback auth service
    let user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      user = getFallbackUserById(decoded.id);
    }

    if (!user) {
      return sendError(res, 'User session invalid or user no longer exists', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    return sendError(res, 'Invalid or expired session token', 401);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Role check is strictly performed against backend server-side req.user record
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this administrative resource.`,
        403
      );
    }

    next();
  };
};

export const protect = authenticate;

