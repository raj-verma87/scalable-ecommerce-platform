// shared/src/helpers/responseBuilder.ts
import { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';

type SuccessResponse<T> = {
  success: true;
  message: string;
  data?: T;
  traceId: string | undefined;
  timestamp: string;
};

type ErrorResponse = {
  success: false;
  message: string;
  details?: any;
  traceId: string | undefined;
  timestamp: string;
};

export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = HTTP_STATUS.OK
) => {
  const traceId = (res.req as any).traceId;
  const payload: SuccessResponse<T> = {
    success: true,
    message,
    data,
    traceId,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: any
) => {
  const traceId = (res.req as any).traceId;
  const payload: ErrorResponse = {
    success: false,
    message,
    details,
    traceId,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
};
