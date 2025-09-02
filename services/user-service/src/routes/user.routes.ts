import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getMyProfile, updateMyProfile, changeRole, createProfile, getAllUsers } from "../controllers/user.controller";

const router = Router();

router.get('/all', getAllUsers);
router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);
router.patch('/change-role/:id', changeRole);
router.post('/profile', createProfile);

export default router;

