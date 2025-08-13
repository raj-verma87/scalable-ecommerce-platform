import axios from 'axios';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

let publicKey: string | null = null;

const fetchPublicKey = async () => {
  if (!publicKey) {
    const { data } = await axios.get('http://localhost:5001/api/auth/public-key', {
      responseType: 'text'
    });

    publicKey = data.replace(/\\n/g, '\n');
  }
  return publicKey;
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const pubKey = await fetchPublicKey();
    if (!pubKey) throw new Error('Public key not available');

    const decoded = jwt.verify(token, pubKey, { algorithms: ['RS256'] });

    if (typeof decoded === 'string') {
      return res.status(403).json({ message: 'Invalid token payload format' });
    }

    req.user = decoded as JwtPayload & { id?: string; role?: string };
    console.log('✅ User authenticated successfully in Product Service');
    next();
  } catch (err) {
    console.error('❌ Authentication error:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware: Authorize ADMIN role
 */
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.role || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
