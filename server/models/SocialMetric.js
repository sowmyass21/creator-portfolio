import mongoose from 'mongoose';

const historyDataPointSchema = new mongoose.Schema({
  date: { type: String, required: true },
  followers: { type: Number, required: true },
  views: { type: Number, default: 0 },
  engagement: { type: Number, default: 0 }
}, { _id: false });

const socialMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  platform: { 
    type: String, 
    required: true, 
    enum: ['YouTube', 'Twitter/X', 'Instagram', 'GitHub', 'LinkedIn', 'LeetCode', 'CodeChef', 'Substack', 'Twitch', 'TikTok']
  },
  handle: { type: String, required: true },
  profileUrl: { type: String, required: true },
  platformColor: { type: String, default: '#6366f1' },
  iconName: { type: String, default: 'Share2' },
  followers: { type: Number, required: true, default: 0 },
  followersLabel: { type: String, default: 'Subscribers' },
  engagementRate: { type: Number, required: true, default: 0 },
  totalViews: { type: Number, default: 0 },
  contentCount: { type: Number, default: 0 },
  weeklyGrowthRate: { type: Number, default: 0 },
  monthlyGrowthRate: { type: Number, default: 0 },
  topContentTitle: { type: String },
  topContentUrl: { type: String },
  history: [historyDataPointSchema],
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Composite unique index: One metric per platform per user
socialMetricSchema.index({ userId: 1, platform: 1 }, { unique: true });

const SocialMetric = mongoose.models.SocialMetric || mongoose.model('SocialMetric', socialMetricSchema);
export default SocialMetric;
