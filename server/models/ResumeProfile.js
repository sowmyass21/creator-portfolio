import mongoose from 'mongoose';

const resumeProfileSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parserVersion: {
    type: String,
    default: 'v2.0-ai',
  },
  profileData: {
    personal_information: {
      full_name: { type: String, default: null },
      professional_title: { type: String, default: null },
      email: { type: String, default: null },
      phone: { type: String, default: null },
      location: { type: String, default: null },
      profile_photo: { type: String, default: null },
      website: { type: String, default: null },
      linkedin: { type: String, default: null },
      github: { type: String, default: null },
      other_links: [{ type: String }],
    },
    summary: {
      professional_summary: { type: String, default: null },
    },
    education: [{
      institution: { type: String, default: null },
      degree: { type: String, default: null },
      field_of_study: { type: String, default: null },
      start_date: { type: String, default: null },
      end_date: { type: String, default: null },
      location: { type: String, default: null },
      grade: { type: String, default: null },
      description: { type: String, default: null },
    }],
    experience: [{
      company: { type: String, default: null },
      job_title: { type: String, default: null },
      location: { type: String, default: null },
      employment_type: { type: String, default: null },
      start_date: { type: String, default: null },
      end_date: { type: String, default: null },
      currently_working: { type: Boolean, default: false },
      description: { type: String, default: null },
      achievements: [{ type: String }],
      technologies: [{ type: String }],
    }],
    projects: [{
      name: { type: String, default: null },
      description: { type: String, default: null },
      technologies: [{ type: String }],
      features: [{ type: String }],
      role: { type: String, default: null },
      live_url: { type: String, default: null },
      github_url: { type: String, default: null },
      achievements: [{ type: String }],
    }],
    skills: {
      programming_languages: [{ type: String }],
      frontend: [{ type: String }],
      backend: [{ type: String }],
      databases: [{ type: String }],
      frameworks: [{ type: String }],
      cloud: [{ type: String }],
      devops: [{ type: String }],
      tools: [{ type: String }],
      ai_ml: [{ type: String }],
      other: [{ type: String }],
    },
    certifications: [{
      name: { type: String, default: null },
      issuer: { type: String, default: null },
      date: { type: String, default: null },
      credential_url: { type: String, default: null },
    }],
    achievements: [{
      title: { type: String, default: null },
      description: { type: String, default: null },
      organization: { type: String, default: null },
      date: { type: String, default: null },
    }],
    publications: [{
      title: { type: String, default: null },
      publisher: { type: String, default: null },
      date: { type: String, default: null },
      url: { type: String, default: null },
    }],
    volunteering: [{
      organization: { type: String, default: null },
      role: { type: String, default: null },
      description: { type: String, default: null },
      start_date: { type: String, default: null },
      end_date: { type: String, default: null },
    }],
    interests: [{ type: String }],
    languages: [{
      language: { type: String, default: null },
      proficiency: { type: String, default: null },
    }],
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      ret.resume_id = ret.resumeId;
      ret.user_id = ret.userId;
      ret.profile_data = ret.profileData;
      ret.parser_version = ret.parserVersion;
      ret.created_at = ret.createdAt;
      ret.updated_at = ret.updatedAt;
      return ret;
    }
  }
});

const ResumeProfile = mongoose.models.ResumeProfile || mongoose.model('ResumeProfile', resumeProfileSchema);
export default ResumeProfile;
