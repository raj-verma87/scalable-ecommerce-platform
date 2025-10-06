import getRedis from '../config/redis';

export interface IdempotencyRecord {
  key: string;
  status: 'completed';
  response: any;
  createdAt: number;
}

export const createIdempotencyStore = (prefix: string, ttl: number = 600) => {
  const IDEMPOTENCY_PREFIX = `${prefix}:idempotency:`;

  const saveIdempotencyRecord = async (key: string, response: any) => {
    const record: IdempotencyRecord = {
      key,
      status: 'completed',
      response,
      createdAt: Date.now(),
    };
    await getRedis().set(`${IDEMPOTENCY_PREFIX}${key}`, JSON.stringify(record), 'EX', ttl);
  };

  const getIdempotencyRecord = async (key: string): Promise<IdempotencyRecord | null> => {
    const data = await getRedis().get(`${IDEMPOTENCY_PREFIX}${key}`);
    return data ? JSON.parse(data) : null;
  };

  return { saveIdempotencyRecord, getIdempotencyRecord };
};
