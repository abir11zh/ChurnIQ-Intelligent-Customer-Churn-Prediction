import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CloudUpload,
  Cpu,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
  type LucideIcon
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input, Select } from "../components/ui/input";
import { useToast } from "../components/common/ToastProvider";
import { HeroDashboardIllustration, RobotIllustration } from "../components/Illustrations";
import { Logo } from "../components/Logo";
import { ChurnLineChart, CustomerBarChart, RetentionRadar, RiskDonut } from "../components/Charts";
import { ExecutiveDashboard } from "../features/dashboard/ExecutiveDashboard";
import { CopilotHistoryPage, CopilotInsightsPage, CopilotReportsPage, CopilotWorkspacePage } from "../features/copilot/CopilotWorkspace";
import { CustomerIntelligencePage, CustomerProfilePage, CustomerSegmentsPage } from "../features/customers/CustomerIntelligence";
import {
  ExplainabilityCenterPage,
  GlobalShapPage,
  LocalShapPage,
  ShapBusinessInsightsPage,
  ShapComparisonPage
} from "../features/explainability/ExplainabilityCenter";
import {
  ExecutiveChurnPage,
  ExecutiveCohortsPage,
  ExecutiveForecastingPage,
  ExecutiveJourneyPage,
  ExecutiveLtvPage,
  ExecutiveOverviewPage,
  ExecutiveRevenuePage
} from "../features/executive/ExecutiveAnalytics";
import {
  ActivityCenterPage,
  ApiKeysPage,
  AuditLogsPage,
  EnterpriseBillingPage,
  EnterpriseHelpCenterPage,
  EnterpriseNotificationsPage,
  EnterpriseSupportCenterPage,
  EnterpriseTeamPage,
  OrganizationPage,
  SecurityCenterPage,
  SystemHealthPage,
  WorkspaceSettingsPage
} from "../features/enterprise/EnterpriseSaas";
import { scheduledReports } from "../features/enterprise/enterpriseData";
import {
  ApiPlatformPage,
  CommunicationIntegrationsPage,
  CrmIntegrationsPage,
  DataIntegrationsPage,
  EcosystemIntegrationsHubPage,
  MarketplacePage,
  WebhookCenterPage
} from "../features/integrations/IntegrationsEcosystem";
import {
  MlopsDashboardPage,
  MlopsDataQualityPage,
  MlopsDatasetsPage,
  MlopsDriftPage,
  MlopsModelsPage,
  MlopsMonitoringPage,
  MlopsRegistryPage,
  MlopsRetrainingPage
} from "../features/mlops/MlopsCenter";
import {
  BatchPredictionPage,
  PredictionCenterPage,
  PredictionHistoryPage as PredictionHistoryExperiencePage,
  PredictionInsightsPage,
  PredictionResultPage
} from "../features/predictions/PredictionExperience";
import { SmartHomeDashboard } from "../features/personalization/SmartHomeDashboard";
import {
  RetentionCampaignsPage,
  RetentionDashboardPage,
  RetentionOpportunitiesPage,
  RetentionPlaybooksPage,
  RetentionSimulatorPage
} from "../features/retention/RetentionIntelligence";
import {
  activity,
  churnAnalytics,
  customers,
  helpTopics,
  insights,
  kpis,
  landingFeatures,
  reports,
  revenueTrend,
  shapFactors,
  uploadStats
} from "../data/mock";
import { cn } from "../lib/utils";
import { downloadCsv } from "../lib/exportUtils";
import { getDashboardSummary, getModelMonitoring, getModelPerformance, getReportsIndex, getSegmentationSummary, predictCustomer, type PredictionResultData } from "../lib/api";
import { predictionSchema, type PredictionFormValues } from "../lib/schemas";
import { ProjectCustomersTable } from "../components/ProjectCustomersTable";
import { RoleGuard, useAuth } from "../lib/auth";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 }
};

