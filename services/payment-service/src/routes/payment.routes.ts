// src/routes/payment.routes.ts
import { Router } from 'express';
import { createPayment, getPaymentHistory } from '../controllers/payment.controller';
import { gatewayOrLocalAuthenticate } from '../../../../shared/middlewares/auth.middleware';

const router = Router();
router.use(gatewayOrLocalAuthenticate);

router.post("/", createPayment);
router.get("/history", getPaymentHistory);

export default router;
