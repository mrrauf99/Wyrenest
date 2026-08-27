import { createUser } from "../service/user.service.js";
import { User } from "../models/user.model.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import { registerSchema } from "../schemas/auth.schema.js";
import { getStaffService } from "../service/staff.service.js";
import { paginationSchema } from "../schemas/pagination.schema.js";
import { z } from "zod";

export const registerStaff = async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const staff = await createUser({
    name,
    email,
    password,
    role: "staff",
    isEmailVerified: true,
  });

  if (!staff) {
    return res.status(409).json({
      success: false,
      message: "A user with this email already exists",
    });
  }

  res.status(201).json({
    success: true,
    message: "Staff account created successfully",
  });
};

export const getStaff = async (req, res) => {
  const { page, limit } = paginationSchema.parse(req.query);
  const skipItems = (page - 1) * limit;
  const data = await getStaffService(skipItems, limit);

  return res.status(200).json({
    success: true,
    data,
  });
};

export const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);

  const staff = await User.findOneAndUpdate(
    { _id: id, role: "staff" },
    { $set: { isActive } },
  );

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff account not found",
    });
  }

  if (!isActive) {
    await RefreshToken.deleteMany({ userId: id });
  }

  res.status(200).json({
    success: true,
    message: "Staff status updated successfully",
  });
};
