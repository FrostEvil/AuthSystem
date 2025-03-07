import { z } from "zod";

export const signUpFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  email: z
    .string()
    .email("Invalid email address")
    .min(5, "Email must be at least 5 characters long."),
  password: z
    .string()
    .min(8, "Password must be at leasst 8 characters long.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[\W_]/, "Password must contain at least one special character.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter."),
});

export const signInFormSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(5, "Email must be at least 5 characters long."),
  password: z
    .string()
    .min(8, "Password must be at leasst 8 characters long.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[\W_]/, "Password must contain at least one special character.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter."),
});
