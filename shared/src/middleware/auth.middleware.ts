import { Request, Response, NextFunction } from "express";
import axios from "axios";
import jwt, { JwtPayload } from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

// Authentication is performed at the Gateway. This middleware trusts
// headers injected by the Gateway's jwt-auth policy and populates req.user.
// Fetch and cache public key for local JWT verification fallback
let cachedPublicKey: string | null = null;
const getPublicKey = async (): Promise<string> => {
  if (cachedPublicKey) return cachedPublicKey;
  const AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || "http://auth-service:5001";
  const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/auth/public-key`, {
    responseType: "text",
    timeout: 3000,
  });
  cachedPublicKey = (data as string).replace(/\\n/g, "\n");
  return cachedPublicKey;
};

export const gatewayOrLocalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.headers["x-user-id"] as string | undefined;
  const userRole = req.headers["x-user-role"] as string | undefined;

  // Fast path: trust gateway headers if present
  if (userId) {
    (req as any).user = { id: userId, role: userRole };
    return next();
  }

  // Fallback: verify Authorization bearer token locally
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: missing user id" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const pubKey = await getPublicKey();
    const decoded = jwt.verify(token, pubKey, {
      algorithms: ["RS256"],
    }) as JwtPayload & { id?: string; role?: string };
    if (!decoded?.id) {
      return res.status(403).json({ message: "Invalid token payload format" });
    }
    (req as any).user = {
      id: decoded.id as string,
      role: decoded.role as string | undefined,
    };
    return next();
  } catch (err) {
    // Try service token (HS256)
    if (process.env.SERVICE_JWT_SECRET) {
      try {
        const payload = jwt.verify(token, process.env.SERVICE_JWT_SECRET!, {
          algorithms: ["HS256"],
        }) as JwtPayload;

        if (!payload.iss || !payload.userId || !payload.role) {
          return res
            .status(403)
            .json({ message: "Invalid service token claims" });
        }

        (req as any).service = {
          name: payload.iss,
          userId: payload.userId,
          orderId: payload.orderId,
          role: payload.role,
        };

        return next();
      } catch (_) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
    }
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * Middleware: Authorize ADMIN role
 */
export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const roleFromUser = (req as any).user?.role as string | undefined;
  const roleFromHeader = req.headers["x-user-role"] as string | undefined;
  const role = roleFromUser || roleFromHeader;

  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
