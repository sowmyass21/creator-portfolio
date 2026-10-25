import mongoose from 'mongoose';

const projectMetricSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  change: { type: String },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Web Application', 'AI & Data Science', 'Content Platform', 'Open Source', 'UI/UX Design', 'Mobile App']
  },
  tags: [{ type: String }],
  thumbnailUrl: { type: String, required: true },
  demoUrl: { type: String },
  githubUrl: { type: String },
  articleUrl: { type: String },
  featured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'archived', 'in-development'], default: 'completed' },
  metrics: [projectMetricSchema],
  publishedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Composite unique index: slug is unique per user
projectSchema.index({ userId: 1, slug: 1 }, { unique: true });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default Project;
