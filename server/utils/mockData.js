/**
 * Initial Seed & Mock Data for Creator Social Aggregator & Portfolio Builder
 */

export const MOCK_PROFILE = {
  fullName: "Elena Vance",
  handle: "@elenacodes",
  tagline: "Full-Stack Creator, Tech Educator & Open Source Architect",
  bio: "Building high-performance web systems and educating 250K+ developers world-wide on modern software engineering, AI tooling, and cloud architecture.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
  coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
  email: "elena@elenavance.dev",
  location: "San Francisco, CA & Remote",
  availability: "Open for Keynotes, Technical Consulting & Advisory",
  website: "https://elenavance.dev",
  skills: [
    { name: "React & Next.js", category: "Frontend", proficiency: 96, featured: true },
    { name: "Node.js & Express", category: "Backend", proficiency: 94, featured: true },
    { name: "MongoDB & Distributed DBs", category: "Backend", proficiency: 90, featured: true },
    { name: "Tailwind CSS & Design Systems", category: "UI/UX", proficiency: 98, featured: true },
    { name: "TypeScript & Microservices", category: "Architecture", proficiency: 92, featured: true },
    { name: "Technical Content Creation", category: "Media", proficiency: 95, featured: true }
  ],
  socialLinks: [
    { platform: "YouTube", url: "https://youtube.com/@elenacodes", handle: "@elenacodes", icon: "Youtube" },
    { platform: "Twitter/X", url: "https://x.com/elenacodes", handle: "@elenacodes", icon: "Twitter" },
    { platform: "GitHub", url: "https://github.com/elenacodes", handle: "elenacodes", icon: "Github" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/elenacodes", handle: "in/elenacodes", icon: "Linkedin" },
    { platform: "Substack", url: "https://elenacodes.substack.com", handle: "elenacodes.substack.com", icon: "Mail" }
  ],
  branding: {
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    accentColor: "#ec4899",
    theme: "dark"
  },
  statsSummary: {
    totalAudience: 384500,
    monthlyViews: 1250000,
    avgEngagementRate: 6.8,
    publishedProjects: 14
  }
};

export const MOCK_PROJECTS = [
  {
    title: "PulseAnalytics Dashboard",
    slug: "pulse-analytics-dashboard",
    summary: "Real-time creator revenue and audience retention analytics platform with predictive AI forecasting.",
    description: "PulseAnalytics transforms raw API streams from YouTube, Twitch, and Stripe into unified growth intelligence. Built with React, Express, MongoDB, and Recharts, it features real-time WebSocket metrics updates.",
    category: "Web Application",
    tags: ["React", "Express.js", "MongoDB", "Tailwind CSS", "WebSockets"],
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    demoUrl: "https://pulse-analytics-demo.dev",
    githubUrl: "https://github.com/elenacodes/pulse-analytics",
    articleUrl: "https://elenacodes.substack.com/p/building-pulse-analytics",
    featured: true,
    displayOrder: 1,
    status: "completed",
    metrics: [
      { label: "Active Users", value: "18.4K", change: "+24% mo" },
      { label: "Daily Data Points", value: "2.1M", change: "Real-time" },
      { label: "GitHub Stars", value: "1.4K", change: "Top 5%" }
    ],
    publishedAt: new Date("2026-08-15")
  },
  {
    title: "MERN Stack Design System & UI Components",
    slug: "mern-stack-design-system",
    summary: "Production-ready accessible glassmorphic component library for full-stack React applications.",
    description: "An open-source design system engineered specifically for high-conversion creator portfolios and tech SaaS applications. Features 45+ customizable React components with fluid dark mode support.",
    category: "Open Source",
    tags: ["React", "Tailwind CSS", "JavaScript", "Design System", "Storybook"],
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800",
    demoUrl: "https://mern-design-system.dev",
    githubUrl: "https://github.com/elenacodes/mern-design-system",
    featured: true,
    displayOrder: 2,
    status: "completed",
    metrics: [
      { label: "NPM Downloads", value: "45.2K/mo", change: "+32%" },
      { label: "GitHub Stars", value: "3.2K", change: "Trending" }
    ],
    publishedAt: new Date("2026-07-10")
  },
  {
    title: "AI Prompt Studio for Technical Writers",
    slug: "ai-prompt-studio",
    summary: "LLM-assisted code snippet generator and technical blog post optimizer.",
    description: "An interactive web app that helps technical creators draft documentation, refine code explanations, and optimize technical articles for developer SEO.",
    category: "AI & Data Science",
    tags: ["React", "Node.js", "Express", "OpenAI API", "Tailwind CSS"],
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    demoUrl: "https://ai-prompt-studio.dev",
    githubUrl: "https://github.com/elenacodes/ai-prompt-studio",
    featured: true,
    displayOrder: 3,
    status: "active",
    metrics: [
      { label: "Prompts Processed", value: "850K+", change: "Growing" },
      { label: "User Rating", value: "4.9/5", change: "High satisfaction" }
    ],
    publishedAt: new Date("2026-06-01")
  },
  {
    title: "CreatorOps - Workflow Automation Tool",
    slug: "creatorops-workflow-automation",
    summary: "Automated social cross-posting and subscriber sync pipeline.",
    description: "A lightweight microservice suite connecting YouTube webhooks, Substack subscriber feeds, and GitHub activity into a single dynamic profile builder.",
    category: "Content Platform",
    tags: ["Node.js", "Express", "MongoDB", "REST API", "Docker"],
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    demoUrl: "https://creatorops-app.dev",
    githubUrl: "https://github.com/elenacodes/creator-ops",
    featured: false,
    displayOrder: 4,
    status: "completed",
    metrics: [
      { label: "Webhooks Processed", value: "500K/day", change: "99.9% uptime" }
    ],
    publishedAt: new Date("2026-04-20")
  }
];

export const MOCK_SOCIAL_METRICS = [
  {
    platform: "YouTube",
    handle: "@elenacodes",
    profileUrl: "https://youtube.com/@elenacodes",
    platformColor: "#ef4444",
    iconName: "Youtube",
    followers: 185000,
    followersLabel: "Subscribers",
    engagementRate: 8.4,
    totalViews: 9400000,
    contentCount: 142,
    weeklyGrowthRate: 2.8,
    monthlyGrowthRate: 11.2,
    topContentTitle: "Mastering MERN Stack Architecture (2026 Crash Course)",
    topContentUrl: "https://youtube.com/watch?v=demo123",
    history: [
      { date: "May 2026", followers: 155000, views: 7200000, engagement: 7.8 },
      { date: "Jun 2026", followers: 162000, views: 7800000, engagement: 8.0 },
      { date: "Jul 2026", followers: 171000, views: 8400000, engagement: 8.1 },
      { date: "Aug 2026", followers: 178000, views: 8900000, engagement: 8.3 },
      { date: "Sep 2026", followers: 185000, views: 9400000, engagement: 8.4 }
    ],
    lastUpdated: new Date()
  },
  {
    platform: "Twitter/X",
    handle: "@elenacodes",
    profileUrl: "https://x.com/elenacodes",
    platformColor: "#38bdf8",
    iconName: "Twitter",
    followers: 94500,
    followersLabel: "Followers",
    engagementRate: 6.2,
    totalViews: 4200000,
    contentCount: 1840,
    weeklyGrowthRate: 1.9,
    monthlyGrowthRate: 8.5,
    topContentTitle: "10 React Performance Tricks Every Senior Developer Uses",
    topContentUrl: "https://x.com/elenacodes/status/123456789",
    history: [
      { date: "May 2026", followers: 81000, views: 3100000, engagement: 5.8 },
      { date: "Jun 2026", followers: 85000, views: 3400000, engagement: 5.9 },
      { date: "Jul 2026", followers: 88500, views: 3700000, engagement: 6.0 },
      { date: "Aug 2026", followers: 91200, views: 3950000, engagement: 6.1 },
      { date: "Sep 2026", followers: 94500, views: 4200000, engagement: 6.2 }
    ],
    lastUpdated: new Date()
  },
  {
    platform: "GitHub",
    handle: "elenacodes",
    profileUrl: "https://github.com/elenacodes",
    platformColor: "#a855f7",
    iconName: "Github",
    followers: 42000,
    followersLabel: "Followers",
    engagementRate: 9.1,
    totalViews: 1800000,
    contentCount: 88,
    weeklyGrowthRate: 3.4,
    monthlyGrowthRate: 14.1,
    topContentTitle: "mern-stack-design-system (3.2K Stars)",
    topContentUrl: "https://github.com/elenacodes/mern-design-system",
    history: [
      { date: "May 2026", followers: 32000, views: 1200000, engagement: 8.5 },
      { date: "Jun 2026", followers: 34500, views: 1350000, engagement: 8.7 },
      { date: "Jul 2026", followers: 37000, views: 1500000, engagement: 8.9 },
      { date: "Aug 2026", followers: 39500, views: 1650000, engagement: 9.0 },
      { date: "Sep 2026", followers: 42000, views: 1800000, engagement: 9.1 }
    ],
    lastUpdated: new Date()
  },
  {
    platform: "Substack",
    handle: "elenacodes.substack.com",
    profileUrl: "https://elenacodes.substack.com",
    platformColor: "#f97316",
    iconName: "Mail",
    followers: 63000,
    followersLabel: "Subscribers",
    engagementRate: 48.5, // Email open rate
    totalViews: 650000,
    contentCount: 64,
    weeklyGrowthRate: 2.1,
    monthlyGrowthRate: 9.2,
    topContentTitle: "Architecting Full-Stack Applications for 1M+ Users",
    topContentUrl: "https://elenacodes.substack.com/p/architecting-full-stack",
    history: [
      { date: "May 2026", followers: 51000, views: 480000, engagement: 46.2 },
      { date: "Jun 2026", followers: 54000, views: 520000, engagement: 47.0 },
      { date: "Jul 2026", followers: 57500, views: 570000, engagement: 47.5 },
      { date: "Aug 2026", followers: 60200, views: 610000, engagement: 48.1 },
      { date: "Sep 2026", followers: 63000, views: 650000, engagement: 48.5 }
    ],
    lastUpdated: new Date()
  }
];
