// src/services/payment.service.ts
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { publishEvent } from "../events/publisher";
import { log, error } from "../utils/logger";
import { generateServiceToken } from "../utils/auth";
import {
  createPayment,
  updatePaymentStatus,
} from "../repositories/payment.repository";

type PaymentResult = {
  success: boolean;
  providerTransactionId?: string;
  message?: string;
};

export const processPayment = async (
  orderId: string,
  amount: number,
  paymentMethod: any
): Promise<PaymentResult> => {
  log("Processing payment for order", orderId, "amount", amount);
  await new Promise((r) => setTimeout(r, 600));
  const ok = Math.random() < 0.9;
  if (!ok) return { success: false, message: "Payment declined by provider" };
  return { success: true, providerTransactionId: "pay_" + uuidv4() };
};

export const handlePayment = async (
  userId: string,
  orderId: string,
  amount: number,
  paymentMethod: any
) => {
  const payment = await createPayment({
    userId,
    orderId,
    amount,
    status: "PENDING",
    provider: paymentMethod?.provider || "mock",
    providerTransactionId: null,
  });

  try {
    const result = await processPayment(orderId, amount, paymentMethod);

    if (!result.success) {
      await updatePaymentStatus(payment._id.toString(), "FAILED", undefined, result.message);

      await publishEvent("payment.failed", {
        event: "PaymentFailed",
        data: { orderId, amount, reason: result.message },
      });

      return { success: false, reason: result.message };
    }

    await updatePaymentStatus(payment._id.toString(), "SUCCESS", result.providerTransactionId);

    const token = generateServiceToken(userId, orderId);
    try {
      const response = await axios.patch(
        `${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}/status`,
        { status: "PAID" },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );
      log("Order status updated:", response.data);
    } catch (err: any) {
      error("PATCH failed", err.response?.status, err.response?.data);
    }

    await publishEvent("payment.processed", {
      event: "PaymentProcessed",
      data: {
        orderId,
        amount,
        providerTransactionId: result.providerTransactionId,
        paymentId: payment._id,
      },
    });

    await publishEvent("order.paid", {
      event: "OrderPaid",
      data: {
        orderId,
        amount,
        providerTransactionId: result.providerTransactionId,
        paymentId: payment._id,
      },
    });

    return { success: true, providerTransactionId: result.providerTransactionId };
  } catch (err: any) {
    error("Error processing payment", err?.message || err);
    await updatePaymentStatus(payment._id.toString(), "FAILED", undefined, err?.message || "Unknown error");

    await publishEvent("payment.failed", {
      event: "PaymentFailed",
      data: { orderId, amount, reason: err?.message || "unknown" },
    });

    return { success: false, reason: err?.message || "error" };
  }
};
