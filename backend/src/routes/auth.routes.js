import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  generateRefreshToken,
  googleLogin,
  resetPassword,
  forgotPassword,
  verifyResetToken,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import {
  loginLimiter,
  forgotPasswordLimiter,
} from "../middlewares/rateLimiters.js";

const authRoutes = Router();

authRoutes.post("/login", loginLimiter, loginUser);
authRoutes.post("/register", registerUser);
authRoutes.post("/logout", authenticateUser, logoutUser);
authRoutes.post("/google", googleLogin);
authRoutes.get("/refresh-token", generateRefreshToken);

authRoutes.get("/verify-email/:token", verifyEmail);
authRoutes.post("/resend-verification", resendVerification);

authRoutes.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
authRoutes.get("/reset-password/:token", verifyResetToken);
authRoutes.patch("/reset-password/:token", resetPassword);

export default authRoutes;
