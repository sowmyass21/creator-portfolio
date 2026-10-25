import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnailUrl: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  videoUrl: { type: String, required: true }
}, { _id: false });

const youtubeMetricSchema = new mongoose.Schema({
  channelId: { type: String, required: true, unique: true, trim: true },
  channelName: { type: String, required: true },
  customUrl: { type: String, default: '@elenacodes' },
  profileImage: { type: String },
  subscriberCount: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  videoCount: { type: Number, default: 0 },
  latestVideos: [videoSchema],
  lastFetchedAt: { type: Date, default: Date.now },
  source: { type: String, enum: ['LIVE_API', 'DATABASE_CACHE', 'FALLBACK_MOCK'], default: 'LIVE_API' }
}, {
  timestamps: true
});

const YouTubeMetric = mongoose.models.YouTubeMetric || mongoose.model('YouTubeMetric', youtubeMetricSchema);
export default YouTubeMetric;
