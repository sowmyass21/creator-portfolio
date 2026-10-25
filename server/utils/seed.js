import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import SocialMetric from '../models/SocialMetric.js';
import { MOCK_PROFILE, MOCK_PROJECTS, MOCK_SOCIAL_METRICS } from './mockData.js';

dotenv.config();

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/creator_portfolio';
  
  try {
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected. Clearing existing collections...');

    await Profile.deleteMany({});
    await Project.deleteMany({});
    await SocialMetric.deleteMany({});

    console.log('Seeding fresh records...');
    await Profile.create(MOCK_PROFILE);
    await Project.insertMany(MOCK_PROJECTS);
    await SocialMetric.insertMany(MOCK_SOCIAL_METRICS);

    console.log('✓ Seeding complete successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
