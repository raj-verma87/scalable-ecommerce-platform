import amqplib from 'amqplib';

(async () => {
  try {
    const conn = await amqplib.connect('amqp://127.0.0.1');
    console.log('✅ Connected to RabbitMQ');
    await conn.close();
  } catch (err) {
    console.error('❌ Failed to connect to RabbitMQ:', err);
  }
})();
