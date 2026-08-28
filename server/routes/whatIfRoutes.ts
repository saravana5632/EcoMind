import { Router } from 'express';
import { WhatIfController } from '../controllers/whatIfController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { whatIfSchema } from '../utils/validators';

const router = Router();

router.post('/simulate', validateBody(whatIfSchema), WhatIfController.runSimulation);
router.get('/history', authMiddleware, WhatIfController.getHistory);

export default router;
