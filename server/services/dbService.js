import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import SocialMetric from '../models/SocialMetric.js';
import User from '../models/User.js';
import { MOCK_PROFILE, MOCK_PROJECTS, MOCK_SOCIAL_METRICS } from '../utils/mockData.js';

let isDbConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/creator_portfolio';
  
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    
    isDbConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    
    // Auto-seed if collections are empty
    await autoSeedIfEmpty();
    
    return true;
  } catch (error) {
    isDbConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${mongoUri}. Operating in Standalone Mock Mode.`);
    console.warn(`[MongoDB Error Details]: ${error.message}`);
    return false;
  }
};

export const checkDbStatus = () => {
  const connected = isDbConnected || mongoose.connection.readyState === 1;
  return {
    isConnected: connected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'N/A',
    database: mongoose.connection.name || 'creator_portfolio'
  };
};

export const autoSeedIfEmpty = async () => {
  if (!isDbConnected) return;

  try {
    const profileCount = await Profile.countDocuments();
    if (profileCount === 0) {
      console.log('[Seed] Seeding initial Profile data...');
      await Profile.create(MOCK_PROFILE);
    }

    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log('[Seed] Seeding initial Projects data...');
      await Project.insertMany(MOCK_PROJECTS);
    }

    const metricCount = await SocialMetric.countDocuments();
    if (metricCount === 0) {
      console.log('[Seed] Seeding initial Social Metrics data...');
      await SocialMetric.insertMany(MOCK_SOCIAL_METRICS);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Seed] Seeding default Admin user...');
      const passwordHash = await User.hashPassword('password123');
      await User.create({
        name: 'Elena Vance',
        email: 'admin@creator.dev',
        passwordHash,
        role: 'ADMIN'
      });
      await User.create({
        name: 'Elena Vance',
        email: 'elena@elenavance.dev',
        passwordHash,
        role: 'ADMIN'
      });
    }

    console.log('[Seed] Auto-seed check complete.');
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
};

