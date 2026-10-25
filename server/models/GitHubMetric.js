import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  language: { type: String, default: 'JavaScript' },
  topics: [{ type: String }],
  repositoryUrl: { type: String, required: true },
  homepage: { type: String, default: '' },
  updatedAt: { type: Date }
}, { _id: false });

const languageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  count: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 }
}, { _id: false });

const gitHubMetricSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  avatar: { type: String },
  bio: { type: String },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  publicRepositories: { type: Number, default: 0 },
  publicGists: { type: Number, default: 0 },
  accountCreatedAt: { type: Date },
  totalStars: { type: Number, default: 0 },
  totalForks: { type: Number, default: 0 },
  topLanguages: [languageSchema],
  popularRepositories: [repoSchema],
  lastFetchedAt: { type: Date, default: Date.now },
  source: { type: String, enum: ['LIVE_API', 'DATABASE_CACHE', 'FALLBACK_MOCK'], default: 'LIVE_API' }
}, {
  timestamps: true
});

const GitHubMetric = mongoose.models.GitHubMetric || mongoose.model('GitHubMetric', gitHubMetricSchema);
export default GitHubMetric;
