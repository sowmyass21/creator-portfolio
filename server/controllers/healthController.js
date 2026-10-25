import { sendSuccess } from '../utils/responseHandler.js';
import { checkDbStatus } from '../services/dbService.js';

export const getHealth = async (req, res, next) => {
  try {
    const dbStatus = checkDbStatus();
    
    const healthData = {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'Creator Portfolio & Metric Aggregator API',
      version: '1.0.0',
      database: {
        connected: dbStatus.isConnected,
        status: dbStatus.isConnected ? 'Connected' : 'Standalone / Fallback Mode',
        host: dbStatus.host,
        name: dbStatus.database
      }
    };

    return sendSuccess(res, healthData, 'API Service is up and operational', 200);
  } catch (error) {
    next(error);
  }
};
