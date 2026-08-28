import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './server/routes/authRoutes';
import { landRouter } from './server/routes/landRoutes';
import { rentalRouter } from './server/routes/rentalRoutes';
import { adminRouter } from './server/routes/adminRoutes';
import { notificationRouter } from './server/routes/notificationRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Request Logger for transparency
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.path.startsWith('/api')) {
        console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'LandLink Agricultural Land Rental Platform API',
      timestamp: new Date().toISOString(),
      geoConstraint: '20 KM strict proximity',
    });
  });

  // REST API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/lands', landRouter);
  app.use('/api/rentals', rentalRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/notifications', notificationRouter);

  // Central Error Handler for APIs
  app.use('/api/*', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Error]', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error occurred.',
    });
  });

  // Vite Middleware for Development / Static serving for Production
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
    console.log(`🌾 LandLink Agricultural Server running on http://0.0.0.0:${PORT}`);
    console.log(`📍 20 KM Geolocation Filter engine initialized.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start LandLink server:', err);
  process.exit(1);
});
