// src/events/publisher.ts
import { getChannel } from '../config/amqp';

export const publishEvent = async (queue: string, payload: object) => {
  const ch = getChannel();
  const buffer = Buffer.from(JSON.stringify(payload));
  // persistent messages
  ch.sendToQueue(queue, buffer, { persistent: true });
};
