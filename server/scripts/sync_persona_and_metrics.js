import mongoose from 'mongoose';
import SocialPlatform from '../models/SocialPlatform.js';
import SocialMetric from '../models/SocialMetric.js';
import { generateAllPortfolioContent } from '../services/aiService.js';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/creator_portfolio');
  console.log('[Script] Connected to MongoDB');

  // 1. Remove mock Instagram
  await SocialPlatform.deleteMany({ username: 'elenacodes.dev' });
  await SocialPlatform.deleteMany({ platform: 'Instagram' });
  console.log('[Script] Removed mock Instagram from SocialPlatform');

  // 2. Clean and synchronize SocialMetric collection
  await SocialMetric.deleteMany({ platform: 'Instagram' });
  await SocialMetric.deleteMany({ handle: { $regex: 'elena', $options: 'i' } });

  // Update YouTube SocialMetric with strictly real metrics
  await SocialMetric.findOneAndUpdate(
    { platform: 'YouTube' },
    {
      platform: 'YouTube',
      handle: '@sowmyashahukari',
      profileUrl: 'https://youtube.com/@sowmyashahukari',
      platformColor: '#ef4444',
      iconName: 'Youtube',
      followers: 0,
      followersLabel: 'Subscribers',
      engagementRate: 0,
      totalViews: 35,
      contentCount: 2,
      weeklyGrowthRate: 0,
      monthlyGrowthRate: 0,
      topContentTitle: 'Funny Craft ideas 💡 (34 views)',
      topContentUrl: 'https://youtube.com/shorts/j9NQEHq-Iqk',
      history: [
        { date: 'Oct 2026', followers: 0, views: 35, engagement: 0 }
      ],
      lastUpdated: new Date()
    },
    { upsert: true }
  );

  // Update GitHub SocialMetric with strictly real metrics
  await SocialMetric.findOneAndUpdate(
    { platform: 'GitHub' },
    {
      platform: 'GitHub',
      handle: 'sowmyass21',
      profileUrl: 'https://github.com/sowmyass21',
      platformColor: '#a855f7',
      iconName: 'Github',
      followers: 0,
      followersLabel: 'Followers',
      engagementRate: 0,
      totalViews: 0,
      contentCount: 9,
      weeklyGrowthRate: 0,
      monthlyGrowthRate: 0,
      topContentTitle: 'AI Learning Assistant & ShopKart',
      topContentUrl: 'https://github.com/sowmyass21',
      history: [
        { date: 'Oct 2026', followers: 0, views: 0, engagement: 0 }
      ],
      lastUpdated: new Date()
    },
    { upsert: true }
  );
  console.log('[Script] Cleaned and synchronized SocialMetric collection');

  // 3. Re-synthesize all 11 sections in aiService
  const sections = await generateAllPortfolioContent('Full-Stack MERN & AI Assistant Engineering');
  console.log(`[Script] Successfully generated ${sections.length} portfolio content sections:`);
  for (const s of sections) {
    console.log(`  - [${s.section}]: ${s.title}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[Script Error]:', err);
  process.exit(1);
});
