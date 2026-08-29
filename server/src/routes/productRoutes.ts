import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { productSchema } from '../utils/validators';

const router = Router();

router.get('/', ProductController.getProducts);
router.get('/my-products', authMiddleware, authorizeRoles('FARMER'), ProductController.getMyProducts);
router.post('/', authMiddleware, authorizeRoles('FARMER', 'ADMIN'), validateBody(productSchema), ProductController.createProduct);

export default router;
