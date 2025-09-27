// services/shared/src/middleware/validateRequest.ts
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ApiError } from './errorHandler';
import { HTTP_STATUS } from '../constants/httpStatus';

export const validateRequest = (
  schema: Schema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Validation error',
        error.details.map((d) => d.message)
      );
    }

    req[property] = value;
    next();
  };
};
