import { verify, Secret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

let publicKey: string | null = null;

const fetchPublicKey = async () => {
  if (!publicKey) {
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
    const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/auth/public-key`, { responseType: 'text' });
    publicKey = data.replace(/\\n/g, '\n');
  }
  return publicKey;
};

const jwtAuthPolicy = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ message: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const pubKey = await fetchPublicKey();
      const decoded = verify(token, pubKey as Secret, { algorithms: ['RS256'] }) as any;
      (req as any).user = decoded;
      req.headers['x-user-id'] = decoded.id;
      req.headers['x-user-role'] = decoded.role;
      next();
    } catch (err: any) {
      return res.status(401).send({ message: 'Invalid token', error: err.message });
    }
  };
};

// ✅ CommonJS export
module.exports = {
  name: 'jwt-auth',
  policy: jwtAuthPolicy,
  schema: {
    $id: 'http://express-gateway.io/schemas/policies/jwt-auth.json',
    type: 'object',
    properties: {}
  }
};
