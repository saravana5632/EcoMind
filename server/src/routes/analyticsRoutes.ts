import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/overview', authMiddleware, AnalyticsController.getPlatformAnalytics);
router.get('/public-summary', AnalyticsController.getPlatformAnalytics);

export default router;
