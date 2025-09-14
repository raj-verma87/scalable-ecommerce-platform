import amqp from 'amqplib';
import User from '../models/user.model';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectRabbitMQ = async () => {
  const amqpUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  let retries = MAX_RETRIES;

  while (retries > 0) {
    try {
      console.log(`🔌 Connecting to RabbitMQ at ${amqpUrl}...`);

      const connection = await amqp.connect(amqpUrl); // Force IPv4 if needed
      const channel = await connection.createChannel();

      await channel.assertExchange('user_events', 'topic', { durable: true });

      const q = await channel.assertQueue('user_service_queue', { durable: true });
      await channel.bindQueue(q.queue, 'user_events', 'user.role.updated');

      console.log('📥 RabbitMQ consumer is ready and listening...');

      channel.consume(q.queue, async (msg) => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString());
          console.log(`📨 Event received:`, event);

          if (event.type === 'USER_ROLE_UPDATED') {
            const { userId, role } = event.data;

            const updatedUser = await User.findOneAndUpdate(
              { authUserId: userId },
              { role },
              { new: true }
            );

            if (updatedUser) {
              console.log(`✅ Role updated for user: ${userId}`);
            } else {
              console.warn(`⚠️ No user found with authUserId: ${userId}`);
            }
          }

          channel.ack(msg);
        } catch (err) {
          console.error('❌ Failed to process message:', err);
          channel.nack(msg, false, false); // Drop the bad message
        }
      });

      // ✅ If connection is successful, break the retry loop
      return;

    } catch (err) {
      console.error(`❌ RabbitMQ connection failed: ${(err instanceof Error ? err.message : String(err))}`);
      retries--;

      if (retries === 0) {
        console.error('🚫 Could not connect to RabbitMQ after multiple attempts.');
        throw err;
      }

      console.log(`🔁 Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};
