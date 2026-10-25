import mongoose from 'mongoose';

const socialPlatformSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  platform: { 
    type: String, 
    required: true, 
    enum: ['GitHub', 'YouTube', 'Instagram', 'LinkedIn', 'LeetCode', 'CodeChef', 'Substack', 'Twitter/X', 'Twitch', 'TikTok']
  },
  username: { type: String, required: true, trim: true },
  profileUrl: { type: String, required: true, trim: true },
  enabled: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  verifiedAt: { type: Date, default: Date.now },
  lastSynced: { type: Date, default: Date.now },
  syncStatus: { 
    type: String, 
    enum: ['IDLE', 'SYNCING', 'SUCCESS', 'FAILED'], 
    default: 'IDLE' 
  },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  oauth: {
    connectedViaOAuth: { type: Boolean, default: false },
    accessToken: { type: String, select: false }, // Never returned in queries or sent to client
    refreshToken: { type: String, select: false },
    tokenExpiresAt: { type: Date },
    scope: { type: String },
  }
}, {
  timestamps: true
});

// Composite unique index: One platform connection per platform per user
socialPlatformSchema.index({ userId: 1, platform: 1 }, { unique: true });

const SocialPlatform = mongoose.models.SocialPlatform || mongoose.model('SocialPlatform', socialPlatformSchema);
export default SocialPlatform;
