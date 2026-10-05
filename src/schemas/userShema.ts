import z from "zod";

export const UserSchema = z.object({
  name: z.string().min(3).max(20),
  email: z.email(),
  phone: z.e164(),
});

export const passwordSchema = z
  .string("Password must be a string")
  .min(8, "Password must be at least 8 characters long")
  .max(32, "Password cannot exceed 32 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const userProfileSchema = z.object({
  firstName: z
    .string("First name must be a string")
    .min(3, "First name must be at least 3 characters")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string("Last name must be a string")
    .min(1, "Last Name must be at least 1 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .nullish(),
});

export const changePasswordSchema = z
  .object({
    oldPassword: passwordSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const tokenUpdateSchema = z
  .object({
    providerId: z.number().positive(),
    token: z.string().min(1, "Token is required"),
  });

export type UserProfileType = z.infer<typeof userProfileSchema>;
export type ChangePasswordType = z.infer<typeof changePasswordSchema>;
export type TokenUpdateType = z.infer<typeof tokenUpdateSchema>;
