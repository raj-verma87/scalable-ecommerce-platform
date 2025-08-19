import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async (retries = 5, delay = 3000) => {
  const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  while (retries > 0) {
    try {
      console.log(`🔌 Connecting to RabbitMQ at ${amqpUrl}...`);
      const connection = await amqp.connect(amqpUrl);
      channel = await connection.createChannel();
      await channel.assertExchange('user_events', 'topic', { durable: true });
      console.log('✅ Connected to RabbitMQ');
      return;
    } catch (err) {
      if (err instanceof Error) {
        console.error(`❌ RabbitMQ connection failed: ${err.message}`);
      } else {
        console.error(`❌ RabbitMQ connection failed: ${String(err)}`);
      }
      retries--;

      if (retries === 0) {
        console.error('🚫 Could not connect to RabbitMQ after multiple attempts.');
        throw err;
      }

      console.log(`🔁 Retrying in ${delay / 1000}s... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

export const publishUserRoleUpdated = (userId: string, role: string) => {
  const event = {
    type: 'USER_ROLE_UPDATED',
    data: { userId, role },
    timestamp: new Date().toISOString(),
  };

  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized.');
  }


  channel.publish(  
    'user_events',
    'user.role.updated',
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );

  console.log(`Event published: ${JSON.stringify(event)}`);
};
