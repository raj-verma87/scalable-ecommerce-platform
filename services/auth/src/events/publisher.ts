import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect('amqp://127.0.0.1');
  channel = await connection.createChannel();
  await channel.assertExchange('user_events', 'topic', { durable: true });
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
