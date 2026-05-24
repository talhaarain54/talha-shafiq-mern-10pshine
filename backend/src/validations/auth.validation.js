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

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email").optional(),
  }).refine((data) => data.name || data.email, {
    message: "At least one field (name or email) is required",
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password too weak: Needs upper, lower, number, and special character"
      ),
  })
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password too weak"
      ),
  }),
});


export {
    signUpSchema,
    signInSchema,
    changePasswordSchema,
    updateProfileSchema,
    resetPasswordSchema,
    forgotPasswordSchema,
}