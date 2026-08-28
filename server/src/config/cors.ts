import { CorsOptions } from 'cors';
import { ENV } from './env';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (ENV.CORS_ORIGINS.includes('*') || ENV.CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev/preview container
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};
