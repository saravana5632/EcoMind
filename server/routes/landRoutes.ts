import { Router } from 'express';
import { LandController } from '../controllers/landController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { landCreationSchema, landUpdateSchema } from '../utils/validators';

const router = Router();

// Public / Farmer exploration (Within 20 KM radius)
router.get('/nearby', LandController.getNearbyLands);
router.get('/all', LandController.getAllLands);
router.get('/', LandController.getAllLands);
router.get('/my-lands', authMiddleware, LandController.getMyLands);
router.get('/:id', LandController.getLandById);

// Landlord actions
router.post(
  '/',
  authMiddleware,
  authorizeRoles('LANDLORD', 'ADMIN'),
  validateBody(landCreationSchema),
  LandController.createLand
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('LANDLORD', 'ADMIN'),
  validateBody(landUpdateSchema),
  LandController.updateLand
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('LANDLORD', 'ADMIN'),
  LandController.deleteLand
);

router.patch(
  '/:id/status',
  authMiddleware,
  authorizeRoles('LANDLORD', 'ADMIN'),
  LandController.updateStatus
);

router.patch(
  '/:id/verify',
  authMiddleware,
  authorizeRoles('ADMIN'),
  LandController.verifyLand
);

export default router;
