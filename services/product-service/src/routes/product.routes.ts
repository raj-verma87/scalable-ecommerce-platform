import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller';
import { gatewayOrLocalAuthenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin only
router.post('/', gatewayOrLocalAuthenticate, authorizeAdmin, createProduct);
router.patch('/:id', gatewayOrLocalAuthenticate, authorizeAdmin, updateProduct);
router.delete('/:id', gatewayOrLocalAuthenticate, authorizeAdmin, deleteProduct);

export default router;
