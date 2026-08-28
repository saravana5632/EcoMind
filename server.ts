import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/src/routes/index';
import { errorHandler } from './server/src/middleware/errorMiddleware';
import { requestLogger } from './server/src/middleware/loggingMiddleware';
import { apiLimiter } from './server/src/middleware/rateLimitMiddleware';
import { seedInitialAgriData } from './server/src/scripts/seed';
import { logger } from './server/src/utils/logger';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security headers (configured to allow iframe preview and inline scripts/styles)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Middleware
  app.use(cors({ origin: true, credentials: true }));

  // JSON and URL-encoded body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request Logging
  app.use(requestLogger);

  // Rate Limiting
  app.use('/api', apiLimiter);

  // Mount EcoMind Agri Core REST API Router
  app.use('/api', apiRouter);

  // Centralized Error Handling for API routes
  app.use('/api', errorHandler);

  // Seed Firestore in background if required
  seedInitialAgriData().catch((err) => {
    logger.warn('[Server Startup] Initial seed notice:', err?.message || err);
  });

  // Vite Middleware for Development / Static Serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🌾 EcoMind Agri Production Backend listening on http://0.0.0.0:${PORT}`);
    logger.info(`⚡ Connected to Cloud Firestore database via Firebase Admin SDK`);
    logger.info(`📍 Strict 20 KM Geospatial Engine Active on all rental requests`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EcoMind Agri server:', err);
  process.exit(1);
});

