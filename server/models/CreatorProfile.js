import mongoose from 'mongoose';

const socialProfileSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['GitHub', 'YouTube', 'LinkedIn', 'Twitter', 'Portfolio', 'Other'],
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  handle: {
    type: String,
    trim: true,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  autoDetectedFromResume: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED'],
    default: 'PENDING_CONFIRMATION',
  },
  confirmedAt: {
    type: Date,
    default: null,
  },
}, { _id: true });

const creatorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null,
  },
  resumeData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  socialProfiles: [socialProfileSchema],
  liveMetrics: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  portfolioContent: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  lastSynced: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const CreatorProfile = mongoose.models.CreatorProfile || mongoose.model('CreatorProfile', creatorProfileSchema);
export default CreatorProfile;
