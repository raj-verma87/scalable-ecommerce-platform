import jwt from "jsonwebtoken";
import { ObjectId } from 'mongoose';

// Existing payload types
interface TokenPayload {
    id: string | ObjectId; // Accept both ObjectId and string
    role: string;
}

interface RefreshTokenPayload {
    id: string | ObjectId; // Accept both ObjectId and string
}

/**
 * Generates a JWT access token
 * @param payload Data to sign (usually userId, role, etc.)
 * @param expiresIn Expiration string (default 1h)
 * @returns Signed JWT token
 */
export const generateToken = (payload: TokenPayload, expiresIn?: number): string =>{
    const jwtSecret = process.env.JWT_SECRET;
    if(!jwtSecret){
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const actualExpiresIn = expiresIn || parseInt(process.env.TOKEN_EXPIRES_IN!) || '1h';

   if(!actualExpiresIn){
        throw new Error('TOKEN_EXPIRES_IN is not defined in environment variables');
    }
    

    return jwt.sign(payload, jwtSecret, {expiresIn: actualExpiresIn});
};

/**
 * Generates a JWT refresh token
 * @param payload Data to sign (usually userId)
 * @param expiresIn Expiration string (default 7d)
 * @returns Signed JWT refresh token
 */
export const generateRefreshToken = (payload: RefreshTokenPayload, expiresIn?:number): string => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }
     const actualExpiresIn = expiresIn || parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN!) || '1h';

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {expiresIn:actualExpiresIn});
};

