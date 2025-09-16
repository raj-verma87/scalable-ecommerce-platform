// src/config/amqp.ts
import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectAmqp = async () => {
  const amqpUrl = process.env.RABBITMQ_URL || 'amqp://127.0.0.1';
  console.log('Connecting to RabbitMQ at:', amqpUrl);
  try {
    const connection = await amqp.connect(amqpUrl);
    channel = await connection.createChannel();
    console.log(`Connected to RabbitMQ at ${amqpUrl}`);
    return { connection, channel };
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1);
  }
};

export const getChannel = () => {
  if (!channel) throw new Error('AMQP channel not initialized');
  return channel;
};

export const assertQueue = async (q: string) => {
  const ch = getChannel();
  await ch.assertQueue(q, { durable: true });
};
