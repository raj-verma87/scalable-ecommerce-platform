import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { gatewayOrLocalAuthenticate } from '@shared/middleware/auth.middleware';

const router = Router();

router.use(gatewayOrLocalAuthenticate); 

// All routes are JWT-protected by API Gateway
router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.patch('/', cartController.updateQuantity);
router.delete('/', cartController.clearCart);

export default router;
