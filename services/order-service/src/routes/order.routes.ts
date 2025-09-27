import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { gatewayOrLocalAuthenticate } from '@shared/middleware/auth.middleware';
import { createIdempotencyMiddleware } from '@shared/middleware/idempotency.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { orderSchemas } from '../validators/order.schemas';

const router: Router = Router();

// 🔑 Ensure authentication (works for both Gateway & Local)
router.use(gatewayOrLocalAuthenticate);

// 🛒 Create order (with idempotency + validation)
router.post(
  '/',
  createIdempotencyMiddleware('order-service'),
  validateRequest(orderSchemas.createOrder), // ✅ Joi validation
  orderController.createOrder
);

// 📦 Get logged-in user's orders
router.get('/my', orderController.getMyOrders);

// 📦 Get a specific order by ID
router.get(
  '/:id',
  validateRequest(orderSchemas.updateStatus, 'params'), // optional: validate params (if needed)
  orderController.getOrder
);

// 🔄 Update order status
router.patch(
  '/:id/status',
  validateRequest(orderSchemas.updateStatus),
  orderController.updateStatus
);

export default router;
