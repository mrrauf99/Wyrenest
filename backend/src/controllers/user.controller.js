import { updateMeSchema } from "../schemas/user.schema.js";
import { User } from "../models/user.model.js";

export const getMe = async (req, res) => {
  const { userId, email, role, name } = req.user;

  const user = await User.findById(userId).select("phoneNo address");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      userId,
      email,
      role,
      name,
      phoneNo: user.phoneNo,
      address: user.address,
    },
  });
};

export const updateMe = async (req, res) => {
  const updateUser = updateMeSchema.parse(req.body);

  if (updateUser.address?.city !== undefined) {
    updateUser["address.city"] = updateUser.address.city;
  }

  if (updateUser.address?.state !== undefined) {
    updateUser["address.state"] = updateUser.address.state;
  }

  if (updateUser.address?.postalCode !== undefined) {
    updateUser["address.postalCode"] = updateUser.address.postalCode;
  }

  if (updateUser.address?.street !== undefined) {
    updateUser["address.street"] = updateUser.address.street;
  }

  delete updateUser.address;

  await User.findByIdAndUpdate(req.user.userId, { $set: updateUser });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
};
