import amqp from 'amqplib';
import User from '../models/user.model';

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://127.0.0.1'); // force IPv4
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
        channel.nack(msg, false, false); // drop bad message
      }
    });
  } catch (err) {
    console.error('❌ RabbitMQ connection failed:', err);
    throw err; // optionally let the caller decide what to do
  }
};
