import mongoose from 'mongoose';

const resumeVersionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  versionNumber: {
    type: Number,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
    default: '',
  },
  parsedProfile: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  diffSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      ret.user_id = ret.userId;
      ret.resume_id = ret.resumeId;
      ret.version_number = ret.versionNumber;
      ret.extracted_text = ret.extractedText;
      ret.parsed_profile = ret.parsedProfile;
      ret.created_at = ret.createdAt;
      ret.updated_at = ret.updatedAt;
      return ret;
    }
  }
});

const ResumeVersion = mongoose.models.ResumeVersion || mongoose.model('ResumeVersion', resumeVersionSchema);
export default ResumeVersion;
