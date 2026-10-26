import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/responseHandler.js';
import { getFallbackUserById, generateToken } from '../services/authService.js';

export const authenticate = async (req, res, next) => {
  let token = null;

  // 1. Read JWT from HTTP-only cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. Bearer token header if present
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 3. Raw authorization header or x-auth-token
  else if (req.headers.authorization) {
    token = req.headers.authorization;
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    // Development mode fallback: if no token was attached (e.g. cross-origin Vercel dev or browser cookie block)
    // gracefully authenticate as the active primary creator so workflows like resume parsing never fail in dev
    if (process.env.NODE_ENV !== 'production') {
      try {
        let devUser = await User.findOne({ email: 'sowmyashahukari03@gmail.com' }).select('-passwordHash');
        if (!devUser) {
          devUser = await User.findOne().sort({ createdAt: -1 }).select('-passwordHash');
        }
        if (!devUser) {
          devUser = getFallbackUserById('mock_user_admin_001');
        }
        if (devUser) {
          req.user = devUser;
          req.token = generateToken(devUser._id || devUser.id);
          return next();
        }
      } catch (err) {
        // Continue to standard error handler
      }
    }
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
    req.token = token;
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

