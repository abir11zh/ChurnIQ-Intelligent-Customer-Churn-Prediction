import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm, type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Mail } from "lucide-react";
import { z } from "zod";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/button";
import { Input, Select } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { FormSubmitLoader } from "../../components/common/States";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/utils";
import { useToast } from "../../components/common/ToastProvider";
import * as authService from "../../services/authService";
import {
  forgotPasswordSchema,
  loginSchema,
  otpSchema,
  registerCompanySchema,
  registerPersonalSchema,
  registerSchema,
  registerWorkspaceSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type LoginFormValues,
  type ResetPasswordFormValues
} from "./authSchemas";

function applyZodErrors<T extends FieldValues>(error: z.ZodError, setError: UseFormSetError<T>) {
  error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field) {
      setError(field as Path<T>, { message: issue.message });
    }
  });
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-semibold text-danger">{message}</p>;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", passed: password.length >= 8 },
    { label: "Uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "Number", passed: /[0-9]/.test(password) }
  ];
  const strength = checks.filter((check) => check.passed).length;

  return (
    <div className="mt-3 rounded-2xl bg-slate-50 p-3">
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((item) => (
          <span key={item} className={cn("h-2 rounded-full bg-slate-200", item < strength && "bg-primary")} />
        ))}
      </div>
      <div className="mt-3 grid gap-1 text-xs font-semibold text-muted">
        {checks.map((check) => (
          <span key={check.label} className="flex items-center gap-2">
            <CheckCircle2 className={cn("h-3.5 w-3.5", check.passed ? "text-success" : "text-slate-300")} />
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SocialButtons() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button variant="outline" type="button" className="w-full">Continue with Google</Button>
      <Button variant="outline" type="button" className="w-full">Continue with Microsoft</Button>
    </div>
  );
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "john@churniq.local",
      password: "",
      remember: true
    }
  });

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const onSubmit = form.handleSubmit(async (values) => {
    setAuthError("");
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors<LoginFormValues>(parsed.error, form.setError);
      return;
    }
    try {
      await login(parsed.data);
      toast({ tone: "success", title: "Welcome back", description: "Your protected ChurnIQ AI workspace is ready." });
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid email or password.";
      setAuthError(message);
      toast({ tone: "error", title: "Login failed", description: message });
    }
  });

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your AI-powered customer intelligence platform." compact>
      <SocialButtons />
      <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase text-muted">
        <span className="h-px flex-1 bg-slate-100" />
        Workspace login
        <span className="h-px flex-1 bg-slate-100" />
      </div>
      <form noValidate className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-bold" htmlFor="login-email">Email</label>
          <Input id="login-email" type="email" autoComplete="email" className="mt-2" placeholder="you@company.com" {...form.register("email")} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>
        <div>
          <label className="text-sm font-bold" htmlFor="login-password">Password</label>
          <div className="relative mt-2">
            <Input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="pr-11" placeholder="Enter your password" {...form.register("password")} />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:bg-slate-100" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={form.formState.errors.password?.message} />
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 font-semibold text-muted">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" {...form.register("remember")} />
            Remember me
          </label>
          <Link className="font-bold text-primary" to="/auth/forgot-password">Forgot password?</Link>
        </div>
        {authError && <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-danger">{authError}</div>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <FormSubmitLoader label="Signing in..." /> : "Sign In"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account? <Link className="font-bold text-primary" to="/auth/register">Create account</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const [step, setStep] = useState(0);
  const { register: createAccount, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<FieldValues>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      industry: "",
      teamSize: "",
      role: "",
      workspaceName: "",
      primaryUseCase: ""
    }
  });
  const password = String(form.watch("password") ?? "");
  const steps = ["Personal Information", "Company Information", "Workspace Setup"];
  const schemas = [registerPersonalSchema, registerCompanySchema, registerWorkspaceSchema];

  const next = () => {
    const parsed = schemas[step].safeParse(form.getValues());
    if (!parsed.success) {
      applyZodErrors<FieldValues>(parsed.error, form.setError);
      return;
    }
    setStep((value) => Math.min(value + 1, steps.length - 1));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors<FieldValues>(parsed.error, form.setError);
      return;
    }
    await createAccount({
      fullName: String(values.fullName),
      email: String(values.email),
      password: String(values.password),
      companyName: String(values.companyName),
      workspaceName: String(values.workspaceName),
      role: String(values.role)
    });
    toast({ tone: "success", title: "Workspace created", description: "Your ChurnIQ AI workspace is ready." });
    navigate("/auth/verify-email", { replace: true });
  });

  return (
    <AuthLayout title="Create your ChurnIQ AI workspace" subtitle="Start predicting customer churn and protecting revenue with AI.">
      <SocialButtons />
      <div className="my-6 grid grid-cols-3 gap-2">
        {steps.map((label, index) => (
          <div key={label} className={cn("rounded-2xl border p-3 text-center text-xs font-extrabold", index <= step ? "border-primary/20 bg-[#f2efff] text-primary" : "border-slate-100 bg-slate-50 text-muted")}>
            <span className="block text-sm">{index + 1}</span>
            {label}
          </div>
        ))}
      </div>
      <form noValidate onSubmit={onSubmit}>
        {step === 0 && (
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-bold" htmlFor="fullName">Full Name</label>
              <Input id="fullName" className="mt-2" placeholder="Full name" {...form.register("fullName")} />
              <FieldError message={String(form.formState.errors.fullName?.message ?? "")} />
            </div>
            <div>
              <label className="text-sm font-bold" htmlFor="register-email">Email</label>
              <Input id="register-email" type="email" className="mt-2" placeholder="you@company.com" {...form.register("email")} />
              <FieldError message={String(form.formState.errors.email?.message ?? "")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-bold" htmlFor="register-password">Password</label>
                <Input id="register-password" type="password" className="mt-2" placeholder="Create password" {...form.register("password")} />
                <FieldError message={String(form.formState.errors.password?.message ?? "")} />
              </div>
              <div>
                <label className="text-sm font-bold" htmlFor="confirm-password">Confirm Password</label>
                <Input id="confirm-password" type="password" className="mt-2" placeholder="Confirm password" {...form.register("confirmPassword")} />
                <FieldError message={String(form.formState.errors.confirmPassword?.message ?? "")} />
              </div>
            </div>
            <PasswordStrength password={password} />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-bold" htmlFor="companyName">Company Name</label>
              <Input id="companyName" className="mt-2" placeholder="Company Inc." {...form.register("companyName")} />
              <FieldError message={String(form.formState.errors.companyName?.message ?? "")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-bold" htmlFor="industry">Industry</label>
                <Select id="industry" className="mt-2" {...form.register("industry")}>
                  <option value="">Select industry</option>
                  <option>Telecom</option>
                  <option>SaaS</option>
                  <option>Financial Services</option>
                  <option>Retail</option>
                </Select>
                <FieldError message={String(form.formState.errors.industry?.message ?? "")} />
              </div>
              <div>
                <label className="text-sm font-bold" htmlFor="teamSize">Team Size</label>
                <Select id="teamSize" className="mt-2" {...form.register("teamSize")}>
                  <option value="">Select team size</option>
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201+</option>
                </Select>
                <FieldError message={String(form.formState.errors.teamSize?.message ?? "")} />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold" htmlFor="role">Role</label>
              <Select id="role" className="mt-2" {...form.register("role")}>
                <option value="">Select role</option>
                <option>Founder</option>
                <option>Retention Manager</option>
                <option>Data Analyst</option>
                <option>Customer Success Lead</option>
              </Select>
              <FieldError message={String(form.formState.errors.role?.message ?? "")} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-bold" htmlFor="workspaceName">Workspace Name</label>
              <Input id="workspaceName" className="mt-2" placeholder="Retention Command Center" {...form.register("workspaceName")} />
              <FieldError message={String(form.formState.errors.workspaceName?.message ?? "")} />
            </div>
            <div>
              <label className="text-sm font-bold" htmlFor="primaryUseCase">Primary Use Case</label>
              <Select id="primaryUseCase" className="mt-2" {...form.register("primaryUseCase")}>
                <option value="">Select primary use case</option>
                <option>Customer churn prediction</option>
                <option>Revenue protection</option>
                <option>Retention campaign planning</option>
                <option>Executive churn reporting</option>
              </Select>
              <FieldError message={String(form.formState.errors.primaryUseCase?.message ?? "")} />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => (step === 0 ? navigate("/auth/login") : setStep((value) => value - 1))}>
            {step === 0 ? "Back to login" : "Back"}
          </Button>
          {step < 2 ? (
            <Button type="button" onClick={next}>Next</Button>
          ) : (
            <Button type="submit" disabled={isLoading}>{isLoading ? <FormSubmitLoader label="Creating..." /> : "Create Account"}</Button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const form = useForm<ForgotPasswordFormValues>({ defaultValues: { email: "" } });
  const [loading, setLoading] = useState(false);

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors<ForgotPasswordFormValues>(parsed.error, form.setError);
      return;
    }
    setLoading(true);
    await authService.sendPasswordReset(parsed.data.email);
    setLoading(false);
    setSent(true);
    toast({ tone: "success", title: "Reset email sent", description: "Check your inbox for secure reset instructions." });
  });

  return (
    <AuthLayout title={sent ? "Check your inbox" : "Reset your password"} subtitle="Enter your email and we will send you reset instructions." compact>
      {sent ? (
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-green-50 text-success">
            <Mail className="h-7 w-7" />
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">We sent reset instructions to your email address. The link expires soon for security.</p>
          <Button asChild className="mt-6 w-full"><Link to="/auth/login">Back to login</Link></Button>
        </div>
      ) : (
        <form noValidate className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-bold" htmlFor="forgot-email">Email</label>
            <Input id="forgot-email" type="email" className="mt-2" placeholder="you@company.com" {...form.register("email")} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? <FormSubmitLoader label="Sending..." /> : "Send reset link"}</Button>
          <Link className="flex items-center justify-center gap-2 text-sm font-bold text-primary" to="/auth/login"><ArrowLeft className="h-4 w-4" /> Back to login</Link>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<ResetPasswordFormValues>({ defaultValues: { password: "", confirmPassword: "" } });
  const password = form.watch("password");

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors<ResetPasswordFormValues>(parsed.error, form.setError);
      return;
    }
    setLoading(true);
    await authService.updatePassword();
    setLoading(false);
    setUpdated(true);
    toast({ tone: "success", title: "Password updated", description: "You can now sign in with your new password." });
  });

  return (
    <AuthLayout title={updated ? "Password updated successfully" : "Create new password"} subtitle="Use a strong password to keep your analytics workspace protected." compact>
      {updated ? (
        <Button asChild className="w-full"><Link to="/auth/login">Back to login</Link></Button>
      ) : (
        <form noValidate className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-bold" htmlFor="new-password">New Password</label>
            <Input id="new-password" type="password" className="mt-2" {...form.register("password")} />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <div>
            <label className="text-sm font-bold" htmlFor="new-password-confirm">Confirm New Password</label>
            <Input id="new-password-confirm" type="password" className="mt-2" {...form.register("confirmPassword")} />
            <FieldError message={form.formState.errors.confirmPassword?.message} />
          </div>
          <PasswordStrength password={password} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? <FormSubmitLoader label="Updating..." /> : "Update Password"}</Button>
        </form>
      )}
    </AuthLayout>
  );
}

