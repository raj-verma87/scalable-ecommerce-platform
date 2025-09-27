import { Request, Response, NextFunction } from 'express';
import {logger} from '../utils/logger';

export const requestLogger = (serviceName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(
        `[${serviceName}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
      );
    });

    next();
  };
};
