// src/routes/payment.routes.ts
import { Router } from 'express';
import { createPayment, getPaymentHistory } from '../controllers/payment.controller';
import { gatewayOrLocalAuthenticate } from '@shared/middleware/auth.middleware';
import { createIdempotencyMiddleware } from '@shared/middleware/idempotency.middleware';

const router: Router = Router();
router.use(gatewayOrLocalAuthenticate);

router.post("/", createIdempotencyMiddleware('payment-service'), createPayment);
router.get("/history", getPaymentHistory);

export default router;
