import { Router } from "express";
import {register, login, createAdmin, getPublicKey, changeUserRole} from "../controllers/auth.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.post('/register',register);
router.post('/login',login);
router.post('/create-admin',authenticate, authorize('ADMIN'),createAdmin);

// Public key endpoint for other services
router.get('/public-key', getPublicKey);
// PATCH /api/auth/users/:id/role
router.patch('/users/:id/role', authenticate, authorize('ADMIN'), changeUserRole);


export default router;
