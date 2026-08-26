import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address")
  .max(254, "Email must not exceed 254 characters");

const passwordField = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must not exceed 64 characters");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: emailField,
  password: passwordField,
});

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const emailSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  password: passwordField,
});

export const googleLoginSchema = z.object({
  credential: z.string().min(1, "Google credential is required"),
});
