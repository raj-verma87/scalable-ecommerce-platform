// src/index.ts
import express from "express";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { connectAmqp } from "./config/amqp";
import paymentRoutes from "./routes/payment.routes";
import { log, error } from "./utils/logger";
import connectDB from './config/db';

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5006;

const init = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not set in environment");
    }
    log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    log("MongoDB Connected ✅");

    // 2️⃣ Connect to RabbitMQ
    if (!process.env.RABBITMQ_URL) {
      throw new Error("RABBITMQ_URL not set in environment");
    }
    log("Connecting to RabbitMQ at:", process.env.RABBITMQ_URL);

    const { channel } = await connectAmqp();

    // 3️⃣ Ensure queues exist
    await channel.assertQueue("order.placed", { durable: true });
    await channel.assertQueue("payment.processed", { durable: true });
    await channel.assertQueue("payment.failed", { durable: true });
    await channel.assertQueue("order.paid", { durable: true });

    // 4️⃣ (Optional) Consume "order.placed" events for auto-payments
    /*
    channel.consume("order.placed", async (msg) => {
      if (msg) {
        try {
          const payload = JSON.parse(msg.content.toString());
          const { orderId, amount } = payload.data;
          log("Received order.placed for payment auto-process", orderId, amount);

          // Optionally auto-trigger payment
          // await handlePayment(payload.userId, orderId, amount, {});
          channel.ack(msg);
        } catch (err) {
          error("Error in order.placed consumer", err);
          channel.nack(msg, false, false);
        }
      }
    });
    */

    // 5️⃣ Start Express server
    connectDB().then(() => {
      app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
    });
  } catch (err: any) {
    error("❌ Failed to start payment service", err.message || err);
    process.exit(1);
  }
};

init();
