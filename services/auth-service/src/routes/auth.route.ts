import { Router } from "express";
import {register, login, createAdmin, getPublicKey, changeUserRole} from "../controllers/auth.controller";
import { authenticate, authorize, gatewayAuthorize } from "../middlewares/auth.middleware";

const router = Router();

router.post('/register',register);
router.post('/login',login);
// Gateway-auth: role enforced via header set by Gateway's jwt policy
router.post('/create-admin', gatewayAuthorize('ADMIN'), createAdmin);

// Public key endpoint for other services
router.get('/public-key', getPublicKey);
// PATCH /api/auth/users/:id/role
router.patch('/users/:id/role', gatewayAuthorize('ADMIN'), changeUserRole);


export default router;
