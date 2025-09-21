// src/utils/auth.ts

import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const SERVICE_JWT_SECRET = process.env.SERVICE_JWT_SECRET;

if (!SERVICE_JWT_SECRET) {
  throw new Error("Missing SERVICE_JWT_SECRET in environment");
}

/**
 * Generates a short-lived JWT for internal service-to-service authentication.
 */
export const generateServiceToken = (userId: string, orderId?: string): string => {
  const payload = {
    iss: 'payment-service',
    aud: 'order-service',
    role: 'internal',
    userId,
    orderId,
  };

  const token = jwt.sign(payload, SERVICE_JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '5m',
  });

  return token;
};
