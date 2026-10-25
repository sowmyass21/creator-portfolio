import mongoose from 'mongoose';

const generatedContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: [
        'headline',
        'bio',
        'about',
        'project_descriptions',
        'featured_summaries',
        'achievements',
        'social_proof',
        'skills_matrix',
        'education_background',
        'experience_internship',
        'certifications_credentials'
      ]
    },
    title: {
      type: String,
      required: true
    },
    generatedContent: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    sourceData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    approved: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    }
  },
  {
    timestamps: true
  }
);

// Composite unique index for fast query by user and section
generatedContentSchema.index({ userId: 1, section: 1 }, { unique: true });
generatedContentSchema.index({ userId: 1, approved: 1 });

const GeneratedContent = mongoose.model('GeneratedContent', generatedContentSchema);

export default GeneratedContent;
