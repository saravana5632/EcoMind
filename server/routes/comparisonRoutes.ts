import { Router } from 'express';
import { ComparisonController } from '../controllers/comparisonController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { comparisonSchema } from '../utils/validators';

const router = Router();

router.post('/compare', validateBody(comparisonSchema), ComparisonController.compareCrops);
router.get('/history', authMiddleware, ComparisonController.getHistory);

export default router;
