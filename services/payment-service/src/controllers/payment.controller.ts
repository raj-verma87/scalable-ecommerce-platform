// src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import { handlePayment } from '../services/payment.service';

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;
    if (!orderId || !amount) {
      return res.status(400).json({ message: 'orderId and amount required' });
    }

    // Ideally the user is authenticated via gateway. We still trust orderId here.
    const result = await handlePayment(orderId, amount, paymentMethod || {});

    if (!result.success) {
      return res.status(402).json({ success: false, reason: result.reason });
    }

    return res.status(200).json({ success: true, providerId: result.providerId });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'error' });
  }
};
