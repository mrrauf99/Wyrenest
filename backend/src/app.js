import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.config.js";
import cors from "cors";
import { ZodError } from "zod";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";

import { authenticateUser } from "./middleware/auth.middleware.js";
import { authorizeRoles } from "./middleware/role.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is up and running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use(
  "/api/admin/staff",
  authenticateUser,
  authorizeRoles("admin"),
  adminRoutes,
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, _next) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues[0].message,
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid identifier",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists",
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
});

await connectDB();

export default app;
