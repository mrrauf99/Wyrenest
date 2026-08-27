import { Router } from "express";
import {
  getStaff,
  registerStaff,
  updateStaff,
} from "../controllers/admin.controller.js";

const adminRoutes = Router();

adminRoutes.get("/", getStaff);
adminRoutes.post("/", registerStaff);
adminRoutes.patch("/:id", updateStaff);

export default adminRoutes;
