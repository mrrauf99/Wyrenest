import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { createUser, findOrCreateGoogleUser } from "../service/user.service.js";
import { RefreshToken } from "../models/refreshToken.model.js";

import {
  accessCookieOptions,
  refreshCookieOptions,
} from "../config/cookie.config.js";

import {
  issueAuthTokens,
  verifyGoogleCredential,
  rotateRefreshToken,
  createVerificationToken,
  findValidToken,
} from "../service/auth.service.js";

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../service/mailer.service.js";

import {
  registerSchema,
  loginSchema,
  emailSchema,
  resetPasswordSchema,
  googleLoginSchema,
} from "../schemas/auth.schema.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);
  const user = await createUser({ name, email, password });

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "User already exists",
    });
  }

  const token = await createVerificationToken({
    userId: user._id,
    purpose: "email_verify",
  });

  await sendVerificationEmail({ to: user.email, name: user.name, token });

  res.status(201).json({
    success: true,
    message:
      "Registration successful. Check your email to verify your account.",
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select(
    "password role isActive name isEmailVerified provider",
  );

  if (!user?.isActive) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  if (user.provider !== "local") {
    return res.status(400).json({
      success: false,
      message: "This account uses Google Sign-In. Please continue with Google.",
    });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email before logging in",
    });
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const { accessToken, refreshToken } = await issueAuthTokens({
    userId: user._id,
    email,
    name: user.name,
    role: user.role,
  });

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    success: true,
    message: "User logged-in successfully",
  });
};

export const generateRefreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const { accessToken, refreshToken } = await rotateRefreshToken(token);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

export const logoutUser = async (req, res) => {
  const { userId } = req.user;

  await RefreshToken.deleteMany({ userId });

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

export const googleLogin = async (req, res) => {
  const { credential } = googleLoginSchema.parse(req.body);
  const { email, name } = await verifyGoogleCredential(credential);

  const {
    _id: userId,
    role,
    isNewUser,
  } = await findOrCreateGoogleUser({
    name,
    email,
  });

  const { accessToken, refreshToken } = await issueAuthTokens({
    userId,
    email,
    name,
    role,
  });

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(isNewUser ? 201 : 200).json({
    success: true,
    message: isNewUser
      ? "User created successfully"
      : "User logged-in successfully",
  });
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const tokenDoc = await findValidToken({ token, purpose: "email_verify" });

  if (!tokenDoc) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification link",
    });
  }

  const user = await User.findByIdAndUpdate(
    tokenDoc.userId,
    { $set: { isEmailVerified: true } },
    { new: true },
  ).select("email name role");

  await tokenDoc.deleteOne();

  const { accessToken, refreshToken } = await issueAuthTokens({
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
};

export const resendVerification = async (req, res) => {
  const { email } = emailSchema.parse(req.body);

  const user = await User.findOne({ email }).select(
    "name email isEmailVerified",
  );

  if (user && !user.isEmailVerified) {
    const token = await createVerificationToken({
      userId: user._id,
      purpose: "email_verify",
    });

    await sendVerificationEmail({ to: user.email, name: user.name, token });
  }

  res.status(200).json({
    success: true,
    message:
      "If that email is registered and unverified, a new verification link has been sent.",
  });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = resetPasswordSchema.parse(req.body);

  const tokenDoc = await findValidToken({ token, purpose: "password_reset" });

  if (!tokenDoc) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset link",
    });
  }

  const user = await User.findById(tokenDoc.userId).select("password provider");

  if (user.provider === "local") {
    const isSamePassword = await bcrypt.compare(password, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
      });
    }
  }

  user.password = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

  await user.save();
  await tokenDoc.deleteOne();
  await RefreshToken.deleteMany({ userId: user._id });

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = emailSchema.parse(req.body);

  const user = await User.findOne({ email }).select("name email");

  if (user) {
    const token = await createVerificationToken({
      userId: user._id,
      purpose: "password_reset",
    });

    await sendPasswordResetEmail({ to: user.email, name: user.name, token });
  }

  res.status(200).json({
    success: true,
    message:
      "If that email is registered, a password reset link has been sent.",
  });
};

// For frontend page guard
export const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  const tokenDoc = await findValidToken({ token, purpose: "password_reset" });

  if (!tokenDoc) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset link",
    });
  }

  res.status(200).json({
    success: true,
    message: "Reset link is valid",
  });
};
