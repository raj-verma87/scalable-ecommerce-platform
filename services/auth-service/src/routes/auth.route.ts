import { Router } from "express";
import {register, login, createAdmin, getPublicKey, changeUserRole} from "../controllers/auth.controller";
import { authenticate, authorize, gatewayAuthorize } from "../middlewares/auth.middleware";
import { validateRequest } from "@shared/middleware";
import { authSchemas } from '../validators/auth.schemas';

const router = Router();

router.post('/register', validateRequest(authSchemas.register),register);
router.post('/login', validateRequest(authSchemas.login), login);
// Gateway-auth: role enforced via header set by Gateway's jwt policy
router.post('/create-admin', gatewayAuthorize('ADMIN'), createAdmin);

// Public key endpoint for other services
router.get('/public-key', getPublicKey);
// PATCH /api/auth/users/:id/role
router.patch('/users/:id/role', gatewayAuthorize('ADMIN'), changeUserRole);
// router.post(
//   '/change-password',
//   authenticate,
//   validateRequest(authSchemas.changePassword),
//   changePassword
// );


export default router;
