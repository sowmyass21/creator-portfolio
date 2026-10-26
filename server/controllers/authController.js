import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { 
  registerUser, 
  loginUser, 
  generateToken, 
  getCookieOptions,
  requestPasswordReset,
  resetPassword as resetPasswordService
} from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required fields', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    const user = await registerUser({ name, email, password });
    const token = generateToken(user._id || user.id);
    const cookieOptions = getCookieOptions();

    // Set HTTP-only cookie
    res.cookie('token', token, cookieOptions);

    return sendSuccess(
      res,
      { user, token },
      'User account registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const user = await loginUser({ email, password });
    const token = generateToken(user._id || user.id);
    const cookieOptions = getCookieOptions();

    // Set HTTP-only cookie
    res.cookie('token', token, cookieOptions);

    return sendSuccess(
      res,
      { user, token },
      'Logged in successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  // Clear the HTTP-only cookie
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });

  return sendSuccess(res, null, 'Logged out successfully', 200);
};

export const getMe = async (req, res) => {
  // req.user attached by authenticate middleware
  const token = req.token || (req.user ? generateToken(req.user._id || req.user.id) : null);
  return sendSuccess(res, { user: req.user, token }, 'Current user profile retrieved', 200);
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Please provide an email address', 400);
    }

    const clientOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
    const result = await requestPasswordReset(email, clientOrigin);

    return sendSuccess(
      res,
      result,
      'Password reset instructions have been sent to your email.',
      200
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return sendError(res, 'Password reset token is required', 400);
    }

    if (!password || password.length < 6) {
      return sendError(res, 'New password must be at least 6 characters long', 400);
    }

    const user = await resetPasswordService({ token, newPassword: password });
    const authToken = generateToken(user._id || user.id);
    const cookieOptions = getCookieOptions();

    // Issue HTTP-only cookie so user can immediately continue to dashboard
    res.cookie('token', authToken, cookieOptions);

    return sendSuccess(
      res,
      { user, token: authToken },
      'Password has been reset successfully. You are now logged in.',
      200
    );
  } catch (error) {
    next(error);
  }
};

