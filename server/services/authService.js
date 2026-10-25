import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { checkDbStatus } from './dbService.js';
import { sendPasswordResetEmail } from './emailService.js';

// In-memory fallback user store for standalone mode when MongoDB is not running
const fallbackUsers = new Map();

// Helper to pre-seed default accounts in standalone memory
const initFallbackUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('password123', salt);

  const defaultAdmin = {
    _id: 'mock_user_admin_001',
    id: 'mock_user_admin_001',
    name: 'Elena Vance',
    email: 'admin@creator.dev',
    passwordHash: defaultPasswordHash,
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const defaultElena = {
    _id: 'mock_user_admin_002',
    id: 'mock_user_admin_002',
    name: 'Elena Vance',
    email: 'elena@elenavance.dev',
    passwordHash: defaultPasswordHash,
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const defaultUser = {
    _id: 'mock_user_standard_001',
    id: 'mock_user_standard_001',
    name: 'Alex Creator',
    email: 'alex@creator.dev',
    passwordHash: defaultPasswordHash,
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  fallbackUsers.set(defaultAdmin.email, defaultAdmin);
  fallbackUsers.set(defaultElena.email, defaultElena);
  fallbackUsers.set(defaultUser.email, defaultUser);
};

initFallbackUsers().catch(err => console.error('[AuthService] Fallback pre-seed error:', err.message));

// Helper to generate JWT Token
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'super_secret_jwt_key_creator_portfolio_2026_x89f',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper for cookie options (HTTP-only)
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // Prevents JavaScript client access (XSS defense)
    secure: isProduction, // HTTPS required in production
    sameSite: isProduction ? 'none' : 'lax', // Cross-origin cookie support for Vercel + Render
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/'
  };
};

export const registerUser = async ({ name, email, password }) => {
  const dbStatus = checkDbStatus();
  const normalizedEmail = email.toLowerCase().trim();

  // Role defaults to 'USER' for registration
  const role = 'USER';

  if (dbStatus.isConnected) {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error = new Error('An account with this email address already exists. Please sign in or reset your password.');
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      connectedPlatforms: [],
    });

    // Safely initialize Profile and CreatorProfile relationships
    try {
      const Profile = (await import('../models/Profile.js')).default;
      const { generateUniqueProfileHandle } = await import('./profileService.js');
      const uniqueHandle = await generateUniqueProfileHandle(name, user._id);
      
      await Profile.create({
        userId: user._id,
        fullName: name,
        handle: uniqueHandle,
        email: normalizedEmail,
        skills: [],
        socialLinks: [],
        statsSummary: { totalAudience: 0, monthlyViews: 0, avgEngagementRate: 0, publishedProjects: 0 }
      });
    } catch (profErr) {
      console.warn('[Register User] Note initializing initial profile:', profErr.message);
    }

    try {
      const CreatorProfile = (await import('../models/CreatorProfile.js')).default;
      const SocialPlatform = (await import('../models/SocialPlatform.js')).default;
      await SocialPlatform.deleteMany({ userId: user._id });
      await CreatorProfile.create({
        userId: user._id,
        socialProfiles: [],
        liveMetrics: {},
        portfolioContent: {},
      });
    } catch (cpErr) {
      console.warn('[Register User] Note initializing empty platforms relationship:', cpErr.message);
    }

    const userObj = user.toObject();
    delete userObj.passwordHash;
    return userObj;
  }

  // Standalone fallback handling
  if (fallbackUsers.has(normalizedEmail)) {
    const error = new Error('An account with this email address already exists. Please sign in or reset your password.');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const mockId = `mock_user_${Date.now()}`;
  
  const newUser = {
    _id: mockId,
    id: mockId,
    name,
    email: normalizedEmail,
    passwordHash,
    role,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    connectedPlatforms: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  fallbackUsers.set(normalizedEmail, newUser);
  
  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
};

export const loginUser = async ({ email, password }) => {
  const dbStatus = checkDbStatus();
  const normalizedEmail = email.toLowerCase().trim();

  if (dbStatus.isConnected) {
    let user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    
    // Auto-create default admin in DB if missing during first login test
    if (!user && (normalizedEmail === 'admin@creator.dev' || normalizedEmail === 'elena@elenavance.dev')) {
      const passwordHash = await User.hashPassword(password || 'password123');
      user = await User.create({
        name: 'Elena Vance',
        email: normalizedEmail,
        passwordHash,
        role: 'ADMIN'
      });
      user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    }

    if (!user) {
      const error = new Error('Invalid email or password credentials');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password credentials');
      error.statusCode = 401;
      throw error;
    }

    const userObj = user.toObject();
    delete userObj.passwordHash;
    return userObj;
  }

  // Standalone fallback handling
  const fallbackUser = fallbackUsers.get(normalizedEmail);
  if (!fallbackUser) {
    const error = new Error('Invalid email or password credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, fallbackUser.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password credentials');
    error.statusCode = 401;
    throw error;
  }

  const { passwordHash: _, ...safeUser } = fallbackUser;
  return safeUser;
};

export const requestPasswordReset = async (email, clientOrigin = null) => {
  const dbStatus = checkDbStatus();
  const normalizedEmail = (email || '').toLowerCase().trim();

  if (!normalizedEmail) {
    const error = new Error('Please provide a valid email address');
    error.statusCode = 400;
    throw error;
  }

  const baseUrl = clientOrigin || process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';

  if (dbStatus.isConnected) {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const error = new Error('No account found with this email address. Please register a new account.');
      error.statusCode = 404;
      throw error;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return {
      email: user.email,
      resetUrl,
      previewUrl: emailResult.previewUrl,
    };
  }

  // Standalone fallback handling
  const fallbackUser = fallbackUsers.get(normalizedEmail);
  if (!fallbackUser) {
    const error = new Error('No account found with this email address. Please register a new account.');
    error.statusCode = 404;
    throw error;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  fallbackUser.resetPasswordToken = hashedToken;
  fallbackUser.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  const emailResult = await sendPasswordResetEmail({
    to: fallbackUser.email,
    name: fallbackUser.name,
    resetUrl,
  });

  return {
    email: fallbackUser.email,
    resetUrl,
    previewUrl: emailResult.previewUrl,
  };
};

export const resetPassword = async ({ token, newPassword }) => {
  if (!token) {
    const error = new Error('Reset token is required');
    error.statusCode = 400;
    throw error;
  }

  if (!newPassword || newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters long');
    error.statusCode = 400;
    throw error;
  }

  const dbStatus = checkDbStatus();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  if (dbStatus.isConnected) {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+passwordHash +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      const error = new Error('Password reset token is invalid or has expired. Please request a new link.');
      error.statusCode = 400;
      throw error;
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpires;
    return userObj;
  }

  // Standalone fallback handling
  let foundUser = null;
  for (const user of fallbackUsers.values()) {
    if (user.resetPasswordToken === hashedToken && user.resetPasswordExpires > Date.now()) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    const error = new Error('Password reset token is invalid or has expired. Please request a new link.');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  foundUser.passwordHash = await bcrypt.hash(newPassword, salt);
  delete foundUser.resetPasswordToken;
  delete foundUser.resetPasswordExpires;

  const { passwordHash: _, ...safeUser } = foundUser;
  return safeUser;
};

export const getFallbackUserById = (userId) => {
  for (const user of fallbackUsers.values()) {
    if (user._id === userId || user.id === userId) {
      const { passwordHash: _, ...safeUser } = user;
      return safeUser;
    }
  }
  return null;
};
