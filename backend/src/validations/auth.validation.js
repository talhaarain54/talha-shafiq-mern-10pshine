import { z } from "zod";

const signUpSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be atleast 3 characters long"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password too weak: Needs upper, lower, number, and special character"
    ),
  }),
});

const signInSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export {
    signUpSchema,
    signInSchema,
}