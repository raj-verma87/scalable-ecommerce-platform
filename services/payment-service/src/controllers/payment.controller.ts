// src/controllers/payment.controller.ts
import { Request, Response } from "express";
import { handlePayment } from "../services/payment.service";
import { JwtPayload } from "jsonwebtoken";
import Payment from "../models/payment.model";

export const createPayment = async (req: Request, res: Response) => {
  try {
    const user = (req.user as JwtPayload) || ({} as JwtPayload);
    const { orderId, amount, paymentMethod } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: "orderId and amount required" });
    }

    const userId = (user as any)?.id || (req.headers["x-user-id"] as string);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: missing user id" });
    }

    // Call service to handle payment
    const result = await handlePayment(userId, orderId, amount, paymentMethod || {});

    if (!result.success) {
      return res.status(402).json({ success: false, reason: result.reason });
    }

    return res.status(200).json({
      success: true,
      providerTransactionId: result.providerTransactionId, // ✅ updated
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: err?.message || "Internal server error" });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const user = (req.user as JwtPayload) || ({} as JwtPayload);
    const userId = (user as any)?.id || (req.headers["x-user-id"] as string);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: missing user id" });
    }

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: err?.message || "Internal server error" });
  }
};
