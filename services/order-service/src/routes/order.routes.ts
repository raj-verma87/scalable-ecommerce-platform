import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middlewares/order.middleware';

const router = Router();

// Protected routes (JWT handled by Gateway)
router.post('/', authenticate, orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', orderController.updateStatus);

export default router;
