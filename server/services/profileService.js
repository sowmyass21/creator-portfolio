import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { checkDbStatus } from './dbService.js';

export const generateUniqueProfileHandle = async (baseName, excludeUserId = null) => {
  let cleaned = (baseName || 'creator').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleaned) cleaned = 'creator';
  let candidate = `@${cleaned}`;

  let existing = await Profile.findOne({ 
    handle: candidate, 
    ...(excludeUserId ? { userId: { $ne: excludeUserId } } : {}) 
  });
  if (!existing) {
    return candidate;
  }

  let attempts = 0;
  while (existing && attempts < 10) {
    const suffix = Math.random().toString(16).substring(2, 6);
    candidate = `@${cleaned}_${suffix}`;
    existing = await Profile.findOne({ handle: candidate });
    attempts++;
  }
  return candidate;
};

export const getCreatorProfile = async (userId = null) => {
  if (!userId) {
    throw new Error('Authentication required to access creator profile');
  }

  const dbStatus = checkDbStatus();
  
  if (dbStatus.isConnected) {
    try {
      let profile = await Profile.findOne({ userId }).select('-__v');
      if (profile) {
        return profile;
      }

      // If profile is not found, check if user has extracted Resume data to auto-fill
      const Resume = (await import('../models/Resume.js')).default;
      const resume = await Resume.findOne({ userId }).sort({ updatedAt: -1 });
      const structured = resume?.structuredData || resume?.parsedData;
      
      const userDoc = await User.findById(userId).lean();
      const defaultName = userDoc?.name || 'Creator';
      const defaultEmail = userDoc?.email || '';
      const uniqueHandle = await generateUniqueProfileHandle(defaultName, userId);

      if (structured) {
        const pInfo = structured.personalInformation || structured.personal_information || structured;
        const pSum = structured.professionalSummary || structured.summary || {};
        const autoData = {
          userId,
          fullName: pInfo.name || pInfo.full_name || defaultName,
          handle: uniqueHandle,
          tagline: pInfo.title || pInfo.professionalTitle || pInfo.professional_title || 'Software Engineer',
          bio: typeof pSum === 'string' ? pSum : (pSum.summary || pSum.professional_summary || structured.bio || ''),
          location: pInfo.location || '',
          website: pInfo.portfolio || pInfo.website || '',
          email: pInfo.email || defaultEmail,
          avatarUrl: userDoc?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
          socialLinks: [
            pInfo.github ? { platform: 'GitHub', url: pInfo.github, handle: pInfo.github.split('/').pop() } : null,
            pInfo.linkedIn || pInfo.linkedin ? { platform: 'LinkedIn', url: pInfo.linkedIn || pInfo.linkedin, handle: (pInfo.linkedIn || pInfo.linkedin).split('/').pop() } : null,
          ].filter(Boolean),
          skills: (Array.isArray(structured.skills) ? structured.skills : Object.values(structured.skills || {}).flat()).map(s => ({
            name: typeof s === 'string' ? s : (s.name || ''),
            category: 'Technical',
            proficiency: 85,
            featured: true,
          })).filter(s => s.name),
          statsSummary: {
            totalAudience: 0,
            monthlyViews: 0,
            avgEngagementRate: 0,
            publishedProjects: 0,
          }
        };

        const populatedProfile = await Profile.findOneAndUpdate(
          { userId },
          { $set: autoData },
          { new: true, upsert: true }
        ).select('-__v');
        return populatedProfile;
      }

      // Clean empty profile initialized for this user
      const cleanProfile = await Profile.findOneAndUpdate(
        { userId },
        {
          $setOnInsert: {
            userId,
            fullName: defaultName,
            handle: uniqueHandle,
            tagline: '',
            bio: '',
            email: defaultEmail,
            avatarUrl: userDoc?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
            location: '',
            website: '',
            skills: [],
            socialLinks: [],
            statsSummary: {
              totalAudience: 0,
              monthlyViews: 0,
              avgEngagementRate: 0,
              publishedProjects: 0,
            }
          }
        },
        { new: true, upsert: true }
      ).select('-__v');

      return cleanProfile;
    } catch (err) {
      console.warn('[ProfileService] DB error finding user profile:', err.message);
      throw err;
    }
  }

  // Fallback for standalone when DB is disconnected
  return {
    userId,
    fullName: 'Creator',
    handle: '@creator',
    tagline: '',
    bio: '',
    email: '',
    skills: [],
    socialLinks: [],
    statsSummary: { totalAudience: 0, monthlyViews: 0, avgEngagementRate: 0, publishedProjects: 0 }
  };
};

