import { Router } from 'express';
import { FarmingController } from '../controllers/farmingController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { farmingPlanSchema } from '../utils/validators';

const router = Router();

router.use(authMiddleware);

router.post('/plans', validateBody(farmingPlanSchema), FarmingController.createPlan);
router.get('/plans', FarmingController.getPlans);
router.get('/plans/:id', FarmingController.getPlanById);

export default router;
