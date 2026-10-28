import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", authLimiter, validateRegister, authController.register);
router.post("/login", authLimiter, validateLogin, authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.getMe);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);

export default router;
