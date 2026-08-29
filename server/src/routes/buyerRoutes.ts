import { Router } from 'express';
import { BuyerController } from '../controllers/buyerController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/nearby', BuyerController.getNearbyBuyers);
router.post('/', authMiddleware, authorizeRoles('ADMIN'), BuyerController.createBuyer);

export default router;