export function VerifyEmailPage() {
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const resend = async () => {
    await authService.resendVerificationEmail();
    setSent(true);
    toast({ tone: "success", title: "Verification email sent", description: "Please check your inbox." });
  };

  return (
    <AuthLayout title="Check your email" subtitle="We sent a verification link to secure your ChurnIQ AI workspace." compact>
      <div className="text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-[#f2efff] text-primary">
          <Mail className="h-9 w-9" />
        </div>
        <p className="mt-5 text-sm leading-6 text-muted">Verify your email before inviting your team or exporting customer intelligence reports.</p>
        {sent && <Badge className="mt-4" tone="success">Email resent</Badge>}
        <div className="mt-6 grid gap-3">
          <Button onClick={resend}>Resend email</Button>
          <Button asChild variant="outline"><Link to="/auth/login">Back to login</Link></Button>
        </div>
      </div>
    </AuthLayout>
  );
}

export function OtpPage() {
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (timer <= 0) return;
    const id = window.setInterval(() => setTimer((value) => value - 1), 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  const submit = async () => {
    const parsed = otpSchema.safeParse({ code });
    if (!parsed.success) {
      toast({ tone: "error", title: "Invalid code", description: parsed.error.issues[0]?.message });
      return;
    }
    setLoading(true);
    await authService.verifyOtp(parsed.data.code);
    setLoading(false);
    toast({ tone: "success", title: "Workspace verified", description: "Your secure session is active." });
    navigate("/dashboard", { replace: true });
  };

  return (
    <AuthLayout title="Enter verification code" subtitle="Use the 6-digit code sent to your email." compact>
      <div className="space-y-5">
        <div>
          <label className="text-sm font-bold" htmlFor="otp-code">6-digit code</label>
          <Input
            id="otp-code"
            inputMode="numeric"
            maxLength={6}
            className="mt-2 h-14 text-center text-2xl font-extrabold tracking-[0.45em]"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <div className="mt-3 grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid h-12 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-lg font-extrabold">
                {code[index] ?? ""}
              </div>
            ))}
          </div>
        </div>
        <Button className="w-full" onClick={submit} disabled={loading}>{loading ? <FormSubmitLoader label="Verifying..." /> : "Verify"}</Button>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-muted">{timer > 0 ? `Resend available in ${timer}s` : "You can resend now"}</span>
          <button type="button" className="font-bold text-primary disabled:text-muted" disabled={timer > 0} onClick={() => setTimer(45)}>Resend code</button>
        </div>
      </div>
    </AuthLayout>
  );
}

export function SessionExpiredPage() {
  const { clearSessionExpired } = useAuth();

  return (
    <AuthLayout title="Session expired" subtitle="Your secure workspace session ended. Please sign in again." compact>
      <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-700">
        This protects customer intelligence and revenue analytics from unauthorized access.
      </div>
      <Button asChild className="mt-6 w-full" onClick={clearSessionExpired}><Link to="/auth/login">Sign in again</Link></Button>
    </AuthLayout>
  );
}
