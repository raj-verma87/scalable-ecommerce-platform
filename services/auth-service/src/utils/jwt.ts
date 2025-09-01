import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const privateKeyPath = path.join(__dirname,'../../keys/private.key');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

export const generateToken = (payload: object) => {
    return jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h',
        audience: 'my-api',
        issuer: 'my-company',
    });
};

export const generateRefreshToken = (payload: object) => {
    return jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '7d',
        audience: 'my-api',
        issuer: 'my-company',
    });
};

