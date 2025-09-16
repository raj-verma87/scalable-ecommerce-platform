import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
//import { authenticate } from '../middlewares/order.middleware';
import { gatewayOrLocalAuthenticate } from '../../../../shared/middlewares/auth.middleware';

const router = Router();
router.use(gatewayOrLocalAuthenticate);

// Protected routes (JWT handled by Gateway)
router.post('/', orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', orderController.updateStatus);

export default router;
