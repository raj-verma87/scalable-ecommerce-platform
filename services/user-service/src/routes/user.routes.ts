import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getMyProfile, updateMyProfile, changeRole, createProfile } from "../controllers/user.controller";

const router = Router();

router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateMyProfile);
router.patch('/change-role/:id', authenticate, changeRole);
router.post('/profile', authenticate, createProfile);

export default router;

