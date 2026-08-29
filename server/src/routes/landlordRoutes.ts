import { Router } from 'express';
import { LandlordController } from '../controllers/landlordController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/profile', LandlordController.getMe);
router.put('/profile', LandlordController.updateMe);
router.get('/lands', LandlordController.getMyLands);

export default router;
