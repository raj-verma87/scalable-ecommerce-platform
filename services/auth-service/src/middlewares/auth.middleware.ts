import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { StatusCodes } from "../constants/statusCodes";
import { Messages } from "../constants/messages";

const publicKeyPath = path.join(__dirname, "../../keys/public.key");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

interface AuthRequest extends Request {
    user?: { id: string; role: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: Messages.INVALID_CREDENTIALS,
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, publicKey, {
            algorithms: ["RS256"],
        }) as JwtPayload;

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: Messages.INVALID_CREDENTIALS,
        });
    }
};

export const authorize = (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Forbidden: You do not have access to this resource",
        });
    }
    next();
};

// Use when authentication is handled by the Gateway.
export const gatewayAuthorize = (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role || (req.headers['x-user-role'] as string);
    if (!role || !roles.includes(role)) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Forbidden: You do not have access to this resource",
        });
    }
    next();
};
