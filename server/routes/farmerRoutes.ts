import { Router } from 'express';
import { FarmerController } from '../controllers/farmerController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/profile', FarmerController.getMe);
router.put('/profile', FarmerController.updateMe);
router.get('/farm-profile', FarmerController.getFarmProfile);
router.put('/farm-profile', FarmerController.updateFarmProfile);

export default router;
