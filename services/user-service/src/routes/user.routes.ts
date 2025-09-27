import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "@shared/middleware/validateRequest";
import { userServiceSchemas } from "../validators/user.schemas";
import {
  getMyProfile,
  updateMyProfile,
  changeRole,
  createProfile,
  getAllUsers,
} from "../controllers/user.controller";

const router: Router = Router();

router.get("/all", authenticate, getAllUsers);

// 👤 Get logged-in user's profile
router.get("/me", authenticate, getMyProfile);

// ✏️ Update logged-in user's profile (partial update)
router.patch(
  "/me",
  authenticate,
  validateRequest(userServiceSchemas.updateProfile),
  updateMyProfile
);

// Change user role (Admin-only)
router.patch("/change-role/:id", authenticate, changeRole);

router.post(
  "/profile",
  authenticate,
  validateRequest(userServiceSchemas.create),
  createProfile
);

export default router;
