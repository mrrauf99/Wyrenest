import { z } from "zod";

export const updateMeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .optional(),

  phoneNo: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 characters")
    .max(16, "Phone number must not exceed 16 characters")
    .optional(),

  address: z
    .object({
      city: z
        .string()
        .trim()
        .min(2, "City must be at least 2 characters")
        .max(20, "City must not exceed 20 characters")
        .optional(),

      postalCode: z
        .string()
        .trim()
        .min(3, "Postal code must be at least 3 characters")
        .max(10, "Postal code must not exceed 10 characters")
        .optional(),

      state: z
        .string()
        .trim()
        .min(2, "State must be at least 2 characters")
        .max(30, "State must not exceed 30 characters")
        .optional(),

      street: z
        .string()
        .trim()
        .min(3, "Street must be at least 3 characters")
        .max(100, "Street must not exceed 100 characters")
        .optional(),
    })
    .optional(),
});
