import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { aiAnalysisSchema } from '../utils/validators';

const router = Router();

// Public / Farmer AI Analysis endpoint
router.post('/analyze', validateBody(aiAnalysisSchema), AIController.analyze);

// Weather, Soil, Market telemetry
router.get('/weather', AIController.getWeather);
router.get('/soil', AIController.getSoil);
router.get('/market', AIController.getMarket);

// Authenticated AI Recommendation history & persistence
router.post('/recommendations', authMiddleware, validateBody(aiAnalysisSchema), AIController.generateRecommendation);
router.get('/recommendations', authMiddleware, AIController.getRecommendations);

export default router;
