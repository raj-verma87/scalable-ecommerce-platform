import Redis from 'ioredis';

let redis: Redis | null = null;

const getRedis = (): Redis => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      reconnectOnError: (err) => {
        console.error('[Redis] Reconnecting due to error:', err.message);
        return true;
      },
    });

    redis.on('connect', () => console.log('[Redis] Connected'));
    redis.on('error', (err) => console.error('[Redis] Error:', err));
  }
  return redis;
};

export default getRedis;
