import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(authorizeRoles('ADMIN'));

router.get('/overview', AdminController.getOverview);
router.get('/statistics', AdminController.getOverview);
router.get('/users', AdminController.getAllUsers);
router.get('/farmers', AdminController.getFarmers);
router.get('/landlords', AdminController.getLandlords);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.put('/users/:id/status', AdminController.updateUserStatus);
router.get('/lands', AdminController.getAllLands);
router.patch('/lands/:id/verify', AdminController.verifyLand);
router.put('/lands/:id/verify', AdminController.verifyLand);
router.get('/rentals', AdminController.getAllRentals);
router.get('/audit-logs', AdminController.getAuditLogs);
router.post('/seed/reset', AdminController.resetSeed);

export default router;
