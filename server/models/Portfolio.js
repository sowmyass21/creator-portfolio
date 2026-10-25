import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  theme: {
    type: String,
    default: 'modern',
  },
  profile: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  about: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  skills: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  experience: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  projects: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  education: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  certifications: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  achievements: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  publications: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  socialLinks: [{
    platform: { type: String },
    url: { type: String },
  }],
  visibility: {
    type: String,
    enum: ['PUBLIC', 'PRIVATE'],
    default: 'PRIVATE',
  },
  published: {
    type: Boolean,
    default: false,
  },
  displayName: {
    type: String,
    default: '',
  },
  headline: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  profileData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  sections: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  customization: {
    primaryColor: { type: String, default: '#6366f1' },
    accentColor: { type: String, default: '#ec4899' },
    fontStyle: { type: String, default: 'Inter' },
    showMetrics: { type: Boolean, default: true },
    sectionOrder: [{ type: String }],
    hiddenSections: [{ type: String }],
  },
  enhancedContent: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const isPub = Boolean(ret.published || ret.status === 'PUBLISHED');

      ret.id = ret._id;
      ret.userId = ret.userId;
      ret.resumeId = ret.resumeId;
      ret.slug = ret.slug;
      ret.theme = ret.theme || 'modern';
      ret.published = isPub;
      ret.visibility = isPub ? 'PUBLIC' : 'PRIVATE';
      
      ret.profile = ret.profile && Object.keys(ret.profile).length > 0 ? ret.profile : {
        name: ret.displayName,
        professionalTitle: ret.headline,
        shortIntro: ret.bio,
      };
      ret.about = ret.about && Object.keys(ret.about).length > 0 ? ret.about : (ret.sections?.about || {});
      ret.skills = ret.skills || (ret.sections?.skills || {});
      ret.experience = Array.isArray(ret.experience) && ret.experience.length > 0 ? ret.experience : (ret.sections?.experience || []);
      ret.projects = Array.isArray(ret.projects) && ret.projects.length > 0 ? ret.projects : (ret.sections?.projects || []);
      ret.education = Array.isArray(ret.education) && ret.education.length > 0 ? ret.education : (ret.sections?.education || []);
      ret.certifications = Array.isArray(ret.certifications) && ret.certifications.length > 0 ? ret.certifications : (ret.sections?.certifications || []);
      ret.achievements = Array.isArray(ret.achievements) && ret.achievements.length > 0 ? ret.achievements : (ret.sections?.achievements || []);
      ret.publications = Array.isArray(ret.publications) && ret.publications.length > 0 ? ret.publications : (ret.sections?.publications || []);
      ret.socialLinks = ret.socialLinks || ret.social_links || [];
      
      ret.createdAt = ret.createdAt;
      ret.updatedAt = ret.updatedAt;
      return ret;
    }
  }
});

const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
