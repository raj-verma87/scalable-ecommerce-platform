// shared/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { errorResponse } from '../helpers/responseBuilder';
import { logger } from '../utils/logger';

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Wrap in a function so we can pass serviceName
export const errorHandler = (serviceName = 'unknown-service') => {
  return (err: ApiError | Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode =
      err instanceof ApiError ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;

    // Structured error log
    logger.error({
      message: err.message || 'Internal Server Error',
      service: serviceName,
      traceId: req.traceId ?? 'no-trace-id',
      method: req.method,
      url: req.originalUrl,
      statusCode,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    // Send consistent error response
    if (err instanceof ApiError) {
      return errorResponse(res, err.message, err.statusCode, err.details);
    }

    return errorResponse(
      res,
      'Internal Server Error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  };
};
