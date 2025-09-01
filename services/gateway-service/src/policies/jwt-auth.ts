import { readFileSync } from 'fs';
import { join } from 'path';
import { verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Secret } from 'jsonwebtoken';

let publicKey: string | null = null;

const fetchPublicKey = async () => {
  if (!publicKey) {
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
    
    try {
      const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/auth/public-key`, {
        responseType: 'text',
      });

      // Replace escaped \n characters with actual newlines
      publicKey = data.replace(/\\n/g, '\n');
    } catch (err) {
      if (err instanceof Error) {
        console.error('❌ Failed to fetch public key:', err.message);
      } else {
        console.error('❌ Failed to fetch public key:', err);
      }
      throw err;
    }
  }

  return publicKey;
};

export const policy = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const pubKey = await fetchPublicKey();
      const decoded = verify(token, pubKey as Secret, { algorithms: ['RS256'] }) as any;

      // Attach decoded user to request (for internal use or logging)
      (req as any).user = decoded;

      // Forward user info to downstream services
      req.headers['x-user-id'] = decoded.id;
      req.headers['x-user-role'] = decoded.role;

      return next();
    } catch (err: any) {
      return res.status(401).send({ message: 'Invalid token', error: err.message });
    }
  };
};

export const name = 'jwt-auth';
