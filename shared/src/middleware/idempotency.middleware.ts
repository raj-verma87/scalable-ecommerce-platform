import { Request, Response, NextFunction } from 'express';
import { createIdempotencyStore } from '../utils/idempotencyStore';

export const createIdempotencyMiddleware = (prefix: string) => {
  const { getIdempotencyRecord, saveIdempotencyRecord } = createIdempotencyStore(prefix);

  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      return res.status(400).json({ message: 'Missing Idempotency-Key header' });
    }

    const existingRecord = await getIdempotencyRecord(idempotencyKey);
    if (existingRecord) {
      console.log(`[Idempotency:${prefix}] Returning cached response for key: ${idempotencyKey}`);
      return res.status(200).json(existingRecord.response);
    }

    // Save the idempotency record and send the response
    const originalJson = res.json.bind(res);

    // Overwrite res.json to intercept the response before sending it
    res.json = (body: any): Response<any> => {
      saveIdempotencyRecord(idempotencyKey, body)  // Save idempotency record
        .then(() => originalJson(body))           // Call the original res.json to send the response
        .catch((error) => {
          // Handle any errors that occur while saving the idempotency record
          console.error('Error saving idempotency record:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        });

      return res;  // Ensure that res is returned to match the expected type
    };

    next();
  };
};
