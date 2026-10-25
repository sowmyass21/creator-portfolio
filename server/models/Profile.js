import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  handle: { type: String },
  icon: { type: String },
}, { _id: false });

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  proficiency: { type: Number, min: 1, max: 100, default: 85 },
  featured: { type: Boolean, default: false }
}, { _id: false });

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  fullName: { type: String, required: true, trim: true },
  handle: { type: String, required: true, trim: true },
  tagline: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600' },
  coverImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200' },
  email: { type: String, required: true, trim: true, lowercase: true },
  location: { type: String, default: 'San Francisco, CA & Remote' },
  availability: { type: String, default: 'Available for Select Projects & Collaborations' },
  website: { type: String },
  skills: [skillSchema],
  socialLinks: [socialLinkSchema],
  branding: {
    primaryColor: { type: String, default: '#6366f1' },
    secondaryColor: { type: String, default: '#8b5cf6' },
    accentColor: { type: String, default: '#ec4899' },
    theme: { type: String, enum: ['dark', 'light', 'glassmorphism'], default: 'dark' }
  },
  statsSummary: {
    totalAudience: { type: Number, default: 0 },
    monthlyViews: { type: Number, default: 0 },
    avgEngagementRate: { type: Number, default: 0 },
    publishedProjects: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
export default Profile;
