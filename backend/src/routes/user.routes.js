import { Router } from "express";
import { getMe, updateMe } from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const userRoutes = Router();

userRoutes.get("/me", authenticateUser, getMe);
userRoutes.patch("/me", authenticateUser, updateMe);

export default userRoutes;