export function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-muted md:flex">
          <a href="#features">Product</a>
          <a href="#workflow">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">Resources</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/auth/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/register">Get Started</Link>
          </Button>
        </div>
      </header>

      <section className="hero-surface soft-grid">
        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.55 }}>
            <Badge tone="primary">AI churn prediction platform</Badge>
            <h1 className="mt-5 max-w-2xl text-5xl font-extrabold leading-tight tracking-normal text-ink sm:text-6xl">
              AI-Powered Customer Churn Prediction
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
              Identify at-risk customers, explain every prediction, and launch retention workflows before revenue leaves.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/dashboard">Get Started Free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/predictions/single">Watch Demo</Link>
              </Button>
            </div>
            <div className="mt-12">
              <p className="text-sm font-semibold text-muted">Trusted by 1,000+ companies worldwide</p>
              <div className="mt-4 flex flex-wrap items-center gap-5 text-sm font-extrabold text-slate-500">
                <span className="text-[#4285F4]">Google</span>
                <span>Microsoft</span>
                <span className="text-[#FF5A5F]">airbnb</span>
                <span className="text-[#1DB954]">Spotify</span>
                <span className="text-[#0061FF]">Dropbox</span>
              </div>
            </div>
          </motion.div>
          <HeroDashboardIllustration />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20">
        <SectionHeading eyebrow="Features" title="Everything a retention team needs." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {landingFeatures.map((feature) => (
            <Card key={feature.title} className="transition hover:-translate-y-1">
              <feature.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-5 text-lg font-extrabold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="workflow" className="bg-[#fbfbff] py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="AI workflow" title="From model score to action." align="left" />
            <div className="space-y-4">
              {["Upload customer data", "Predict risk and explain factors", "Create retention campaign", "Export executive report"].map((step, index) => (
                <div key={step} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2efff] text-sm font-extrabold text-primary">{index + 1}</span>
                  <span className="font-bold">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-8">
            <RobotIllustration />
          </Card>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-5 py-20">
        <SectionHeading eyebrow="Pricing" title="Plans for every churn team." />
        <div className="grid gap-5 md:grid-cols-3">
          {["Starter", "Growth", "Enterprise"].map((plan, index) => (
            <Card key={plan} className={cn(index === 1 && "border-primary/30 ring-4 ring-primary/10")}>
              <Badge tone={index === 1 ? "primary" : "neutral"}>{index === 1 ? "Popular" : "Plan"}</Badge>
              <h3 className="mt-5 text-2xl font-extrabold">{plan}</h3>
              <p className="mt-2 text-muted">{index === 2 ? "Custom" : `$${index === 0 ? "49" : "149"}/mo`}</p>
              <Button className="mt-6 w-full">Choose plan</Button>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted">ChurnIQ AI. Enterprise churn intelligence.</p>
        </div>
      </footer>
    </div>
  );
}

export function SmartHome() {
  return <SmartHomeDashboard />;
}

export function DemoMode() {
  const demoMetrics = [
    ["Demo Customers", "7,043", "Telecom customer base"],
    ["Demo Predictions", "1,253", "Logistic Regression scoring history"],
    ["Demo Analytics", "26.5%", "Current churn rate"],
    ["Demo Reports", "18", "Executive-ready exports"],
    ["Demo Insights", "42", "AI business recommendations"]
  ];

  return (
    <motion.div variants={fade} initial="hidden" animate="show" className="space-y-6">
      <div className="premium-surface rounded-[2rem] border border-slate-100 p-6 shadow-soft dark:border-white/10">
        <Badge tone="primary"><Sparkles className="h-3.5 w-3.5" /> Product demo mode</Badge>
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight text-ink dark:text-white">Presentation-safe customer intelligence workspace.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">Use this mode for professors, recruiters, investors and enterprise demos without exposing real customer data.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild><Link to="/dashboard">Open Dashboard</Link></Button>
          <Button asChild variant="outline"><Link to="/predictions/single">Run Demo Prediction</Link></Button>
          <Button asChild variant="outline"><Link to="/copilot">Ask Copilot</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {demoMetrics.map(([label, value, detail]) => (
          <Card key={label}>
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="mt-4 text-sm font-bold text-muted">{label}</p>
            <p className="mt-2 text-3xl font-extrabold">{value}</p>
            <p className="mt-2 text-sm text-muted">{detail}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Guided Demo Flow</CardTitle>
              <CardDescription>Conference-ready path through the strongest CHURNIQ AI moments.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            {[
              ["Executive Dashboard", "Show churn situation, revenue risk and Logistic Regression performance.", "/dashboard"],
              ["Customer CRM", "Open a high-risk customer and explain business context.", "/customers"],
              ["Prediction Center", "Run a clean manual prediction with live risk estimation.", "/predictions/single"],
              ["Explainable AI", "Translate feature impact into plain business language.", "/shap"],
              ["Retention Intelligence", "Simulate risk reduction and revenue saved.", "/retention"]
            ].map(([title, detail, href], index) => (
              <Link key={title} to={href} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-[#f6f4ff] dark:bg-white/5 dark:hover:bg-white/10">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2efff] text-sm font-extrabold text-primary">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold">{title}</span>
                  <span className="mt-1 block text-sm text-muted">{detail}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            ))}
          </div>
        </Card>
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-primary via-secondary to-accent p-6 text-white">
            <Badge className="bg-white/20 text-white" tone="primary">Live demo script</Badge>
            <h2 className="mt-4 text-3xl font-extrabold">One product, five questions answered.</h2>
            <p className="mt-3 text-sm leading-6 text-white/82">Who will churn? Why? Which metric matters? How much revenue is at risk? What should we do next?</p>
          </div>
          <div className="grid gap-3 p-5">
            {["Demo Customers", "Demo Predictions", "Demo Analytics", "Demo Reports", "Demo Insights"].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4 font-bold dark:bg-white/5">{item}</div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

export function InvestorDemo() {
  const scorecard = [
    ["Revenue Protected", "$2.4M", "+18% QoQ", "success"],
    ["Customers Saved", "1,284", "+312 this quarter", "primary"],
    ["Model ROC-AUC", "84.7%", "CatBoost technical champion", "primary"],
    ["Retention Success", "73%", "Across active campaigns", "success"],
    ["Campaign ROI", "4.8x", "Revenue saved vs cost", "warning"],
    ["Revenue At Risk", "$45.2K", "Prioritized this week", "danger"]
  ] as const;

  return (
    <motion.div variants={fade} initial="hidden" animate="show" className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-br from-ink via-slate-900 to-primary p-6 text-white shadow-glass">
        <Badge className="bg-white/15 text-white" tone="primary"><BarChart3 className="h-3.5 w-3.5" /> Investor Demo</Badge>
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight">CHURNIQ AI is a revenue protection platform, not just a prediction dashboard.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/76">It combines governed churn prediction, explainable AI, business intelligence, retention simulation, Copilot workflows, enterprise governance and integrations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {scorecard.map(([label, value, detail, tone]) => (
          <Card key={label}>
            <Badge tone={tone}>{detail}</Badge>
            <p className="mt-5 text-sm font-bold text-muted">{label}</p>
            <p className="mt-2 text-4xl font-extrabold">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI Advantages</CardTitle>
              <CardDescription>The reasons this platform feels commercially defensible.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            {[
              ["Recall-aware model governance", "CatBoost leads ROC-AUC while Logistic Regression leads the business recall objective."],
              ["Explainability layer", "SHAP-style business explanations for managers and executives."],
              ["Retention intelligence", "Turns predictions into actions, ROI and revenue saved."],
              ["Enterprise SaaS layer", "Teams, roles, audit logs, API keys, integrations and MLOps."]
            ].map(([title, detail]) => (
              <div key={title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="font-extrabold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{detail}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Success Stories</CardTitle>
              <CardDescription>Case-study style outcomes for demo storytelling.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Revenue Saved", "$420K", "High-value telecom segment retained with support upgrade."],
              ["Risk Reduced", "24%", "Discount simulator lowered critical customer risk from 82% to 58%."],
              ["Campaign Success", "68 customers", "AI recommended retention campaign generated positive ROI."],
              ["Customers Retained", "312", "At-risk cohort stabilized after targeted retention workflows."]
            ].map(([title, value, detail]) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-bold text-muted">{title}</p>
                <p className="mt-2 text-3xl font-extrabold text-primary">{value}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

export function Login() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfbff] text-ink">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.5 }} className="relative hidden lg:block">
          <Logo />
          <div className="mt-12">
            <Badge tone="primary">Recall-Aware Model Governance</Badge>
            <h1 className="mt-5 max-w-xl text-5xl font-extrabold leading-tight tracking-normal">
              AI-Powered Customer Intelligence Platform
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted">
              Predict churn, explain every risk signal and protect revenue from one premium command center.
            </p>
          </div>
          <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
            {[
              ["84.7%", "ROC-AUC Benchmark"],
              ["7000+", "Customers Analyzed"],
              ["Real-Time", "Risk Detection"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-extrabold text-primary">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase text-muted">{label}</p>
              </div>
            ))}
          </div>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="mt-6 max-w-lg">
            <RobotIllustration />
          </motion.div>
        </motion.div>

        <div className="grid place-items-center">
          <Card className="w-full max-w-md border-primary/10 bg-white/92 p-8 shadow-soft backdrop-blur">
            <div className="mb-8 text-center">
              <Logo className="justify-center" />
              <h2 className="mt-8 text-3xl font-extrabold">Welcome Back</h2>
              <p className="mt-2 text-sm leading-6 text-muted">AI-Powered Customer Intelligence Platform</p>
            </div>
            <div className="grid gap-3">
              <Button variant="outline" className="w-full">Continue with Google</Button>
              <Button variant="outline" className="w-full">Continue with Microsoft</Button>
            </div>
            <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase text-muted">
              <span className="h-px flex-1 bg-slate-100" />
              Secure workspace login
              <span className="h-px flex-1 bg-slate-100" />
            </div>
            <div className="space-y-4">
              <Input placeholder="Email address" type="email" />
              <Input placeholder="Password" type="password" />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted"><input type="checkbox" /> Remember me</label>
                <Link className="font-semibold text-primary" to="/auth/forgot-password">Forgot password?</Link>
              </div>
            </div>
            <Button asChild className="mt-6 w-full">
              <Link to="/dashboard" onClick={() => signIn("Admin")}>Sign in</Link>
            </Button>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-bold text-muted">
              <span className="rounded-xl bg-[#f6f4ff] px-2 py-3">94% Accuracy</span>
              <span className="rounded-xl bg-[#f6f4ff] px-2 py-3">CatBoost</span>
              <span className="rounded-xl bg-[#f6f4ff] px-2 py-3">Live Alerts</span>
            </div>
            <p className="mt-5 text-center text-sm text-muted">
              Do not have an account? <Link className="font-semibold text-primary" to="/auth/register">Sign up</Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  return (
    <AuthLayout title="Create your workspace" subtitle="Start with a guided multi-step setup" cta="Create account">
      <div className="grid grid-cols-3 gap-2">
        {["Profile", "Company", "Model"].map((step, index) => (
          <div key={step} className="rounded-xl bg-[#f6f4ff] px-3 py-2 text-center text-xs font-bold text-primary">
            {index + 1}. {step}
          </div>
        ))}
      </div>
      <div className="space-y-4 pt-3">
        <Input placeholder="Full name" />
        <Input placeholder="Work email" type="email" />
        <Input placeholder="Company" />
        <Input placeholder="Password" type="password" />
      </div>
    </AuthLayout>
  );
}

export function ForgotPassword() {
  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email to receive a secure reset link." cta="Send reset link" ctaTo="/auth/reset-password">
      <div className="space-y-4 pt-3">
        <Input placeholder="Work email" type="email" />
        <div className="rounded-2xl bg-[#f6f4ff] p-4 text-sm leading-6 text-muted">
          Password recovery is protected by workspace policy, MFA checks and audit logging.
        </div>
      </div>
    </AuthLayout>
  );
}

export function ResetPassword() {
  return (
    <AuthLayout title="Create new password" subtitle="Choose a strong password for your ChurnIQ workspace." cta="Update password" ctaTo="/auth/login">
      <div className="space-y-4 pt-3">
        <Input placeholder="New password" type="password" />
        <Input placeholder="Confirm password" type="password" />
        <div className="grid gap-2 text-sm text-muted">
          {["At least 12 characters", "One uppercase letter", "One number or symbol"].map((rule) => (
            <span key={rule} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> {rule}</span>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}

export function Dashboard() {
  return <ExecutiveDashboard />;
}

export function ExecutiveAnalytics() {
  return <ExecutiveOverviewPage />;
}

export function ExecutiveRevenue() {
  return <ExecutiveRevenuePage />;
}

export function ExecutiveChurn() {
  return <ExecutiveChurnPage />;
}

export function ExecutiveCohorts() {
  return <ExecutiveCohortsPage />;
}

export function ExecutiveCustomerLtv() {
  return <ExecutiveLtvPage />;
}

export function ExecutiveForecasting() {
  return <ExecutiveForecastingPage />;
}

export function ExecutiveJourney() {
  return <ExecutiveJourneyPage />;
}

export function Organization() {
  return <OrganizationPage />;
}

export function ActivityCenter() {
  return <ActivityCenterPage />;
}

export function AuditLogs() {
  return <AuditLogsPage />;
}

export function Billing() {
  return <EnterpriseBillingPage />;
}

export function ApiKeys() {
  return <ApiKeysPage />;
}

export function IntegrationsHub() {
  return <EcosystemIntegrationsHubPage />;
}

export function IntegrationsCrm() {
  return <CrmIntegrationsPage />;
}

export function IntegrationsCommunication() {
  return <CommunicationIntegrationsPage />;
}

export function IntegrationsData() {
  return <DataIntegrationsPage />;
}

export function IntegrationsWebhooks() {
  return <WebhookCenterPage />;
}

export function IntegrationsApi() {
  return <ApiPlatformPage />;
}

export function IntegrationsMarketplace() {
  return <MarketplacePage />;
}

export function SystemHealth() {
  return <SystemHealthPage />;
}

export function SecurityCenter() {
  return <SecurityCenterPage />;
}

export function MlopsDashboard() {
  return <MlopsDashboardPage />;
}

export function MlopsModels() {
  return <MlopsModelsPage />;
}

export function MlopsMonitoring() {
  return <MlopsMonitoringPage />;
}

export function MlopsDrift() {
  return <MlopsDriftPage />;
}

export function MlopsDataQuality() {
  return <MlopsDataQualityPage />;
}

export function MlopsDatasets() {
  return <MlopsDatasetsPage />;
}

export function MlopsRetraining() {
  return <MlopsRetrainingPage />;
}

export function MlopsRegistry() {
  return <MlopsRegistryPage />;
}

export function CustomerList() {
  const useCustomerCrm: boolean = true;
  if (useCustomerCrm) return <CustomerIntelligencePage />;

  return (
    <Page title="Customers" subtitle="Customer management connected to the Telco churn dataset.">
      <div className="grid gap-5 md:grid-cols-4">
        {[
          ["VIP", "842", "Premium revenue accounts"],
          ["Loyal", "2,418", "Long-tenure low risk"],
          ["At Risk", "1,234", "Needs retention action"],
          ["New", "689", "Onboarding cohort"]
        ].map(([label, value, text], index) => (
          <Card key={label}>
            <Badge tone={index === 0 ? "primary" : index === 1 ? "success" : index === 2 ? "danger" : "warning"}>{label}</Badge>
            <p className="mt-4 text-3xl font-extrabold">{value}</p>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input className="pl-10" placeholder="Advanced search by customer, email, contract, segment..." />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline"><SlidersHorizontal className="h-4 w-4" /> Advanced Filters</Button>
            <Button variant="outline"><Filter className="h-4 w-4" /> Risk</Button>
            <Button variant="outline"><Download className="h-4 w-4" /> Export</Button>
            <Button><Plus className="h-4 w-4" /> Add Customer</Button>
          </div>
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {["High risk", "Month-to-month", "No tech support", "High revenue", "New customers"].map((filter) => (
            <button key={filter} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-muted transition hover:bg-[#f2efff] hover:text-primary dark:bg-white/5">
              {filter}
            </button>
          ))}
        </div>
        <ProjectCustomersTable />
      </Card>
    </Page>
  );
}

export function CustomerSegmentation() {
  const useCustomerSegments: boolean = true;
  if (useCustomerSegments) return <CustomerSegmentsPage />;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["segmentation-summary"],
    queryFn: getSegmentationSummary
  });

  if (isLoading) {
    return <LoadingPage title="Customer Segmentation" />;
  }

  if (isError || !data) {
    return <ErrorCard title="Customer Segmentation" message="Unable to load segmentation metrics from the FastAPI backend." />;
  }

  const maxCustomers = Math.max(...data.segments.map((segment) => segment.customers), 1);
  const colors: Record<string, string> = {
    "At Risk": "bg-danger",
    VIP: "bg-primary",
    Loyal: "bg-success",
    New: "bg-warning",
    Core: "bg-accent"
  };

  return (
    <Page title="Customer Segmentation" subtitle="Lifecycle cohorts built from contract, tenure, charges and churn behavior.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {data.segments.map((segment) => (
          <Card key={segment.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted">{segment.name}</p>
                <p className="mt-2 text-3xl font-extrabold">{segment.customers.toLocaleString()}</p>
              </div>
              <Badge tone={segment.priority === "High" ? "danger" : segment.priority === "Stable" ? "success" : "warning"}>{segment.priority}</Badge>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-100">
              <div className={cn("h-full rounded-full", colors[segment.name] ?? "bg-primary")} style={{ width: `${(segment.customers / maxCustomers) * 100}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted">Churn</p>
                <p className="font-extrabold">{segment.churn_rate}%</p>
              </div>
              <div>
                <p className="text-muted">Avg tenure</p>
                <p className="font-extrabold">{segment.avg_tenure} mo</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Tenure vs Monthly Charges</CardTitle>
              <CardDescription>High-charge short-tenure customers cluster toward churn risk.</CardDescription>
            </div>
            <Badge tone="primary">{data.scatter.length} sample points</Badge>
          </CardHeader>
          <div className="relative h-96 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-slate-900">
            <div className="absolute inset-x-8 bottom-8 top-8 border-b border-l border-slate-200" />
            {data.scatter.map((point, index) => (
              <span
                key={`${point.customer_id}-${index}`}
                className={cn("absolute h-3 w-3 rounded-full shadow-sm", point.churned ? "bg-danger" : colors[point.segment] ?? "bg-primary")}
                title={`${point.customer_id} - ${point.segment}`}
                style={{
                  left: `${8 + Math.min(point.tenure / 72, 1) * 84}%`,
                  bottom: `${8 + Math.min(point.monthly_charges / 120, 1) * 84}%`
                }}
              />
            ))}
            <span className="absolute bottom-2 left-8 text-xs font-bold text-muted">Tenure</span>
            <span className="absolute left-2 top-8 text-xs font-bold text-muted">Charges</span>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardTitle>Contract Mix</CardTitle>
            <div className="mt-5 space-y-4">
              {data.contract_mix.map((item) => (
                <div key={item.Contract}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">{item.Contract}</span>
                    <span className="text-muted">{item.customers.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(item.customers / 7043) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardTitle>Recommended Cohort Plays</CardTitle>
            <div className="mt-5 space-y-3">
              {data.recommendations.map((recommendation) => (
                <div key={recommendation} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                  <Target className="mt-0.5 h-4 w-4 text-primary" />
                  <p className="text-sm leading-6 text-muted">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}

export function CustomerDetails() {
  const useCustomerProfile: boolean = true;
  if (useCustomerProfile) return <CustomerProfilePage />;

  return (
    <Page title="Sarah Johnson" subtitle="CUST_03246">
      <div className="grid gap-5 md:grid-cols-4">
        {[
          ["Customer Health Score", "18/100", "Critical health"],
          ["Customer Lifetime Value", "$4,820", "High value account"],
          ["Revenue Contribution", "$1,200.50", "Annualized revenue"],
          ["Retention Priority", "P1", "Act this week"]
        ].map(([label, value, text], index) => (
          <Card key={label}>
            <Badge tone={index === 0 ? "danger" : index === 1 ? "primary" : index === 2 ? "success" : "warning"}>{label}</Badge>
            <p className="mt-4 text-3xl font-extrabold">{value}</p>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.7fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-200 to-primary" />
              <div>
                <h3 className="text-xl font-extrabold">Sarah Johnson</h3>
                <p className="text-sm text-muted">sarah@email.com</p>
              </div>
            </div>
            <Button variant="secondary">Edit Customer</Button>
          </div>
          <Tabs tabs={["Overview", "Services", "Billing", "History", "Prediction", "Notes"]} />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Email", "sarah@email.com"],
              ["Phone", "+1 (202) 123-4567"],
              ["Gender", "Female"],
              ["Senior Citizen", "No"],
              ["Partner", "Yes"],
              ["Dependents", "Yes"],
              ["Tenure", "12 months"],
              ["Contract Type", "Month-to-month"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-xs font-bold uppercase text-muted">{label}</p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="flex flex-col items-center justify-center">
          <RiskGauge value={82} label="Critical" />
          <p className="mt-4 text-center text-sm text-muted">Very high probability of churn based on billing, contract and service signals.</p>
          <Button asChild className="mt-5 w-full"><Link to="/predictions/single">Run New Prediction</Link></Button>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Services Overview</CardTitle>
              <CardDescription>Active services and missing support features.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Internet Service", "Fiber optic", "warning"],
              ["Tech Support", "No", "danger"],
              ["Online Security", "No", "danger"],
              ["Streaming TV", "Yes", "success"],
              ["Phone Service", "Yes", "success"],
              ["Device Protection", "No", "warning"]
            ].map(([label, value, tone]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                <span className="text-sm font-bold">{label}</span>
                <Badge tone={tone as "success" | "warning" | "danger"}>{value}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Prediction History</CardTitle>
              <CardDescription>Logistic Regression risk trend for this customer.</CardDescription>
            </div>
            <Badge tone="danger">Critical trend</Badge>
          </CardHeader>
          <div className="space-y-3">
            {[
              ["June 9, 2026", "82%", "Critical"],
              ["June 2, 2026", "76%", "High"],
              ["May 20, 2026", "68%", "High"]
            ].map(([date, score, level]) => (
              <div key={date} className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm md:grid-cols-[1fr_120px_120px] dark:bg-white/5">
                <span className="font-bold">{date}</span>
                <span className="font-extrabold">{score}</span>
                <Badge tone={level === "Critical" ? "danger" : "warning"}>{level}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <CardTitle>Customer Timeline</CardTitle>
          <div className="mt-5 space-y-4">
            {["Joined on month-to-month contract", "Monthly charges increased", "Tech support declined", "Churn risk crossed critical threshold"].map((event, index) => (
              <div key={event} className="flex gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-bold">{event}</p>
                  <p className="text-xs text-muted">{index + 1} months ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Retention History</CardTitle>
          <div className="mt-5 space-y-3">
            {[
              ["Discount offer", "Opened"],
              ["Support bundle", "Not sent"],
              ["Account manager call", "Scheduled"]
            ].map(([action, status]) => (
              <div key={action} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                <span className="text-sm font-bold">{action}</span>
                <Badge tone={status === "Opened" ? "success" : status === "Scheduled" ? "primary" : "warning"}>{status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>AI Recommendations</CardTitle>
          <div className="mt-5 space-y-3">
            {["Offer 15% discount", "Bundle premium tech support", "Move to one-year contract", "Schedule retention call"].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl bg-[#f6f4ff] p-3">
                <Target className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-sm font-bold">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Customer Risk Radar</CardTitle>
            <CardDescription>Contract, billing, support and engagement risk dimensions.</CardDescription>
          </div>
        </CardHeader>
        <RetentionRadar />
      </Card>
    </Page>
  );
}

export function Prediction() {
  const usePredictionExperience: boolean = true;
  if (usePredictionExperience) return <PredictionCenterPage />;

  const navigate = useNavigate();
  const predictionMutation = useMutation({
    mutationFn: predictCustomer,
    onSuccess: (prediction, variables) => {
      navigate("/predictions/single/result", {
        state: {
          prediction,
          input: variables
        }
      });
    }
  });
  const form = useForm<PredictionFormValues>({
    defaultValues: {
      gender: "Female",
      SeniorCitizen: "No",
      Partner: "Yes",
      Dependents: "No",
      PhoneService: "Yes",
      MultipleLines: "No",
      InternetService: "Fiber optic",
      OnlineSecurity: "No",
      OnlineBackup: "No",
      DeviceProtection: "No",
      TechSupport: "No",
      StreamingTV: "Yes",
      StreamingMovies: "Yes",
      Contract: "Month-to-month",
      PaperlessBilling: "Yes",
      PaymentMethod: "Electronic check",
      tenure: 12,
      MonthlyCharges: 70,
      TotalCharges: 840
    }
  });

  const submitPrediction = form.handleSubmit((values) => {
    const result = predictionSchema.safeParse(values);
    if (!result.success) {
      form.setError("MonthlyCharges", { message: "Please review the customer values before prediction." });
      return;
    }
    predictionMutation.mutate(result.data);
  });
  const watched = form.watch();
  const liveRisk = Math.min(
    96,
    Math.max(
      6,
      Math.round(
        (Number(watched.MonthlyCharges) || 0) / 2.2 +
          (watched.Contract === "Month-to-month" ? 24 : watched.Contract === "One year" ? 8 : -4) +
          (watched.TechSupport === "No" ? 12 : -5) +
          ((Number(watched.tenure) || 0) <= 12 ? 14 : (Number(watched.tenure) || 0) <= 24 ? 6 : -8)
      )
    )
  );
  const liveRiskLabel = liveRisk >= 80 ? "Critical" : liveRisk >= 60 ? "High" : liveRisk >= 40 ? "Medium" : "Low";
  const liveRiskTone = liveRisk >= 80 ? "danger" : liveRisk >= 40 ? "warning" : "success";

  return (
    <Page title="Prediction Center" subtitle="Manual real-time churn scoring with Logistic Regression as the automatic production model.">
      <Card>
        <form onSubmit={submitPrediction}>
        <div className="mb-6 grid gap-4 xl:grid-cols-[1fr_260px]">
          <div className="rounded-2xl bg-[#f6f4ff] p-5">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <p className="font-extrabold">Live risk estimation</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">The preview updates instantly from contract, tenure, support and monthly charges. Final prediction is scored by Logistic Regression.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Low", "Medium", "High", "Critical"].map((level) => (
                <Badge key={level} tone={level === liveRiskLabel ? liveRiskTone : "neutral"}>{level}</Badge>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center">
            <p className="text-sm font-semibold text-muted">Estimated risk</p>
            <p className={cn("mt-2 text-5xl font-extrabold", liveRiskTone === "danger" ? "text-danger" : liveRiskTone === "warning" ? "text-warning" : "text-success")}>{liveRisk}%</p>
            <Badge tone={liveRiskTone}>{liveRiskLabel}</Badge>
          </div>
        </div>
        <div className="mb-8 grid gap-3 md:grid-cols-5">
          {["Personal Info", "Contract", "Services", "Billing", "Review"].map((step, index) => (
            <div key={step} className={cn("rounded-2xl p-3 text-sm font-bold", index === 0 ? "bg-[#f2efff] text-primary" : "bg-slate-50 text-muted")}>
              {index + 1}. {step}
            </div>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="font-extrabold">Logistic Regression Engine</h3>
            <div className="mt-4 rounded-xl bg-[#f6f4ff] p-4 text-sm leading-6 text-muted">
              <Badge tone="success">Production Model</Badge>
              <p className="mt-3 font-bold text-ink">Current Scoring Artifact</p>
              <p className="mt-1">Model selection is removed from manual scoring. Governance pages explain why Logistic Regression is the recall-first business champion.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="font-extrabold">Personal Information</h3>
            <div className="mt-4 grid gap-3">
              <Select {...form.register("gender")}><option>Female</option><option>Male</option></Select>
              <Select {...form.register("SeniorCitizen")}><option>No</option><option>Yes</option></Select>
              <Select {...form.register("Partner")}><option>Yes</option><option>No</option></Select>
              <Select {...form.register("Dependents")}><option>No</option><option>Yes</option></Select>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="font-extrabold">Contract Information</h3>
            <div className="mt-4 grid gap-3">
              <Select {...form.register("Contract")}><option>Month-to-month</option><option>One year</option><option>Two year</option></Select>
              <Input type="number" placeholder="Tenure" {...form.register("tenure")} />
              <Select {...form.register("PaperlessBilling")}><option>Yes</option><option>No</option></Select>
              <Select {...form.register("PaymentMethod")}><option>Electronic check</option><option>Mailed check</option><option>Bank transfer (automatic)</option><option>Credit card (automatic)</option></Select>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="font-extrabold">Phone and Internet</h3>
            <div className="mt-4 grid gap-3">
              <Select {...form.register("PhoneService")}><option>Yes</option><option>No</option></Select>
              <Select {...form.register("MultipleLines")}><option>No</option><option>Yes</option><option>No phone service</option></Select>
              <Select {...form.register("InternetService")}><option>Fiber optic</option><option>DSL</option><option>No</option></Select>
              <Select {...form.register("OnlineSecurity")}><option>No</option><option>Yes</option><option>No internet service</option></Select>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="font-extrabold">Digital Services</h3>
            <div className="mt-4 grid gap-3">
              <Select {...form.register("OnlineBackup")}><option>No</option><option>Yes</option><option>No internet service</option></Select>
              <Select {...form.register("DeviceProtection")}><option>No</option><option>Yes</option><option>No internet service</option></Select>
              <Select {...form.register("TechSupport")}><option>No</option><option>Yes</option></Select>
              <Select {...form.register("StreamingTV")}><option>Yes</option><option>No</option><option>No internet service</option></Select>
              <Select {...form.register("StreamingMovies")}><option>Yes</option><option>No</option><option>No internet service</option></Select>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="font-extrabold">Billing Amounts</h3>
            <div className="mt-4 grid gap-3">
              <Input type="number" placeholder="Monthly Charges" {...form.register("MonthlyCharges")} />
              <Input type="number" placeholder="Total Charges" {...form.register("TotalCharges")} />
            </div>
            {form.formState.errors.MonthlyCharges && <p className="mt-3 text-sm font-semibold text-danger">{form.formState.errors.MonthlyCharges.message}</p>}
          </div>
        </div>
        {predictionMutation.isError && (
          <div className="mt-5 rounded-2xl border border-danger/20 bg-red-50 p-4 text-sm font-semibold text-danger">
            Prediction failed. Check that the FastAPI backend is running and Logistic Regression is loaded.
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button">Cancel</Button>
          <Button type="submit" disabled={predictionMutation.isPending}>
            {predictionMutation.isPending ? "Predicting..." : "Predict Now"}
          </Button>
        </div>
        </form>
      </Card>
    </Page>
  );
}

export function PredictionResult() {
  const usePredictionResultExperience: boolean = true;
  if (usePredictionResultExperience) return <PredictionResultPage />;

  const location = useLocation();
  const state = location.state as { prediction?: PredictionResultData; input?: PredictionFormValues } | null;
  const prediction = state?.prediction;
  const probability = prediction ? Math.round(prediction.churn_probability * 100) : 82;
  const riskLevel = prediction?.risk_level ?? "CRITICAL";
  const confidence = prediction ? `${Math.round(prediction.confidence * 100)}%` : "92.4%";
  const riskTone = riskLevel === "LOW" ? "success" : riskLevel === "MEDIUM" ? "warning" : "danger";

  return (
    <Page title="Prediction Result" subtitle="AI churn risk summary.">
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="grid place-items-center">
          <RiskGauge value={probability} label={`${riskLevel} Risk`} />
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Prediction Summary</CardTitle>
              <CardDescription>Real prediction from the governed scoring artifact.</CardDescription>
            </div>
            <Badge tone={riskTone}>{riskLevel}</Badge>
          </CardHeader>
          <div className="space-y-4">
            {[
              ["Churn Probability", `${probability}%`],
              ["Risk Level", riskLevel],
              ["Confidence Score", confidence],
              ["Production Model", prediction?.model_name ?? "Logistic Regression"],
              ["Model Source", prediction?.model_source ?? "registry"],
              ["Threshold Used", prediction ? prediction.threshold_used.toFixed(2) : "0.62"],
              ["Prediction Date", prediction ? formatDate(prediction.scored_at) : "June 9, 2026"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm font-semibold text-muted">{label}</span>
                <span className="font-extrabold text-ink">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-[#f6f4ff] p-5">
            <p className="font-extrabold">AI Explanation</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              This customer is at elevated churn risk because the contract is flexible, monthly charges are high, and support services are missing. Logistic Regression combines those signals with tenure and billing behavior to estimate the final probability.
            </p>
          </div>
          <div className="mt-5">
            <p className="font-extrabold">Top Factors</p>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              {[
                ["Contract Type", "High impact"],
                ["Monthly Charges", "High impact"],
                ["Tech Support", "High impact"],
                ["Tenure", "Protective"]
              ].map(([label, tag], index) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                  <p className="text-sm font-bold">{label}</p>
                  <Badge className="mt-2" tone={index === 3 ? "success" : "danger"}>{tag}</Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-[#f6f4ff] p-5">
            <p className="font-extrabold">Recommended Actions</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {prediction?.recommendation ?? "Launch an immediate retention offer with tech support, contract upgrade incentive and account manager follow-up."}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {["Offer Discount", "Upgrade Package", "Technical Support", "Retention Campaign"].map((action) => (
                <Button key={action} variant="secondary" size="sm">{action}</Button>
              ))}
            </div>
          </div>
          {state?.input && (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ["Gender", state.input.gender],
                ["Contract", state.input.Contract],
                ["Tenure", `${state.input.tenure} months`],
                ["Internet", state.input.InternetService],
                ["Tech Support", state.input.TechSupport],
                ["Monthly Charges", `$${state.input.MonthlyCharges}`]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase text-muted">{label}</p>
                  <p className="mt-1 font-extrabold">{value}</p>
                </div>
              ))}
            </div>
          )}
          <Button asChild className="mt-5 w-full"><Link to="/shap">View Explanation</Link></Button>
        </Card>
      </div>
    </Page>
  );
}

export function ShapExplanation() {
  return <ExplainabilityCenterPage />;
}

export function ShapGlobal() {
  return <GlobalShapPage />;
}

export function ShapLocal() {
  return <LocalShapPage />;
}

export function ShapComparison() {
  return <ShapComparisonPage />;
}

export function ShapBusinessInsights() {
  return <ShapBusinessInsightsPage />;
}

export function BatchPrediction() {
  const useBatchPredictionExperience: boolean = true;
  if (useBatchPredictionExperience) return <BatchPredictionPage />;

  return (
    <Page title="Batch Prediction" subtitle="Upload a file to predict churn for multiple customers.">
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="grid min-h-80 place-items-center border-dashed">
          <div className="text-center">
            <CloudUpload className="mx-auto h-12 w-12 text-primary" />
            <p className="mt-4 font-extrabold">Drag and drop your file here</p>
            <p className="mt-2 text-sm text-muted">Supports CSV, Excel and XLSX files.</p>
            <Button className="mt-5">Browse File</Button>
          </div>
        </Card>
        <Card>
          <CardTitle>Upload Summary</CardTitle>
          <div className="mt-6 space-y-4">
            {["File name", "Total records", "Columns found", "Status"].map((row, index) => (
              <div key={row} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm font-semibold text-muted">{row}</span>
                <span className="font-bold">{index === 0 ? "customers.csv" : index === 1 ? "1,000" : index === 2 ? "18" : "Ready to process"}</span>
              </div>
            ))}
          </div>
          <Button className="mt-6 w-full">Predict All</Button>
        </Card>
      </div>
    </Page>
  );
}

export function PredictionHistory() {
  return <PredictionHistoryExperiencePage />;
}

export function PredictionInsights() {
  return <PredictionInsightsPage />;
}

export function Analytics() {
  const tabs = ["Overview", "Customer Analytics", "Revenue Analytics", "Churn Analytics", "Retention Analytics", "Segmentation Analytics"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const { toast } = useToast();
  const metricsByTab: Record<string, string[][]> = {
    Overview: [
      ["Avg Tenure", "32.4 months"],
      ["Avg Monthly Charge", "$74.32"],
      ["Total Revenue", "$16.2M"],
      ["Avg Churn Rate", "26.5%"],
      ["Retention Funnel", "73.5%"],
      ["Revenue At Risk", "$12,450"],
      ["Best Segment", "Loyal"],
      ["Top Driver", "Contract"]
    ],
    "Customer Analytics": [
      ["Customers", "7,043"],
      ["Active Customers", "5,176"],
      ["High Risk", "1,234"],
      ["Avg Tenure", "32.4 months"],
      ["Senior Customers", "16%"],
      ["Month-to-month", "55%"],
      ["Auto Pay", "42%"],
      ["Support Adoption", "37%"]
    ],
    "Revenue Analytics": [
      ["Total Revenue", "$16.2M"],
      ["Monthly Revenue", "$1.20M"],
      ["Revenue At Risk", "$45,230"],
      ["Recovered Revenue", "$31,500"],
      ["Forecast Revenue", "$1.39M"],
      ["ARR", "$14.4M"],
      ["ARPU", "$170"],
      ["Recovery Rate", "69%"]
    ],
    "Churn Analytics": [
      ["Avg Churn Rate", "26.5%"],
      ["Primary Driver", "Contract"],
      ["Critical Customers", "82"],
      ["High Risk Customers", "245"],
      ["Monthly Churn Drop", "-3.1 pts"],
      ["Model ROC-AUC", "84.7%"],
      ["Top Churn Segment", "At Risk"],
      ["Risk Window", "0-12 months"]
    ],
    "Retention Analytics": [
      ["Retention Funnel", "73.5%"],
      ["Eligible Customers", "100%"],
      ["Campaign Reach", "78%"],
      ["Engaged", "46%"],
      ["Saved", "27%"],
      ["Campaign ROI", "373%"],
      ["Revenue Saved", "$31.5K"],
      ["Best Play", "Support Bundle"]
    ],
    "Segmentation Analytics": [
      ["Best Segment", "Loyal"],
      ["VIP Customers", "842"],
      ["At Risk Customers", "1,234"],
      ["New Customers", "689"],
      ["Dormant Customers", "426"],
      ["High Value", "713"],
      ["Top Segment Revenue", "$420K"],
      ["Segment Strategy", "Save Desk"]
    ]
  };

  const handleExport = () => {
    const filename = downloadCsv("analytics_hub", [
      ...metricsByTab[activeTab].map(([label, value]) => ({ tab: activeTab, label, value })),
      ...revenueTrend.map((row) => ({ tab: activeTab, section: "revenue_trend", ...row })),
      ...churnAnalytics.map((row) => ({ tab: activeTab, section: "churn_analytics", ...row }))
    ]);
    toast({ tone: "success", title: "Analytics export ready", description: filename });
  };

  return (
    <Page title="Analytics Hub" subtitle="Customer, revenue, churn, retention and segmentation intelligence.">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{activeTab}</CardTitle>
            <CardDescription>Switch views to inspect the analytics lens you need.</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4" /> Export {activeTab}</Button>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </Card>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metricsByTab[activeTab].map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm font-semibold text-muted">{label}</p>
            <p className="mt-3 text-2xl font-extrabold">{value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Churn Rate by Tenure" description="Churn decreases with tenure"><ChurnLineChart /></ChartCard>
        <ChartCard title="Customer Growth" description="Monthly active customer base"><CustomerBarChart /></ChartCard>
        <ChartCard title="Churn by Contract Type" description="Risk distribution"><RiskDonut /></ChartCard>
        <ChartCard title="Retention Analysis" description="Save levers by signal"><RetentionRadar /></ChartCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Correlation Matrix Heatmap</CardTitle>
              <CardDescription>Feature relationships for churn analytics.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg"
                style={{ backgroundColor: `rgba(109, 91, 255, ${0.18 + ((index * 17) % 70) / 100})` }}
                title="Correlation cell"
              />
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Cohort Analysis</CardTitle>
              <CardDescription>Retention by customer start cohort.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {["Jan cohort", "Feb cohort", "Mar cohort", "Apr cohort", "May cohort"].map((cohort, index) => (
              <div key={cohort}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold">{cohort}</span>
                  <span className="text-muted">{88 - index * 6}% retained</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, month) => (
                    <span key={month} className="h-8 rounded-lg bg-primary" style={{ opacity: Math.max(0.24, 0.95 - index * 0.08 - month * 0.08) }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <CardTitle>Retention Funnel</CardTitle>
          <div className="mt-5 space-y-3">
            {[
              ["Eligible customers", 100],
              ["Reached by campaign", 78],
              ["Engaged", 46],
              ["Saved", 27]
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{label}</span>
                  <span className="text-muted">{value}%</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-success" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Scatter Plot: Tenure vs Charges</CardTitle>
          <div className="relative mt-5 h-64 rounded-2xl border border-slate-100 bg-slate-50 dark:bg-white/5">
            {Array.from({ length: 28 }).map((_, index) => (
              <span
                key={index}
                className={cn("absolute h-3 w-3 rounded-full", index % 4 === 0 ? "bg-danger" : index % 3 === 0 ? "bg-warning" : "bg-primary")}
                style={{ left: `${8 + (index * 17) % 82}%`, bottom: `${10 + (index * 23) % 78}%` }}
              />
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Customer Journey Flow</CardTitle>
          <div className="mt-5 space-y-3">
            {["Acquired", "Onboarded", "Active", "At Risk", "Retained"].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#f2efff] text-xs font-extrabold text-primary">{index + 1}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{step}</p>
                  <div className="mt-2 h-2 rounded-full bg-white">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${92 - index * 13}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Feature Importance Analysis</CardTitle>
            <CardDescription>Logistic Regression business-readable driver ranking.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {shapFactors.slice(0, 6).map((factor) => (
            <div key={factor.feature} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="font-extrabold">{factor.feature}</p>
              <div className="mt-3 h-2 rounded-full bg-white dark:bg-white/10">
                <div className={cn("h-full rounded-full", factor.value > 0 ? "bg-danger" : "bg-primary")} style={{ width: `${Math.abs(factor.value) * 100 + 15}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

export function ModelPerformance() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["model-performance"],
    queryFn: getModelPerformance
  });

  if (isLoading) {
    return <LoadingPage title="Model Performance" />;
  }

  if (isError || !data) {
    return <ErrorCard title="Model Performance" message="Unable to load training_report.json or benchmark metrics." />;
  }

  const selection = data.model_selection;
  const technicalChampion = selection?.technical_champion;
  const businessChampion = selection?.business_champion;
  const recallChampion = selection?.highest_recall_model;
  const efficiencyChampion = selection?.best_training_efficiency;
  const stabilityChampion = selection?.best_stability;
  const comparison = selection?.catboost_vs_logistic ?? {};
  const stacking = selection?.stacking_analysis ?? {};
  const asNumber = (value: unknown) => (typeof value === "number" ? value : Number(value ?? 0));
  const asText = (value: unknown, fallback = "N/A") => (typeof value === "string" && value.length > 0 ? value : fallback);
  const pct = (value: unknown) => `${(asNumber(value) * 100).toFixed(1)}%`;
  const bestMetrics: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "ROC-AUC", value: `${data.best_metrics.roc_auc ?? 0}%`, icon: TrendingUp },
    { label: "Recall", value: `${data.best_metrics.recall ?? 0}%`, icon: Target },
    { label: "F1 Score", value: `${data.best_metrics.f1 ?? 0}%`, icon: CheckCircle2 },
    { label: "Threshold", value: data.optimal_threshold.toFixed(2), icon: SlidersHorizontal }
  ];
  const decisionCards = [
    {
      label: "Business Champion Model",
      value: asText(businessChampion?.label, data.recommended_model ?? "Logistic Regression"),
      detail: `Recall ${pct(businessChampion?.recall_raw)}`
    },
    {
      label: "Technical Champion Model",
      value: asText(technicalChampion?.label, "CatBoost"),
      detail: `ROC-AUC ${pct(technicalChampion?.roc_auc_raw)}`
    },
    {
      label: "Highest Recall Model",
      value: asText(recallChampion?.label, "Logistic Regression"),
      detail: `Missed churners minimized`
    },
    {
      label: "Best Training Efficiency",
      value: asText(efficiencyChampion?.label, "Logistic Regression"),
      detail: `${asNumber(efficiencyChampion?.training_time).toFixed(3)}s training`
    },
    {
      label: "Results Stability",
      value: asText(stabilityChampion?.label, "Stable CV"),
      detail: `CV std ${asNumber(stabilityChampion?.cv_std_raw).toFixed(4)}`
    },
    {
      label: "Stacking Decision",
      value: "Rejected",
      detail: `${asNumber(stacking.training_multiplier_vs_catboost).toFixed(1)}x CatBoost training time`
    }
  ];

  return (
    <Page title="Model Performance" subtitle="Compare ML models, calibration threshold, business cost and explainability artifacts.">
      <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f7f5ff]">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <Badge tone={data.fallback_prediction_enabled ? "warning" : "success"}>
              {data.fallback_prediction_enabled ? "Fallback API scoring" : "Model artifact loaded"}
            </Badge>
            <h2 className="mt-4 text-3xl font-extrabold">{data.recommended_model ?? data.best_model} is the business champion</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Logistic Regression is the current scoring artifact, and model selection is no longer judged by ROC-AUC alone.
              In churn prediction, false negatives are expensive, so recall and business cost drive the final recommendation.
              Trained on {formatDate(data.trained_on)}.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bestMetrics.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl bg-white/85 p-4 shadow-sm">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-xs font-bold uppercase text-muted">{label}</p>
                <p className="mt-1 text-2xl font-extrabold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {selection && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Model Selection Re-Evaluation</CardTitle>
              <CardDescription>
                Objective comparison of ROC-AUC, recall, false-negative cost, model stability and deployment complexity.
              </CardDescription>
            </div>
            <Badge tone="warning">Recall-first business review</Badge>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {decisionCards.map((card) => (
              <div key={card.label} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-xs font-extrabold uppercase text-muted">{card.label}</p>
                <p className="mt-2 text-xl font-extrabold">{card.value}</p>
                <p className="mt-1 text-sm text-muted">{card.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-danger/15 bg-red-50 p-5 text-sm leading-6 text-muted">
              <p className="font-extrabold text-ink">Business interpretation</p>
              <p className="mt-2">
                Logistic Regression sacrifices only {asNumber(comparison.roc_auc_delta_catboost_minus_logistic).toFixed(4)} ROC-AUC
                versus CatBoost, but gains {(asNumber(comparison.recall_delta_logistic_minus_catboost) * 100).toFixed(1)} recall points.
                Because missed churners create direct revenue and CLV loss, this is the stronger business tradeoff.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-[#f6f4ff] p-5 text-sm leading-6 text-muted">
              <p className="font-extrabold text-ink">Cost assumption</p>
              <p className="mt-2">
                False negative cost = ${selection.false_negative_cost}; false positive cost = ${selection.false_positive_cost}.
                Under this retention logic, contacting a loyal customer is cheaper than missing a real churner.
              </p>
            </div>
          </div>
        </Card>
      )}

      {data.available_models && data.available_models.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Model Comparison Registry</CardTitle>
              <CardDescription>Comparison remains visible here for governance; scoring artifacts and business recommendations are tracked separately.</CardDescription>
            </div>
            <Badge tone={data.model_registry_loaded ? "success" : "warning"}>{data.available_models.length} loaded</Badge>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.available_models.map((item) => (
              <div key={item.name} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-extrabold">{item.name}</p>
                  <Badge tone={item.is_default ? "primary" : "success"}>{item.is_default ? "Production" : "Loaded"}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted">ROC-AUC</p><p className="font-extrabold">{item.roc_auc}%</p></div>
                  <div><p className="text-muted">Recall</p><p className="font-extrabold">{item.recall}%</p></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Model Leaderboard</CardTitle>
              <CardDescription>Metrics normalized from training_report.json and final_benchmark.csv.</CardDescription>
            </div>
            <Badge tone="primary">{data.leaderboard.length} models</Badge>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="text-muted">
                <tr>{["Model", "Scaler", "ROC-AUC", "Recall", "Precision", "F1", "CV Std", "Train", "FN", "Cost", "Overfit"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
              </thead>
              <tbody>
                {data.leaderboard.map((row) => (
                  <tr key={`${row.model}-${row.scaler ?? ""}`} className="border-t border-slate-100">
                    <td className="px-4 py-4 font-extrabold">{row.model}</td>
                    <td className="px-4 py-4">{row.scaler || "none"}</td>
                    <td className="px-4 py-4">{row.roc_auc}%</td>
                    <td className="px-4 py-4">{row.recall}%</td>
                    <td className="px-4 py-4">{row.precision}%</td>
                    <td className="px-4 py-4">{row.f1}%</td>
                    <td className="px-4 py-4">{row.cv_std?.toFixed(4) ?? "N/A"}</td>
                    <td className="px-4 py-4">{row.training_time?.toFixed(3) ?? "N/A"}s</td>
                    <td className="px-4 py-4 font-extrabold text-danger">{row.fn ?? "N/A"}</td>
                    <td className="px-4 py-4">${row.business_cost.toLocaleString()}</td>
                    <td className="px-4 py-4"><Badge tone={row.overfit_status.includes("OK") || row.loaded ? "success" : row.overfit_status.includes("MILD") ? "warning" : "danger"}>{row.loaded ? "Loaded" : row.overfit_status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardTitle>Top SHAP Features</CardTitle>
          <div className="mt-5 space-y-4">
            {data.shap_features.slice(0, 8).map((feature) => (
              <div key={feature.feature}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{feature.feature}</span>
                  <span className="text-muted">{feature.importance.toFixed(3)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(feature.importance / 0.55, 1) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {selection && (
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Class Imbalance Handling</CardTitle>
                <CardDescription>Churners are the minority class, so every serious candidate received imbalance-aware treatment.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-3">
              {selection.class_imbalance_handling.map((item) => (
                <div key={item.model} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/5">
                  <span className="font-extrabold">{item.model}</span>
                  <span className="text-right font-mono text-xs text-muted">{item.method}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Methodological Rigor</CardTitle>
                <CardDescription>Systematic evaluation framework used for reproducible and fair comparison.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-3">
              {selection.methodology.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-muted dark:bg-white/5">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {selection && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Stacking Cost-Benefit Analysis</CardTitle>
              <CardDescription>Complex ensemble methods were tested, measured and rejected for production deployment.</CardDescription>
            </div>
            <Badge tone="danger">Complexity not justified</Badge>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-xs font-extrabold uppercase text-muted">Best Stacking AUC</p>
              <p className="mt-2 text-2xl font-extrabold">{pct((stacking.best_stacking as Record<string, unknown> | undefined)?.roc_auc_raw)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-xs font-extrabold uppercase text-muted">Training Cost</p>
              <p className="mt-2 text-2xl font-extrabold">{asNumber(stacking.training_multiplier_vs_catboost).toFixed(1)}x</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-xs font-extrabold uppercase text-muted">Conclusion</p>
              <p className="mt-2 text-sm font-bold leading-6 text-muted">{asText(stacking.conclusion)}</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Feature Engineering Impact</CardTitle>
            <CardDescription>Augmented feature deltas generated by the training workflow.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {data.feature_impact.map((feature) => (
            <div key={feature.feature} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="font-extrabold">{feature.feature}</p>
              <p className="mt-2 text-sm text-muted">Delta AUC: {feature.delta_auc?.toFixed(4) ?? "N/A"}</p>
              <Badge className="mt-4" tone={feature.recommendation === "KEEP" ? "success" : "warning"}>{feature.recommendation ?? "Review"}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

export function Insights() {
  return (
    <Page title="AI Insights" subtitle="Daily intelligence, revenue risk and recommended actions from churn signals.">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f7f5ff]">
          <CardHeader>
            <div>
              <Badge tone="primary">AI Assistant</Badge>
              <CardTitle className="mt-3">Ask ChurnIQ what to do next</CardTitle>
              <CardDescription>Project-aware assistant connected to customers, revenue, model performance and reports.</CardDescription>
            </div>
            <Button asChild><Link to="/ai-copilot">Open Assistant</Link></Button>
          </CardHeader>
          <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
            <p className="text-sm font-semibold text-muted">Suggested question</p>
            <p className="mt-2 font-extrabold">Which high-risk customers should receive a retention offer this week?</p>
          </div>
        </Card>
        <Card className="grid place-items-center">
          <RobotIllustration />
        </Card>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Daily Insights", "124 customers crossed a high-risk threshold today.", "danger"],
          ["Weekly Insights", "Month-to-month churn pressure increased by 8%.", "warning"],
          ["Revenue Risk Analysis", "$12,450 estimated revenue at risk this week.", "danger"],
          ["Retention Opportunities", "245 customers are eligible for support bundles.", "success"]
        ].map(([title, text, tone]) => (
          <Card key={title}>
            <Badge tone={tone as "danger" | "warning" | "success"}>{title}</Badge>
            <p className="mt-4 text-sm font-bold leading-6">{text}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {insights.map((item) => (
            <Card key={item.title} className="flex items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{item.text}</p>
                </div>
              </div>
              <Badge tone={item.tag === "Positive" ? "success" : item.tag === "High impact" ? "danger" : "warning"}>{item.tag}</Badge>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>High Risk Customer Alerts</CardTitle>
              <CardDescription>Action recommendations prioritized by revenue impact.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {[
              ["Sarah Johnson", "82% risk", "Offer discount + support"],
              ["Michael Chen", "67% risk", "Upgrade package"],
              ["Emily Davis", "44% risk", "Nurture campaign"]
            ].map(([name, risk, action]) => (
              <div key={name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                <div>
                  <p className="font-extrabold">{name}</p>
                  <p className="text-sm text-muted">{action}</p>
                </div>
                <Badge tone={risk.startsWith("82") ? "danger" : risk.startsWith("67") ? "warning" : "primary"}>{risk}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}

export function AICopilot() {
  return <CopilotWorkspacePage />;
}

export function CopilotHistory() {
  return <CopilotHistoryPage />;
}

export function CopilotInsights() {
  return <CopilotInsightsPage />;
}

export function CopilotReports() {
  return <CopilotReportsPage />;
}

export function RetentionCenter() {
  return <RetentionDashboardPage />;
}

export function RetentionSimulator() {
  return <RetentionSimulatorPage />;
}

export function RetentionOpportunities() {
  return <RetentionOpportunitiesPage />;
}

export function RetentionCampaigns() {
  return <RetentionCampaignsPage />;
}

export function RetentionPlaybooks() {
  return <RetentionPlaybooksPage />;
}

export function Campaigns() {
  return (
    <Page title="Campaigns" subtitle="Manage retention campaigns.">
      <div className="flex justify-end">
        <Button><Plus className="h-4 w-4" /> Create Campaign</Button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {["Special Discount", "High Campaign", "Win-Back Campaign"].map((title, index) => (
          <Card key={title}>
            <Badge tone={index === 0 ? "success" : index === 1 ? "danger" : "primary"}>{index === 0 ? "Active" : "Draft"}</Badge>
            <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
            <p className="mt-2 text-sm text-muted">For churn customers in high-risk segments.</p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {["Target", "Sent", "Response"].map((label, idx) => (
                <div key={label}>
                  <p className="text-xs text-muted">{label}</p>
                  <p className="font-extrabold">{idx === 0 ? 245 : idx === 1 ? 180 : "35%"}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}

export function ModelMonitoring() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["model-monitoring"],
    queryFn: getModelMonitoring
  });

  if (isLoading) {
    return <LoadingPage title="Model Monitoring" />;
  }

  if (isError || !data) {
    return <ErrorCard title="Model Monitoring" message="Unable to load monitoring metrics from FastAPI." />;
  }

  const cards = [
    { label: "Status", value: data.status, icon: Cpu, tone: data.status === "Healthy" ? "success" : "warning" },
    { label: "Prediction Volume", value: data.prediction_volume.toLocaleString(), icon: Activity, tone: "primary" },
    { label: "Drift Status", value: data.drift.status, icon: TrendingUp, tone: data.drift.status === "Stable" ? "success" : "warning" },
    { label: "Data Quality", value: `${data.data_quality.missing_values} missing`, icon: ShieldCheck, tone: data.data_quality.missing_values === 0 ? "success" : "warning" }
  ] as const;

  return (
    <Page title="Model Monitoring" subtitle="Track model health, fallback status, drift and data quality.">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} /> Refresh</Button>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <Card key={item.label}>
            <div className="flex items-center justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary"><item.icon className="h-5 w-5" /></div>
              <Badge tone={item.tone}>{item.label}</Badge>
            </div>
            <p className="mt-5 text-2xl font-extrabold">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Model Runtime</CardTitle>
              <CardDescription>FastAPI loading state and training metadata.</CardDescription>
            </div>
            <Badge tone={data.fallback_prediction_enabled ? "warning" : "success"}>
              {data.fallback_prediction_enabled ? "Fallback enabled" : "Loaded"}
            </Badge>
          </CardHeader>
          <div className="space-y-4">
            {[
              ["Version", data.model_version],
              ["Trained on", formatDate(data.trained_on)],
              ["Model age", data.model_age_days === null ? "Unknown" : `${data.model_age_days} days`],
              ["Monitored at", formatDate(data.monitored_at)]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-white/5">
                <span className="text-sm font-semibold text-muted">{label}</span>
                <span className="font-extrabold">{value}</span>
              </div>
            ))}
          </div>
          {data.model_error && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
              {data.model_error}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Drift and Data Quality</CardTitle>
          <div className="mt-6 space-y-5">
            <MetricBar label="Current churn rate" value={data.drift.current_churn_rate} max={100} tone="danger" />
            <MetricBar label="Baseline churn rate" value={data.drift.baseline_churn_rate} max={100} tone="primary" />
            <MetricBar label="Drift score" value={data.drift.score * 100} max={100} tone="warning" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["Rows", data.data_quality.rows.toLocaleString()],
              ["Columns", data.data_quality.columns],
              ["Missing", data.data_quality.missing_values],
              ["Duplicates", data.data_quality.duplicate_customers]
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-xs font-bold uppercase text-muted">{label}</p>
                <p className="mt-1 text-xl font-extrabold">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Monitoring Alerts</CardTitle>
            <CardDescription>Operational checks for model readiness and source data quality.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-3">
          {data.alerts.map((alert) => (
            <div key={alert} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
              <p className="text-sm font-semibold leading-6">{alert}</p>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

export function Reports() {
  const { data: reportFiles, isLoading } = useQuery({
    queryKey: ["reports-index"],
    queryFn: getReportsIndex
  });

  return (
    <Page title="Reports" subtitle="Generate and download reports.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {reports.map((report) => (
          <Card key={report.name}>
            <report.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-5 text-lg font-extrabold">{report.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{report.text}</p>
            <Button className="mt-6 w-full"><Download className="h-4 w-4" /> Generate</Button>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Report Previews</CardTitle>
            <CardDescription>Executive-ready previews before export.</CardDescription>
          </div>
          <Badge tone="primary">5 templates</Badge>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Customer Churn Report", "Risk cohorts, churn drivers, customer table"],
            ["Model Performance Report", "ROC-AUC, recall, class imbalance and business tradeoff"],
            ["Revenue Report", "Revenue at risk, CLV, protected MRR"],
            ["Retention Report", "Save plays, simulator, expected revenue saved"],
            ["Executive Report", "One-page board summary with AI actions"]
          ].map(([title, text], index) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 h-24 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900">
                <div className="h-2 w-20 rounded-full bg-primary/50" />
                <div className="mt-3 h-2 w-full rounded-full bg-slate-100" />
                <div className="mt-2 h-2 w-3/4 rounded-full bg-slate-100" />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((item) => <span key={item} className="h-7 rounded-lg bg-[#f2efff]" />)}
                </div>
              </div>
              <Badge tone={index === 1 ? "success" : "primary"}>{title}</Badge>
              <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Daily, weekly, monthly and quarterly report delivery.</CardDescription>
          </div>
          <Button variant="outline"><Clock className="h-4 w-4" /> Schedule Report</Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-muted">
              <tr>{["Report", "Cadence", "Delivery", "Owner", "Next Run"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {scheduledReports.map((report) => (
                <tr key={report.name} className="border-t border-slate-100 dark:border-white/10">
                  <td className="px-4 py-4 font-extrabold">{report.name}</td>
                  <td className="px-4 py-4"><Badge tone="primary">{report.cadence}</Badge></td>
                  <td className="px-4 py-4 text-muted">{report.delivery}</td>
                  <td className="px-4 py-4">{report.owner}</td>
                  <td className="px-4 py-4 text-muted">{report.nextRun}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Project Report Artifacts</CardTitle>
            <CardDescription>Files detected in the existing reports folder.</CardDescription>
          </div>
          <Badge tone="primary">{isLoading ? "Loading" : `${reportFiles?.length ?? 0} files`}</Badge>
        </CardHeader>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {(reportFiles ?? []).slice(0, 12).map((file) => (
              <div key={file.name} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <Badge>{file.type}</Badge>
                </div>
                <p className="mt-3 truncate font-extrabold">{file.name}</p>
                <p className="mt-1 text-sm text-muted">{file.size_kb} KB</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Page>
  );
}

export function Notifications() {
  return <EnterpriseNotificationsPage />;

  return (
    <Page title="Notifications" subtitle="Stay updated with important alerts.">
      <Card>
        <Tabs tabs={["All", "Risk Alerts", "Campaigns", "System"]} />
        <div className="mt-6 space-y-4">
          {activity.map((event, index) => (
            <div key={event} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
              <div className={cn("mt-1 grid h-9 w-9 place-items-center rounded-xl", index === 0 ? "bg-red-50 text-danger" : "bg-[#f2efff] text-primary")}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold">{event}</p>
                <p className="mt-1 text-sm text-muted">{index + 2} minutes ago</p>
              </div>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

export function TeamManagement() {
  return <EnterpriseTeamPage />;

  const roles = ["Admin", "Manager", "Analyst", "Viewer"];
  return (
    <Page title="Team Members" subtitle="Manage team members and permissions.">
      <div className="flex justify-end">
        <RoleGuard allowed={["Admin", "Manager"]}>
          <Button><UserPlus className="h-4 w-4" /> Invite Member</Button>
        </RoleGuard>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-muted">
              <tr>{["Name", "Email", "Role", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {["John Doe", "Sarah Wilson", "Mike Johnson", "Emma Davis"].map((name, index) => (
                <tr key={name} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-bold">{name}</td>
                  <td className="px-4 py-4 text-muted">{name.toLowerCase().replace(" ", ".")}@company.com</td>
                  <td className="px-4 py-4">{roles[index]}</td>
                  <td className="px-4 py-4"><Badge tone="success">Active</Badge></td>
                  <td className="px-4 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}

export function Profile() {
  return (
    <Page title="Profile Settings" subtitle="Manage your account settings.">
      <Card>
        <Tabs tabs={["Profile", "Security", "Notifications", "API Tokens"]} />
        <div className="mt-6 grid gap-8 xl:grid-cols-[1fr_280px]">
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="John Doe" />
            <Input placeholder="john@company.com" />
            <Input placeholder="+1 (555) 123-4567" />
            <Input placeholder="Your Company Inc." />
          </div>
          <div className="text-center">
            <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-amber-200 to-primary" />
            <Button variant="outline" className="mt-5">Change Photo</Button>
          </div>
        </div>
      </Card>
    </Page>
  );
}

export function SettingsPage() {
  return <WorkspaceSettingsPage />;

  return (
    <Page title="Settings" subtitle="Configure your application preferences.">
      <Card>
        <Tabs tabs={["General", "Appearance", "Security", "Notifications", "API", "AI Model"]} />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Input placeholder="Company name" defaultValue="Your Company Inc." />
          <Select><option>UTC+01:00 Europe/Paris</option></Select>
          <Select><option>English</option><option>French</option></Select>
          <Input placeholder="API endpoint" defaultValue="http://127.0.0.1:8000" />
        </div>
        <Button className="mt-6">Save Changes</Button>
      </Card>
    </Page>
  );
}

export function HelpCenter() {
  return <EnterpriseHelpCenterPage />;

  return (
    <Page title="Help Center" subtitle="How can we help you?">
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-10" placeholder="Search articles, guides and tutorials..." />
        </div>
        <h3 className="mt-8 font-extrabold">Popular Topics</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {helpTopics.map((topic) => (
            <div key={topic.title} className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
              <topic.icon className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-3 text-sm font-bold">{topic.title}</p>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

export function ContactSupport() {
  return <EnterpriseSupportCenterPage />;

  return (
    <Page title="Contact Support" subtitle="Get in touch with our support team.">
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-4">
          {["Email Support", "Phone Support", "Live Chat"].map((title) => (
            <Card key={title}>
              <Mail className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-extrabold">{title}</h3>
              <p className="mt-1 text-sm text-muted">support@churniq.com</p>
            </Card>
          ))}
        </div>
        <Card>
          <CardTitle>Send us a message</CardTitle>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input placeholder="Name" />
            <Input placeholder="Email" />
            <Input className="md:col-span-2" placeholder="Subject" />
            <textarea className="min-h-32 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 md:col-span-2" placeholder="Message" />
          </div>
          <Button className="mt-5 w-full"><Send className="h-4 w-4" /> Send Message</Button>
        </Card>
      </div>
    </Page>
  );
}

function LoadingPage({ title }: { title: string }) {
  return (
    <Page title={title} subtitle="Loading project metrics from the FastAPI backend.">
      <Card className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}
      </Card>
      <Card>
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </Card>
    </Page>
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <Page title={title} subtitle="The interface is ready, but the backend data source did not respond.">
      <Card className="border-danger/20 bg-red-50/70">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-danger" />
          <div>
            <p className="font-extrabold text-danger">{message}</p>
            <p className="mt-2 text-sm text-muted">Start FastAPI with the project launcher, then refresh this page.</p>
          </div>
        </div>
      </Card>
    </Page>
  );
}

function MetricBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "primary" | "warning" | "danger" }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold">{label}</span>
        <span className="text-muted">{value.toFixed(1)}%</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-warning" : "bg-primary")}
          style={{ width: `${Math.min(value / max, 1) * 100}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function AuthLayout({ title, subtitle, cta, ctaTo = "/dashboard", children }: { title: string; subtitle: string; cta: string; ctaTo?: string; children: ReactNode }) {
  const { signIn } = useAuth();

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="hidden place-items-center bg-[#fbfbff] p-10 lg:grid">
        <div className="max-w-lg">
          <Logo />
          <RobotIllustration />
        </div>
      </div>
      <div className="grid place-items-center p-6">
        <Card className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <Logo className="justify-center" />
            <h1 className="mt-8 text-3xl font-extrabold">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>
          <div className="space-y-3">{children}</div>
          <Button asChild className="mt-6 w-full">
            <Link to={ctaTo} onClick={() => ctaTo === "/dashboard" && signIn("Admin")}>{cta}</Link>
          </Button>
          <p className="mt-5 text-center text-sm text-muted">
            Do not have an account? <Link className="font-semibold text-primary" to="/auth/register">Sign up</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

function Page({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-normal text-ink">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "center" | "left" }) {
  return (
    <div className={cn("mb-10", align === "center" && "text-center")}>
      <Badge tone="primary">{eyebrow}</Badge>
      <h2 className="mt-4 text-4xl font-extrabold tracking-normal">{title}</h2>
    </div>
  );
}

function ProjectDataBanner() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary
  });

  if (isLoading) {
    return (
      <Card className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-danger/20 bg-red-50/70">
        <p className="font-extrabold text-danger">FastAPI data connection unavailable</p>
        <p className="mt-2 text-sm text-muted">Start the backend with uvicorn to load live CSV metrics, model metadata and customer samples.</p>
      </Card>
    );
  }

  const liveMetrics = [
    ["Dataset customers", data.total_customers.toLocaleString()],
    ["CSV churn rate", `${data.churn_rate}%`],
    ["Model AUC", `${data.prediction_accuracy}%`],
    ["Threshold", data.threshold ? data.threshold.toFixed(2) : "N/A"]
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f7f5ff]">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <Badge tone="primary">Project-backed API</Badge>
          <h3 className="mt-3 text-xl font-extrabold">Connected to the existing customer_churn ML project</h3>
          <p className="mt-1 text-sm text-muted">Model: {data.model} - Version {data.model_version}</p>
        </div>
        <Button asChild variant="secondary"><a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">API Docs</a></Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {liveMetrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-muted">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function KpiGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <div className="flex items-center justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary">
              <kpi.icon className="h-5 w-5" />
            </div>
            <Badge tone={kpi.tone === "danger" ? "danger" : kpi.tone === "success" ? "success" : kpi.tone === "warning" ? "warning" : "primary"}>{kpi.delta}</Badge>
          </div>
          <p className="mt-5 text-sm font-semibold text-muted">{kpi.label}</p>
          <p className="mt-2 text-3xl font-extrabold">{kpi.value}</p>
        </Card>
      ))}
    </div>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{optionsOpen ? "Chart options are active for this view." : description}</CardDescription>
        </div>
        <Button
          variant={optionsOpen ? "secondary" : "ghost"}
          size="icon"
          aria-label={`Toggle ${title} options`}
          title="Toggle chart options"
          onClick={() => setOptionsOpen((value) => !value)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      {optionsOpen && (
        <div className="mb-4 flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-muted dark:bg-white/5">
          <span>Last 6 months</span>
          <span>All segments</span>
          <span>Normalized view</span>
        </div>
      )}
      {children}
    </Card>
  );
}

function CustomerTable() {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="text-muted">
          <tr>{["Customer ID", "Name", "Email", "Contract", "Risk", "Probability", "Revenue", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-t border-slate-100">
              <td className="px-4 py-4 font-bold text-primary">{customer.id}</td>
              <td className="px-4 py-4 font-bold">{customer.name}</td>
              <td className="px-4 py-4 text-muted">{customer.email}</td>
              <td className="px-4 py-4">{customer.contract}</td>
              <td className="px-4 py-4"><Badge tone={customer.risk === "CRITICAL" || customer.risk === "HIGH" ? "danger" : customer.risk === "MEDIUM" ? "warning" : "success"}>{customer.risk}</Badge></td>
              <td className="px-4 py-4 font-bold">{customer.probability}%</td>
              <td className="px-4 py-4">{customer.revenue}</td>
              <td className="px-4 py-4">{customer.status}</td>
              <td className="px-4 py-4">
                <Button asChild variant="ghost" size="icon">
                  <Link to={`/customers/${customer.id}`}><Eye className="h-4 w-4" /></Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskGauge({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? "#EF4444" : value >= 50 ? "#F59E0B" : "#22C55E";
  return (
    <div className="relative h-56 w-56">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(${color} 0 ${value}%, #F1F5F9 ${value}% 100%)` }}
      />
      <div className="absolute inset-5 grid place-items-center rounded-full bg-white">
        <div className="text-center">
          <p className="text-5xl font-extrabold">{value}%</p>
          <p className="mt-2 text-sm font-extrabold uppercase" style={{ color }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function Tabs({ tabs, activeTab, onChange }: { tabs: string[]; activeTab?: string; onChange?: (tab: string) => void }) {
  const selected = activeTab ?? tabs[0];
  return (
    <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange?.(tab)}
          className={cn("rounded-xl px-4 py-2 text-sm font-bold text-muted transition hover:bg-[#f6f4ff] hover:text-primary", selected === tab && "bg-[#f2efff] text-primary")}
          aria-pressed={selected === tab}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function FormGroup({ title, fields }: { title: string; fields: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <h3 className="font-extrabold">{title}</h3>
      <div className="mt-4 space-y-3">
        {fields.map((field) => (
          <Select key={field}>
            <option>{field}</option>
            <option>Yes</option>
            <option>No</option>
          </Select>
        ))}
      </div>
    </div>
  );
}

function LayerIcon() {
  return (
    <div className="relative h-52 w-52">
      <div className="absolute left-8 top-8 h-28 w-36 rotate-45 rounded-2xl bg-gradient-to-br from-[#C7D2FE] to-[#6D5BFF] opacity-75 shadow-soft" />
      <div className="absolute left-8 top-16 h-28 w-36 rotate-45 rounded-2xl bg-gradient-to-br from-[#A5F3FC] to-[#8B5CF6] opacity-75 shadow-soft" />
      <div className="absolute left-8 top-24 h-28 w-36 rotate-45 rounded-2xl bg-gradient-to-br from-[#DDD6FE] to-[#6D5BFF] opacity-90 shadow-soft" />
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="absolute right-0 h-3 w-3 rounded-full bg-primary/40" style={{ top: 50 + i * 30 }} />
      ))}
    </div>
  );
}
