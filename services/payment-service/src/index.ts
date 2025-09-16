// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { connectAmqp, getChannel, assertQueue } from './config/amqp';
import paymentRoutes from './routes/payment.routes';
import { log, error } from './utils/logger';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
app.use(express.json());

app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5006;

const init = async () => {
  try {
    // connect to RabbitMQ
    console.log('Connecting to RabbitMQ at:', process.env.RABBITMQ_URL);

    const { channel } = await connectAmqp();

    // ensure queues exist
    await channel.assertQueue('order.placed', { durable: true });
    await channel.assertQueue('payment.processed', { durable: true });
    await channel.assertQueue('payment.failed', { durable: true });
    await channel.assertQueue('order.paid', { durable: true });

    // Optionally, consume order.placed to auto-process payments (if you want)
    // Uncomment if you want auto payment when an order is placed
    /*
    channel.consume('order.placed', async (msg) => {
      if (msg) {
        try {
          const payload = JSON.parse(msg.content.toString());
          const { orderId, amount } = payload.data;
          log('Received order.placed for payment auto-process', orderId, amount);
          // call handlePayment(...) to process automatically
          // await handlePayment(orderId, amount, {});
          channel.ack(msg);
        } catch (err) {
          error('Error in order.placed consumer', err);
          // optionally requeue or dead-letter
          channel.nack(msg, false, false);
        }
      }
    });
    */

    // start server
    app.listen(PORT, () => {
      log(`Payment Service running on port ${PORT}`);
    });

  } catch (err) {
    error('Failed to start payment service', err);
    process.exit(1);
  }
};

init();
