import { Router } from 'express';
import authRoutes from './authRoutes';
import farmerRoutes from './farmerRoutes';
import landlordRoutes from './landlordRoutes';
import landRoutes from './landRoutes';
import rentalRoutes from './rentalRoutes';
import farmingRoutes from './farmingRoutes';
import aiRoutes from './aiRoutes';
import whatIfRoutes from './whatIfRoutes';
import comparisonRoutes from './comparisonRoutes';
import resourceRoutes from './resourceRoutes';
import productRoutes from './productRoutes';
import buyerRoutes from './buyerRoutes';
import notificationRoutes from './notificationRoutes';
import analyticsRoutes from './analyticsRoutes';
import adminRoutes from './adminRoutes';

const apiRouter = Router();

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EcoMind Agri Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    firebase: 'connected',
  });
});

// Mount modules
apiRouter.use('/auth', authRoutes);
apiRouter.use('/farmer', farmerRoutes);
apiRouter.use('/farmers', farmerRoutes);
apiRouter.use('/landlord', landlordRoutes);
apiRouter.use('/landlords', landlordRoutes);
apiRouter.use('/lands', landRoutes);
apiRouter.use('/rentals', rentalRoutes);
apiRouter.use('/rental-requests', rentalRoutes);
apiRouter.use('/farming', farmingRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/what-if', whatIfRoutes);
apiRouter.use('/comparison', comparisonRoutes);
apiRouter.use('/resources', resourceRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/buyers', buyerRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
