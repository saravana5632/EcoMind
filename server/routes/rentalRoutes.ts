import { Router } from 'express';
import { RentalController } from '../controllers/rentalController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { rentalRequestSchema } from '../utils/validators';

const router = Router();

router.use(authMiddleware);

// Farmer submits rental request (Strict 20 KM radius enforced on server)
router.post(
  '/',
  authorizeRoles('FARMER', 'ADMIN'),
  validateBody(rentalRequestSchema),
  RentalController.createRequest
);

router.post(
  '/request',
  authorizeRoles('FARMER', 'ADMIN'),
  validateBody(rentalRequestSchema),
  RentalController.createRequest
);

// Farmer views their requests
router.get('/my-requests', RentalController.getMyRequests);

// Landlord views requests received for their lands
router.get('/landlord-requests', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.getLandlordRequests);

// Landlord approves request (both PUT and POST supported)
router.post('/:id/approve', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.approveRequest);
router.put('/:id/approve', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.approveRequest);

// Landlord rejects request (both PUT and POST supported)
router.post('/:id/reject', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.rejectRequest);
router.put('/:id/reject', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.rejectRequest);

// Start lease
router.post('/:id/start-lease', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.startLease);
router.put('/:id/start-lease', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.startLease);
router.post('/:id/start-rental', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.startLease);
router.put('/:id/start-rental', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.startLease);

// Complete lease
router.post('/:id/complete-lease', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.completeLease);
router.put('/:id/complete-lease', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.completeLease);
router.post('/:id/complete-rental', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.completeLease);
router.put('/:id/complete-rental', authorizeRoles('LANDLORD', 'ADMIN'), RentalController.completeLease);

export default router;
