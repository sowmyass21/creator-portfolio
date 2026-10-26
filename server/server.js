import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { connectDB } from './services/dbService.js';
import { initCronScheduler } from './services/syncService.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api';

// Security middleware with Helmet
app.use(helmet());

// MongoDB query injection sanitizer
app.use(mongoSanitize());

// Cookie parser for reading HTTP-only authentication tokens
app.use(cookieParser(process.env.COOKIE_SECRET || 'super_secret_cookie_parser_key_2026'));

// Cross-Origin Resource Sharing (CORS) with HTTP-only cookie support
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or non-browser tools (curl, postman, server tasks)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth-token', 'Accept', 'Origin'],
  credentials: true,
};
app.use(cors(corsOptions));


// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom Request Logger
app.use(requestLogger);

// Mount REST API Routes
app.use(API_PREFIX, apiRoutes);

// Root route welcome message
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Creator Social Metric Aggregator & Portfolio Builder API v10',
    healthCheck: `${API_PREFIX}/health`,
    syncStatus: `${API_PREFIX}/sync/status`,
    authEndpoints: `${API_PREFIX}/auth`,
    documentation: 'Refer to /api endpoints for Profile, Metrics, Projects, Auth, Integrations, AI, and Sync'
  });
});

// Handle 404 routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// Start server after DB connection check and start Node-Cron scheduler
const startServer = async () => {
  await connectDB();
  
  // Initialize Automated Node-Cron Metric Scheduler
  initCronScheduler();
  
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
    console.log(`❤️ Health Check: http://localhost:${PORT}${API_PREFIX}/health`);
    console.log(`🔄 Sync Endpoint: http://localhost:${PORT}${API_PREFIX}/sync/status`);
    console.log(`==================================================`);
  });
};

startServer();

export default app;
