import { Request, Response, NextFunction } from 'express';
import { createIdempotencyStore } from '../utils/idempotencyStore';

export const createIdempotencyMiddleware = (prefix: string) => {
  const { getIdempotencyRecord, saveIdempotencyRecord } = createIdempotencyStore(prefix);

  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      return res.status(400).json({ message: 'Missing Idempotency-Key header' });
    }

    try {
      // 🔹 1. Check if existing record exists
      const existingRecord = await getIdempotencyRecord(idempotencyKey);
      if (existingRecord) {
        console.log(`[Idempotency:${prefix}] Returning cached response for key: ${idempotencyKey}`);
        return res.status(200).json(existingRecord.response);
      }

      // 🔹 2. Capture original res.json
      const originalJson = res.json.bind(res);

      // 🔹 3. Override res.json to save response before sending
      (res as any).json = (body: any) => {
        // Send response immediately
        const response = originalJson(body);

        // Save asynchronously (non-blocking)
        saveIdempotencyRecord(idempotencyKey, body)
          .then(() => console.log(`[Idempotency:${prefix}] Saved response for key: ${idempotencyKey}`))
          .catch((err) =>
            console.error(`[Idempotency:${prefix}] Error saving record:`, err)
          );

        return response;
      };

      // Continue to controller
      next();
    } catch (err) {
      console.error(`[Idempotency:${prefix}] Middleware error:`, err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};