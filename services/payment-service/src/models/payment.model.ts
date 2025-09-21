// src/models/payment.model.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  provider: string;
  providerTransactionId?: string | null;
  failureReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: String, required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    provider: { type: String, required: true },
    providerTransactionId: { type: String, default: null },
    failureReason: { type: String, default: null },
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
export default Payment;
