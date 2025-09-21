// src/repositories/payment.repository.ts
import Payment, { IPayment } from "../models/payment.model";

export const createPayment = async (data: Partial<IPayment>): Promise<IPayment> => {
  return Payment.create(data);
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: "SUCCESS" | "FAILED",
  providerTransactionId?: string,
  failureReason?: string
): Promise<IPayment | null> => {
  return Payment.findByIdAndUpdate(
    paymentId,
    { status, providerTransactionId, failureReason },
    { new: true }
  );
};

export const findPaymentById = async (paymentId: string) => {
  return Payment.findById(paymentId);
};

export const findPaymentsByUser = async (userId: string) => {
  return Payment.find({ userId }).sort({ createdAt: -1 });
};

export const findPaymentsByOrder = async (orderId: string) => {
  return Payment.find({ orderId }).sort({ createdAt: -1 });
};
