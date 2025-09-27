import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      traceId?: string;
    }
  }
}

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  // Reuse traceId if passed from upstream service (API Gateway)
  req.traceId = (req.headers['x-trace-id'] as string) || uuidv4();

  // Expose traceId to the client in response headers (useful for debugging)
  res.setHeader('X-Trace-Id', req.traceId);

  next();
};
