import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

export const createUser = async ({
  name,
  email,
  password,
  role = "customer",
  isEmailVerified = false,
}) => {
  const existingUser = await User.findOne({ email });

  // Existing verified user
  if (existingUser?.isEmailVerified) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.SALT_ROUNDS),
  );

  // Existing unverified local user
  if (existingUser) {
    existingUser.name = name;

    existingUser.password = hashedPassword;

    await existingUser.save();

    return existingUser;
  }

  // New user
  const userData = {
    name,
    email,
    role,
    password: hashedPassword,
    isEmailVerified,
  };

  return User.create(userData);
};

export const findOrCreateGoogleUser = async ({ name, email }) => {
  const existingUser = await User.findOne({ email }).select(
    "name role isEmailVerified provider",
  );

  // Existing verified user
  if (existingUser?.isEmailVerified) {
    return {
      ...existingUser.toObject(),
      isNewUser: false,
    };
  }

  // Existing unverified local user
  if (existingUser) {
    existingUser.name = name;
    existingUser.provider = "google";
    existingUser.isEmailVerified = true;

    await existingUser.save();

    return {
      ...existingUser.toObject(),
      isNewUser: true,
    };
  }

  // Completely new Google user
  const user = await User.create({
    name,
    email,
    provider: "google",
    isEmailVerified: true,
    password: null,
  });

  return {
    ...user.toObject(),
    isNewUser: true,
  };
};
