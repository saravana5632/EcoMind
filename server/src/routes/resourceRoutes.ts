import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', ResourceController.getResources);
router.post('/', authMiddleware, authorizeRoles('ADMIN'), ResourceController.createResource);

export default router;
