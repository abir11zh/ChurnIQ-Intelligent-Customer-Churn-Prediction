import { z } from "zod";

const passwordRules = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .regex(/[A-Z]/, "Password must include one uppercase letter.")
  .regex(/[0-9]/, "Password must include one number.");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid work email."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional()
});

const registerPersonalBaseSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required."),
    email: z.string().email("Enter a valid email."),
    password: passwordRules,
    confirmPassword: z.string().min(1, "Confirm your password.")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  });

export const registerPersonalSchema = registerPersonalBaseSchema;

export const registerCompanySchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  industry: z.string().min(1, "Select an industry."),
  teamSize: z.string().min(1, "Select a team size."),
  role: z.string().min(1, "Select your role.")
});

export const registerWorkspaceSchema = z.object({
  workspaceName: z.string().min(2, "Workspace name is required."),
  primaryUseCase: z.string().min(1, "Select a primary use case.")
});

export const registerSchema = registerPersonalBaseSchema.and(registerCompanySchema).and(registerWorkspaceSchema);

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email.")
});

export const resetPasswordSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string().min(1, "Confirm your new password.")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  });

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code.")
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