export const updateCreatorProfile = async (updateData, userId = null) => {
  if (!userId) {
    throw new Error('Authentication required to update creator profile');
  }

  const dbStatus = checkDbStatus();

  if (dbStatus.isConnected) {
    try {
      const sanitized = { ...updateData };
      delete sanitized._id;
      delete sanitized.id;
      delete sanitized.__v;
      sanitized.userId = userId;

      const savedProfile = await Profile.findOneAndUpdate(
        { userId },
        { $set: sanitized },
        { new: true, upsert: true, runValidators: true }
      ).select('-__v');

      // Sync changes into user's Portfolio document so live preview updates immediately
      try {
        const Portfolio = (await import('../models/Portfolio.js')).default;
        const { generateUniqueSlug } = await import('../controllers/portfolioController.js');

        let portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
          const baseSlug = (sanitized.fullName || 'creator').toLowerCase().replace(/[^a-z0-9]/g, '');
          const slug = await generateUniqueSlug(baseSlug || 'creator');
          portfolio = new Portfolio({
            userId,
            slug,
            displayName: `${sanitized.fullName || 'Creator'}'s Portfolio`,
            theme: 'modern',
            headline: sanitized.tagline || '',
            bio: sanitized.bio || '',
            visibility: 'PUBLIC',
            published: true,
            status: 'PUBLISHED',
          });
        }

        portfolio.displayName = sanitized.fullName || portfolio.displayName;
        portfolio.headline = sanitized.tagline || portfolio.headline;
        portfolio.bio = sanitized.bio || portfolio.bio;

        const socialLinksList = Array.isArray(sanitized.socialLinks)
          ? sanitized.socialLinks.map(s => ({ platform: s.platform, url: s.url }))
          : (portfolio.socialLinks || []);

        portfolio.socialLinks = socialLinksList;

        portfolio.profile = {
          ...(portfolio.profile || {}),
          name: sanitized.fullName,
          professionalTitle: sanitized.tagline,
          shortIntro: sanitized.bio,
          avatarUrl: sanitized.avatarUrl,
          location: sanitized.location,
          website: sanitized.website,
          availability: sanitized.availability,
          socialLinks: socialLinksList,
        };

        if (Array.isArray(sanitized.skills) && sanitized.skills.length > 0) {
          const groups = {};
          sanitized.skills.forEach(sk => {
            const cat = sk.category || 'Core Technical Skills';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(sk.name);
          });
          portfolio.skills = Object.entries(groups).map(([category, items]) => ({ category, items }));
        }

        portfolio.sections = {
          ...(portfolio.sections || {}),
          hero: {
            ...(portfolio.sections?.hero || {}),
            headline: sanitized.fullName,
            subheadline: sanitized.tagline,
            avatarUrl: sanitized.avatarUrl,
          },
          about: {
            ...(portfolio.sections?.about || {}),
            bio: sanitized.bio,
            professionalSummary: sanitized.bio,
          },
          contact: {
            ...(portfolio.sections?.contact || {}),
            location: sanitized.location,
            website: sanitized.website,
            socialLinks: socialLinksList,
          },
          skills: portfolio.skills,
        };

        portfolio.markModified('profile');
        portfolio.markModified('about');
        portfolio.markModified('skills');
        portfolio.markModified('sections');
        portfolio.markModified('socialLinks');

        await portfolio.save();
        console.log(`[ProfileService] Synced profile changes to Portfolio ${portfolio._id} for user ${userId}`);
      } catch (pErr) {
        console.warn('[ProfileService] Error syncing to Portfolio:', pErr.message);
      }

      return savedProfile;
    } catch (err) {
      console.warn('[ProfileService] DB update error:', err.message);
      throw err;
    }
  }

  return { userId, ...updateData };
};
