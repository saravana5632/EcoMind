import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { authLimiter } from '../middleware/rateLimitMiddleware';
import {
  farmerRegistrationSchema,
  landlordRegistrationSchema,
  loginSchema,
  updateProfileSchema,
  updateLocationSchema,
} from '../utils/validators';

const router = Router();

router.post('/register/farmer', authLimiter, validateBody(farmerRegistrationSchema), AuthController.registerFarmer);
router.post('/register/landlord', authLimiter, validateBody(landlordRegistrationSchema), AuthController.registerLandlord);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.get('/me', authMiddleware, AuthController.getMe);
router.put('/me', authMiddleware, validateBody(updateProfileSchema), AuthController.updateProfile);
router.put('/update-profile', authMiddleware, validateBody(updateProfileSchema), AuthController.updateProfile);
router.put('/me/location', authMiddleware, validateBody(updateLocationSchema), AuthController.updateLocation);
router.put('/update-location', authMiddleware, validateBody(updateLocationSchema), AuthController.updateLocation);
router.post('/logout', AuthController.logout);

export default router;
