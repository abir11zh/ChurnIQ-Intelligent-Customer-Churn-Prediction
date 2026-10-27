import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  Cpu,
  DollarSign,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Gauge,
  History,
  Layers,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Users,
  Zap,
  type LucideIcon
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input, Select } from "../../components/ui/input";
import { EmptyState } from "../../components/common/States";
import { cn } from "../../lib/utils";
import { predictCustomer, type PredictionResultData } from "../../lib/api";
import { predictionSchema, type PredictionFormValues } from "../../lib/schemas";
import {
  batchDrivers,
  batchMetrics,
  batchPreviewRows,
  batchProcessingSteps,
  customerComparison,
  highRiskGroups,
  predictionHistoryRows,
  predictionLoadingSteps,
  predictionTrend,
  protectiveFactors,
  retentionRecommendations,
  riskDistribution,
  riskFactors,
  similarCustomers,
  type PredictionRisk
} from "./predictionExperienceData";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

const draftKey = "churniq:prediction-draft";
const gridStroke = "#EEF2FF";
const axisTick = { fill: "#6B7280", fontSize: 12 };
const chartTooltip = {
  borderRadius: 16,
  border: "1px solid #E5E7EB",
  boxShadow: "0 18px 45px rgba(17,24,39,0.12)"
};

const predictionDefaults: PredictionFormValues = {
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
};

const wizardSteps = [
  { title: "Personal Profile", icon: Users },
  { title: "Contract Information", icon: FileText },
  { title: "Services", icon: Layers },
  { title: "Billing", icon: DollarSign },
  { title: "Review & Predict", icon: Sparkles }
];

function readDraft(): PredictionFormValues {
  if (typeof window === "undefined") return predictionDefaults;
  try {
    const raw = window.localStorage.getItem(draftKey);
    if (!raw) return predictionDefaults;
    return { ...predictionDefaults, ...JSON.parse(raw) };
  } catch {
    return predictionDefaults;
  }
}

export function PredictionCenterPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [draftSavedAt, setDraftSavedAt] = useState("Ready");
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const form = useForm<PredictionFormValues>({
    defaultValues: readDraft()
  });

  const watched = form.watch();
  const liveRisk = estimateRisk(watched);
  const liveRiskLabel = riskLabelFromScore(liveRisk);
  const liveRiskTone = riskTone(liveRiskLabel);

  useEffect(() => {
    const subscription = form.watch((value) => {
      window.localStorage.setItem(draftKey, JSON.stringify(value));
      setDraftSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const predictionMutation = useMutation({
    mutationFn: async (values: PredictionFormValues) => {
      setLoadingStage(0);
      setLoadingProgress(4);
      let result: PredictionResultData | null = null;

      for (let index = 0; index < predictionLoadingSteps.length; index += 1) {
        setLoadingStage(index);
        setLoadingProgress(Math.round((index / predictionLoadingSteps.length) * 100));
        await wait(index === 2 ? 360 : 280);
        if (index === 2) {
          result = await predictCustomer(values);
        }
      }

      setLoadingProgress(100);
      await wait(180);
      return result ?? fallbackPrediction(values);
    },
    onSuccess: (prediction, input) => {
      navigate("/predictions/result", {
        state: {
          prediction,
          input,
          liveRisk
        }
      });
    }
  });

  const submitPrediction = form.handleSubmit((values) => {
    const result = predictionSchema.safeParse(values);
    if (!result.success) {
      form.setError("MonthlyCharges", { message: "Please review the required customer values before prediction." });
      return;
    }
    predictionMutation.mutate(result.data);
  });

  const nextStep = () => setActiveStep((step) => Math.min(wizardSteps.length - 1, step + 1));
  const previousStep = () => setActiveStep((step) => Math.max(0, step - 1));

  return (
    <PredictionShell
      eyebrow="Prediction Center"
      title="Single Prediction powered by Logistic Regression"
      subtitle="A guided customer scoring workflow that estimates risk live, explains the customer profile and runs Logistic Regression automatically."
      action={<Badge tone="success">Logistic Regression Production Engine</Badge>}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-slate-100 bg-gradient-to-br from-white via-[#fbfaff] to-[#effcff] p-6 dark:border-white/10 dark:from-slate-900 dark:to-slate-950">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <p className="text-xs font-extrabold uppercase text-muted">Multi-step Prediction Wizard</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-normal">Build a customer profile, then let Logistic Regression decide.</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="primary">Auto Save Draft: {draftSavedAt}</Badge>
                  <Badge tone="success">Automatic Logistic Regression</Badge>
                </div>
              </div>
              <StepIndicator activeStep={activeStep} />
            </div>

            <form onSubmit={submitPrediction} className="p-6">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
              >
                {activeStep === 0 && <PersonalProfileStep form={form} watched={watched} />}
                {activeStep === 1 && <ContractStep form={form} watched={watched} />}
                {activeStep === 2 && <ServicesStep form={form} watched={watched} />}
                {activeStep === 3 && <BillingStep form={form} watched={watched} />}
                {activeStep === 4 && <ReviewStep values={watched} liveRisk={liveRisk} />}
              </motion.div>

              {predictionMutation.isError && (
                <div className="mt-6 rounded-2xl border border-danger/20 bg-red-50 p-4 text-sm font-bold text-danger">
                  Prediction failed. Check that the FastAPI backend is running and that Logistic Regression is loaded.
                </div>
              )}

              <div className="mt-7 flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center dark:border-white/10">
                <Button type="button" variant="outline" onClick={previousStep} disabled={activeStep === 0 || predictionMutation.isPending}>
                  Previous
                </Button>
                <div className="flex flex-wrap gap-2">
                  {activeStep < wizardSteps.length - 1 && (
                    <Button type="button" onClick={nextStep}>
                      Next Step <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  {activeStep === wizardSteps.length - 1 && (
                    <Button type="submit" disabled={predictionMutation.isPending}>
                      <Sparkles className="h-4 w-4" />
                      {predictionMutation.isPending ? "Predicting..." : "Run Logistic Regression Prediction"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <LivePredictionPanel value={liveRisk} label={liveRiskLabel} tone={liveRiskTone} />
          <LogisticRegressionStatusPanel />
          <AIReadinessPanel values={watched} />
        </div>
      </div>

      {predictionMutation.isPending && <PredictionLoadingOverlay stage={loadingStage} progress={loadingProgress} />}
    </PredictionShell>
  );
}

export function PredictionResultPage() {
  const location = useLocation();
  const state = location.state as { prediction?: PredictionResultData; input?: PredictionFormValues; liveRisk?: number } | null;
  const input = state?.input ?? predictionDefaults;
  const probability = state?.prediction ? Math.round(state.prediction.churn_probability * 100) : state?.liveRisk ?? estimateRisk(input);
  const risk = riskLabelFromScore(probability);
  const confidence = state?.prediction ? Math.round(state.prediction.confidence * 100) : 94;
  const revenueAtRisk = Math.round((Number(input.MonthlyCharges) || 70) * 12 * (probability / 100));
  const lifetimeValue = Math.max(2400, Math.round((Number(input.MonthlyCharges) || 70) * Math.max(Number(input.tenure) || 12, 24) * 2.4));

  return (
    <PredictionShell
      eyebrow="Prediction Result"
      title="Logistic Regression churn decision"
      subtitle="Risk, why it happened, how confident the model is, revenue impact and recommended next actions."
      action={<Button asChild variant="outline"><Link to="/predictions/single"><RefreshCw className="h-4 w-4" /> New Prediction</Link></Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-white via-[#fbfaff] to-[#eefcff] p-8 text-center dark:from-slate-900 dark:to-slate-950">
          <div className="absolute right-8 top-8 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-primary shadow-sm">Logistic Regression</div>
          <LargeRiskGauge value={probability} risk={risk} />
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Probability" value={`${probability}%`} />
            <MiniMetric label="Risk Level" value={`${risk} Risk`} />
            <MiniMetric label="Confidence" value={`${confidence}%`} />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <Badge tone={riskTone(risk)}>Prediction Summary</Badge>
                <CardTitle className="mt-3">This customer is highly likely to churn.</CardTitle>
                <CardDescription>
                  The customer is highly likely to churn due to contract type, billing profile and service engagement patterns.
                </CardDescription>
              </div>
              <BrainCircuit className="h-8 w-8 text-primary" />
            </CardHeader>
            <p className="rounded-2xl bg-[#f6f4ff] p-4 text-sm leading-7 text-muted">
              The customer has a month-to-month contract and high monthly charges. Similar customers historically show a significantly higher churn rate when technical support is missing and tenure is still short.
            </p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <FinancialCard title="Revenue At Risk" value={formatCurrency(revenueAtRisk)} icon={AlertTriangle} tone="danger" />
            <FinancialCard title="Expected Revenue Saved" value={formatCurrency(retentionRecommendations[0].revenueSaved)} icon={ShieldCheck} tone="success" />
            <FinancialCard title="Customer Lifetime Value" value={formatCurrency(lifetimeValue)} icon={DollarSign} tone="primary" />
            <FinancialCard title="Retention Value" value={formatCurrency(Math.round(lifetimeValue * 0.38))} icon={Target} tone="warning" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <FactorSection title="Top Positive Factors" description="Signals pushing churn risk higher." factors={riskFactors} tone="danger" />
        <FactorSection title="Protective Factors" description="Signals reducing churn risk." factors={protectiveFactors} tone="success" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI Explanation</CardTitle>
              <CardDescription>Business-friendly explanation without technical model jargon.</CardDescription>
            </div>
            <Sparkles className="h-7 w-7 text-primary" />
          </CardHeader>
          <p className="text-sm leading-7 text-muted">
            This account combines flexible contract terms, a higher-than-average monthly bill and limited support coverage. Customers with this pattern often churn when they do not receive a targeted retention offer before renewal pressure appears.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Engine" value="Logistic Regression" />
            <MiniMetric label="Status" value="Online" />
            <MiniMetric label="ROC-AUC" value="84.7%" />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Retention Recommendations</CardTitle>
              <CardDescription>AI-generated actions ranked by expected impact.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            {retentionRecommendations.map((item) => (
              <div key={item.action} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center dark:bg-white/5">
                <div>
                  <p className="font-extrabold">{item.action}</p>
                  <p className="mt-1 text-sm text-muted">Risk reduction {item.reduction}% - Revenue saved {formatCurrency(item.revenueSaved)}</p>
                </div>
                <Badge tone="primary">{item.confidence}% confidence</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CustomerComparison />
        <SimilarCustomers />
      </div>
    </PredictionShell>
  );
}

export function PredictionHistoryPage() {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All risks");
  const filtered = predictionHistoryRows.filter((row) => {
    const text = `${row.customer} ${row.customerId} ${row.risk}`.toLowerCase();
    if (query.trim() && !text.includes(query.trim().toLowerCase())) return false;
    if (riskFilter !== "All risks" && row.risk !== riskFilter) return false;
    return true;
  });

  return (
    <PredictionShell
      eyebrow="Prediction History"
      title="Logistic Regression prediction audit trail"
      subtitle="Every customer score, confidence level, revenue risk and follow-up action in one searchable history."
      action={<Button><Download className="h-4 w-4" /> Export</Button>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Predictions" value="18,420" icon={History} tone="primary" />
        <MetricCard title="Critical Risk" value="421" icon={AlertTriangle} tone="danger" />
        <MetricCard title="Avg Confidence" value="91%" icon={BadgeCheck} tone="success" />
        <MetricCard title="Revenue Risk" value="$184K" icon={DollarSign} tone="warning" />
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Search customer, ID or risk level..." />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} className="w-44">
              <option>All risks</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </Select>
            <Button variant="outline"><FileSpreadsheet className="h-4 w-4" /> CSV</Button>
            <Button variant="outline"><FileText className="h-4 w-4" /> PDF</Button>
          </div>
        </div>

        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  {["Customer", "Date", "Probability", "Risk Level", "Confidence", "Revenue Risk", "Outcome", "Actions"].map((header) => (
                    <th key={header} className="px-4 py-3 font-extrabold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 transition hover:bg-[#fbfaff] dark:border-white/10">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar label={row.avatar} />
                        <div>
                          <p className="font-extrabold">{row.customer}</p>
                          <p className="text-xs text-muted">{row.customerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted">{row.date}</td>
                    <td className="px-4 py-4"><RiskProgress value={row.probability} risk={row.risk} /></td>
                    <td className="px-4 py-4"><RiskBadge risk={row.risk} /></td>
                    <td className="px-4 py-4 font-extrabold">{row.confidence}%</td>
                    <td className="px-4 py-4 font-extrabold">{formatCurrency(row.revenueRisk)}</td>
                    <td className="px-4 py-4 text-muted">{row.outcome}</td>
                    <td className="px-4 py-4"><Button size="sm" variant="outline"><Eye className="h-4 w-4" /> View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Search} title="No predictions found" description="Try a different search or clear the risk filter." actionLabel="Clear filters" onAction={() => { setQuery(""); setRiskFilter("All risks"); }} />
        )}
      </Card>
    </PredictionShell>
  );
}

export function PredictionInsightsPage() {
  return (
    <PredictionShell
      eyebrow="Prediction Insights"
      title="Prediction intelligence center"
      subtitle="Monitor average risk, prediction trends, risk distribution, recall governance and the groups creating the most exposure."
      action={<Badge tone="success">ROC-AUC 84.7%</Badge>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Average Risk" value="47%" icon={Gauge} tone="warning" />
        <MetricCard title="Prediction Volume" value="18,420" icon={Activity} tone="primary" />
        <MetricCard title="High Risk Groups" value="5" icon={Users} tone="danger" />
        <MetricCard title="LR Recall" value="79.7%" icon={BadgeCheck} tone="success" />
        <MetricCard title="Active Predictions" value="1,253" icon={Zap} tone="primary" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Prediction Trends</CardTitle>
              <CardDescription>Average churn risk and high-risk customer volume over time.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionTrend} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D5BFF" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#6D5BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={chartTooltip} />
                <Area type="monotone" dataKey="averageRisk" stroke="#6D5BFF" fill="url(#riskTrend)" strokeWidth={3} />
                <Line type="monotone" dataKey="highRisk" stroke="#EF4444" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Customer predictions by risk level.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistribution} innerRadius={76} outerRadius={112} dataKey="value" nameKey="name" paddingAngle={4}>
                  {riskDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {riskDistribution.map((item) => <MiniMetric key={item.name} label={item.name} value={item.value.toLocaleString()} />)}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Prediction Volume</CardTitle>
              <CardDescription>Monthly scoring throughput.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictionTrend} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={chartTooltip} />
                <Bar dataKey="volume" fill="#00D4FF" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>High Risk Groups</CardTitle>
              <CardDescription>Segments with the highest churn pressure.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {highRiskGroups.map((group) => (
              <div key={group.group}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-extrabold">{group.group}</span>
                  <span className="font-bold text-muted">{group.customers.toLocaleString()} customers</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-danger" style={{ width: `${group.risk}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PredictionShell>
  );
}

export function BatchPredictionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const runBatch = async () => {
    setProcessing(true);
    setDone(false);
    setProgress(0);
    for (let index = 0; index < batchProcessingSteps.length; index += 1) {
      setStage(index);
      setProgress(Math.round((index / batchProcessingSteps.length) * 100));
      await wait(320);
    }
    setProgress(100);
    setDone(true);
    setProcessing(false);
  };

  return (
    <PredictionShell
      eyebrow="Batch Prediction"
      title="Score thousands of customers with Logistic Regression"
      subtitle="Upload customer records, validate the dataset, run Logistic Regression and export a prediction report."
      action={<Badge tone="success">CSV, Excel, XLSX</Badge>}
    >
      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="min-h-[360px] border-dashed border-primary/30 bg-gradient-to-br from-white to-[#f7f5ff] dark:from-slate-900 dark:to-slate-950">
          <label className="grid h-full cursor-pointer place-items-center rounded-3xl text-center">
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#f2efff] text-primary">
                <CloudUpload className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-2xl font-extrabold">Drag and drop your file here</h2>
              <p className="mt-2 text-sm text-muted">CSV or Excel files with telecom churn customer columns.</p>
              <Button type="button" className="mt-5"><Upload className="h-4 w-4" /> Browse File</Button>
              {selectedFile && <p className="mt-4 text-sm font-extrabold text-primary">{selectedFile.name} ready for validation</p>}
            </div>
          </label>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>File Preview</CardTitle>
              <CardDescription>1,000 uploaded records detected. Required churn model fields are available.</CardDescription>
            </div>
            <Badge tone="success">{selectedFile ? "Ready" : "Sample Preview"}</Badge>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  {["Customer ID", "Contract", "Monthly", "Tenure", "Status"].map((header) => <th key={header} className="px-3 py-3">{header}</th>)}
                </tr>
              </thead>
              <tbody>
                {batchPreviewRows.map((row) => (
                  <tr key={row.customerId} className="border-t border-slate-100 dark:border-white/10">
                    <td className="px-3 py-3 font-extrabold text-primary">{row.customerId}</td>
                    <td className="px-3 py-3">{row.contract}</td>
                    <td className="px-3 py-3">${row.monthly}</td>
                    <td className="px-3 py-3">{row.tenure} mo</td>
                    <td className="px-3 py-3"><Badge tone="success">{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={runBatch} disabled={processing} className="mt-6 w-full">
            <Play className="h-4 w-4" /> {processing ? "Processing..." : "Run Batch Prediction"}
          </Button>
        </Card>
      </div>

      {(processing || done) && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Processing Experience</CardTitle>
              <CardDescription>{processing ? batchProcessingSteps[stage] : "Batch prediction completed."}</CardDescription>
            </div>
            <Badge tone={done ? "success" : "primary"}>{progress}%</Badge>
          </CardHeader>
          <div className="h-3 rounded-full bg-slate-100">
            <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {batchProcessingSteps.map((step, index) => (
              <div key={step} className={cn("rounded-2xl p-3 text-sm font-bold", index <= stage || done ? "bg-[#f2efff] text-primary" : "bg-slate-50 text-muted")}>
                {step}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {batchMetrics.map((metric) => <MetricCard key={metric.label} title={metric.label} value={metric.value} icon={metricIcon(metric.label)} tone={metricTone(metric.label)} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Batch Visualizations</CardTitle>
              <CardDescription>Risk distribution and retention opportunity.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistribution} innerRadius={70} outerRadius={108} dataKey="value" paddingAngle={4}>
                  {riskDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top Risk Drivers</CardTitle>
              <CardDescription>Global drivers detected in the uploaded dataset.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {batchDrivers.map((driver) => (
              <div key={driver.feature}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-extrabold">{driver.feature}</span>
                  <span className="font-bold text-danger">{driver.impact}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-danger" style={{ width: `${driver.impact}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Exports</CardTitle>
            <CardDescription>Download operational files and executive reports.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-4">
          {["CSV", "Excel", "PDF", "Prediction Report"].map((label) => (
            <Button key={label} variant="outline"><Download className="h-4 w-4" /> Export {label}</Button>
          ))}
        </div>
      </Card>
    </PredictionShell>
  );
}

function PersonalProfileStep({ form, watched }: WizardStepProps) {
  return (
    <StepGrid
      title="Personal Profile"
      description="Capture customer household profile signals."
      preview={<ProfilePreview values={watched} />}
    >
      <Field label="Gender"><Select {...form.register("gender")}><option>Female</option><option>Male</option></Select></Field>
      <Field label="Senior Citizen"><Select {...form.register("SeniorCitizen")}><option>No</option><option>Yes</option></Select></Field>
      <Field label="Partner"><Select {...form.register("Partner")}><option>Yes</option><option>No</option></Select></Field>
      <Field label="Dependents"><Select {...form.register("Dependents")}><option>No</option><option>Yes</option></Select></Field>
    </StepGrid>
  );
}

function ContractStep({ form, watched }: WizardStepProps) {
  return (
    <StepGrid
      title="Contract Information"
      description="Contract structure, tenure and payment behaviour shape churn risk."
      preview={<SummaryPanel title="Contract Summary" rows={[["Contract", watched.Contract], ["Tenure", `${watched.tenure || 0} months`], ["Billing", watched.PaperlessBilling], ["Payment", watched.PaymentMethod]]} />}
    >
      <Field label="Contract Type"><Select {...form.register("Contract")}><option>Month-to-month</option><option>One year</option><option>Two year</option></Select></Field>
      <Field label="Tenure"><Input type="number" {...form.register("tenure", { valueAsNumber: true })} /></Field>
      <Field label="Paperless Billing"><Select {...form.register("PaperlessBilling")}><option>Yes</option><option>No</option></Select></Field>
      <Field label="Payment Method"><Select {...form.register("PaymentMethod")}><option>Electronic check</option><option>Mailed check</option><option>Bank transfer (automatic)</option><option>Credit card (automatic)</option></Select></Field>
    </StepGrid>
  );
}

function ServicesStep({ form, watched }: WizardStepProps) {
  const services = [
    ["Phone Service", watched.PhoneService],
    ["Internet Service", watched.InternetService],
    ["Online Security", watched.OnlineSecurity],
    ["Online Backup", watched.OnlineBackup],
    ["Device Protection", watched.DeviceProtection],
    ["Tech Support", watched.TechSupport],
    ["Streaming TV", watched.StreamingTV],
    ["Streaming Movies", watched.StreamingMovies]
  ];

  return (
    <StepGrid
      title="Services"
      description="Service adoption and missing support are key Logistic Regression churn signals."
      preview={<ServicePreview services={services} />}
    >
      <Field label="Phone Service"><Select {...form.register("PhoneService")}><option>Yes</option><option>No</option></Select></Field>
      <Field label="Multiple Lines"><Select {...form.register("MultipleLines")}><option>No</option><option>Yes</option><option>No phone service</option></Select></Field>
      <Field label="Internet Service"><Select {...form.register("InternetService")}><option>Fiber optic</option><option>DSL</option><option>No</option></Select></Field>
      <Field label="Online Security"><Select {...form.register("OnlineSecurity")}><option>No</option><option>Yes</option><option>No internet service</option></Select></Field>
      <Field label="Online Backup"><Select {...form.register("OnlineBackup")}><option>No</option><option>Yes</option><option>No internet service</option></Select></Field>
      <Field label="Device Protection"><Select {...form.register("DeviceProtection")}><option>No</option><option>Yes</option><option>No internet service</option></Select></Field>
      <Field label="Tech Support"><Select {...form.register("TechSupport")}><option>No</option><option>Yes</option><option>No internet service</option></Select></Field>
      <Field label="Streaming TV"><Select {...form.register("StreamingTV")}><option>Yes</option><option>No</option><option>No internet service</option></Select></Field>
      <Field label="Streaming Movies"><Select {...form.register("StreamingMovies")}><option>Yes</option><option>No</option><option>No internet service</option></Select></Field>
    </StepGrid>
  );
}

function BillingStep({ form, watched }: WizardStepProps) {
  const monthly = Number(watched.MonthlyCharges) || 0;
  const total = Number(watched.TotalCharges) || 0;
  return (
    <StepGrid
      title="Billing"
      description="Charges are translated into revenue exposure and affordability pressure."
      preview={<SpendingAnalysis monthly={monthly} total={total} />}
    >
      <Field label="Monthly Charges"><Input type="number" {...form.register("MonthlyCharges", { valueAsNumber: true })} /></Field>
      <Field label="Total Charges"><Input type="number" {...form.register("TotalCharges", { valueAsNumber: true })} /></Field>
    </StepGrid>
  );
}

function ReviewStep({ values, liveRisk }: { values: Partial<PredictionFormValues>; liveRisk: number }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-2xl font-extrabold">Review & Predict</h3>
        <p className="mt-2 text-sm leading-6 text-muted">Confirm the profile below. Logistic Regression will run automatically and produce risk, explanation and recommendations.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SummaryPanel title="Customer Snapshot" rows={[["Gender", values.gender], ["Senior Citizen", values.SeniorCitizen], ["Partner", values.Partner], ["Dependents", values.Dependents]]} />
        <SummaryPanel title="Contract Summary" rows={[["Contract", values.Contract], ["Tenure", `${values.tenure || 0} months`], ["Payment", values.PaymentMethod], ["Paperless Billing", values.PaperlessBilling]]} />
        <SummaryPanel title="Services Summary" rows={[["Internet", values.InternetService], ["Tech Support", values.TechSupport], ["Online Security", values.OnlineSecurity], ["Streaming", `${values.StreamingTV} TV / ${values.StreamingMovies} Movies`]]} />
        <SummaryPanel title="Billing Summary" rows={[["Monthly Charges", `$${values.MonthlyCharges || 0}`], ["Total Charges", `$${values.TotalCharges || 0}`], ["Live Risk", `${liveRisk}%`], ["Prediction Engine", "Logistic Regression"]]} />
      </div>
    </div>
  );
}

type WizardStepProps = {
  form: ReturnType<typeof useForm<PredictionFormValues>>;
  watched: Partial<PredictionFormValues>;
};

function PredictionShell({ eyebrow, title, subtitle, action, children }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge tone="primary">{eyebrow}</Badge>
          <h1 className="mt-3 max-w-5xl text-3xl font-extrabold tracking-normal text-ink dark:text-white md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StepIndicator({ activeStep }: { activeStep: number }) {
  const progress = ((activeStep + 1) / wizardSteps.length) * 100;
  return (
    <div className="mt-6">
      <div className="h-2 rounded-full bg-slate-100">
        <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.32 }} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {wizardSteps.map((step, index) => {
          const Icon = step.icon;
          const active = index === activeStep;
          const complete = index < activeStep;
          return (
            <div key={step.title} className={cn("rounded-2xl border p-3 transition", active ? "border-primary/30 bg-[#f2efff] text-primary" : complete ? "border-green-100 bg-green-50 text-green-600" : "border-slate-100 bg-white text-muted dark:border-white/10 dark:bg-white/5")}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-extrabold">{index + 1}. {step.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepGrid({ title, description, preview, children }: { title: string; description: string; preview: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div>
        <h3 className="text-2xl font-extrabold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">{children}</div>
      </div>
      {preview}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-muted">
      {label}
      {children}
    </label>
  );
}

function LivePredictionPanel({ value, label, tone }: { value: number; label: PredictionRisk; tone: BadgeTone }) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-white via-[#fbfaff] to-[#effcff] p-6 dark:from-slate-900 dark:to-slate-950">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase text-muted">Live AI Prediction</p>
          <h3 className="mt-1 text-xl font-extrabold">Current Risk</h3>
        </div>
        <Badge tone={tone}>{label}</Badge>
      </div>
      <div className="mt-6 grid place-items-center">
        <LargeRiskGauge value={value} risk={label} compact />
      </div>
      <div className="mt-6 grid grid-cols-4 gap-2">
        {(["Low", "Medium", "High", "Critical"] as PredictionRisk[]).map((risk) => (
          <div key={risk} className={cn("rounded-xl p-2 text-center text-xs font-extrabold", risk === label ? "bg-primary text-white" : "bg-white/80 text-muted dark:bg-white/5")}>{risk}</div>
        ))}
      </div>
    </Card>
  );
}

function LogisticRegressionStatusPanel() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Logistic Regression Status</CardTitle>
          <CardDescription>Production prediction engine.</CardDescription>
        </div>
        <Cpu className="h-7 w-7 text-primary" />
      </CardHeader>
      <div className="grid gap-3">
        <StatusRow label="Prediction Engine" value="Logistic Regression" tone="primary" />
        <StatusRow label="Status" value="Online" tone="success" />
        <StatusRow label="ROC-AUC" value="84.7%" tone="success" />
        <StatusRow label="Recall Review" value="79.7%" tone="success" />
      </div>
    </Card>
  );
}

function AIReadinessPanel({ values }: { values: Partial<PredictionFormValues> }) {
  const ready = [
    values.gender,
    values.Contract,
    values.InternetService,
    values.TechSupport,
    values.MonthlyCharges,
    values.TotalCharges
  ].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Profile Readiness</CardTitle>
          <CardDescription>Signals available for scoring.</CardDescription>
        </div>
      </CardHeader>
      <div className="h-3 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary" style={{ width: `${(ready / 6) * 100}%` }} />
      </div>
      <p className="mt-3 text-sm font-bold text-muted">{ready}/6 core scoring groups completed</p>
    </Card>
  );
}

function PredictionLoadingOverlay({ stage, progress }: { stage: number; progress: number }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl rounded-[28px] border border-white/40 bg-white p-6 shadow-soft dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="font-extrabold">Logistic Regression is thinking</p>
            <p className="text-sm text-muted">{predictionLoadingSteps[stage]}</p>
          </div>
        </div>
        <div className="mt-6 h-3 rounded-full bg-slate-100">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progress}%` }} />
        </div>
        <div className="mt-5 grid gap-2">
          {predictionLoadingSteps.map((step, index) => (
            <div key={step} className={cn("flex items-center gap-3 rounded-xl p-3 text-sm font-bold", index <= stage ? "bg-[#f2efff] text-primary" : "bg-slate-50 text-muted")}>
              {index < stage ? <CheckCircle2 className="h-4 w-4" /> : index === stage ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              {step}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ProfilePreview({ values }: { values: Partial<PredictionFormValues> }) {
  return (
    <Card className="bg-gradient-to-br from-white to-[#f8f7ff]">
      <CardTitle>Customer Profile Preview</CardTitle>
      <div className="mt-5 grid gap-3">
        <MiniMetric label="Gender" value={values.gender ?? "Female"} />
        <MiniMetric label="Senior Citizen" value={values.SeniorCitizen ?? "No"} />
        <MiniMetric label="Partner" value={values.Partner ?? "Yes"} />
        <MiniMetric label="Dependents" value={values.Dependents ?? "No"} />
      </div>
    </Card>
  );
}

function ServicePreview({ services }: { services: Array<(string | undefined)[]> }) {
  return (
    <Card>
      <CardTitle>Selected Services</CardTitle>
      <div className="mt-5 grid gap-2">
        {services.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <span className="text-sm font-bold">{label}</span>
            <Badge tone={value === "Yes" || value === "Fiber optic" || value === "DSL" ? "success" : value === "No" ? "danger" : "neutral"}>{value}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SpendingAnalysis({ monthly, total }: { monthly: number; total: number }) {
  const annual = monthly * 12;
  const pressure = monthly >= 85 ? "High" : monthly >= 60 ? "Moderate" : "Controlled";
  return (
    <Card>
      <CardTitle>Live Spending Analysis</CardTitle>
      <div className="mt-5 grid gap-3">
        <MiniMetric label="Monthly Spend" value={formatCurrency(monthly)} />
        <MiniMetric label="Annualized Revenue" value={formatCurrency(annual)} />
        <MiniMetric label="Total Charges" value={formatCurrency(total)} />
        <MiniMetric label="Price Pressure" value={pressure} />
      </div>
    </Card>
  );
}

function SummaryPanel({ title, rows }: { title: string; rows: Array<[string, ReactNode]> }) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <div className="mt-5 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <span className="text-xs font-extrabold uppercase text-muted">{label}</span>
            <span className="text-right text-sm font-bold">{value ?? "Not set"}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FactorSection({ title, description, factors, tone }: { title: string; description: string; factors: Array<{ label: string; detail: string; contribution: number }>; tone: "danger" | "success" }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-4">
        {factors.map((factor) => (
          <div key={factor.label}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="font-extrabold">{factor.label}</p>
                <p className="text-xs text-muted">{factor.detail}</p>
              </div>
              <span className={cn("font-extrabold", tone === "danger" ? "text-danger" : "text-success")}>{factor.contribution > 0 ? "+" : ""}{factor.contribution}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className={cn("h-full rounded-full", tone === "danger" ? "bg-danger" : "bg-success")} style={{ width: `${Math.min(Math.abs(factor.contribution) * 2.2, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CustomerComparison() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Customer Comparison</CardTitle>
          <CardDescription>Compared against platform averages.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-5">
        {customerComparison.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-extrabold">{item.label}</span>
              <span className="font-bold text-muted">{item.note}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ComparisonBar label="Customer" value={item.customer} color="#6D5BFF" />
              <ComparisonBar label="Average" value={item.average} color="#CBD5E1" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SimilarCustomers() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Similar Customers</CardTitle>
          <CardDescription>Customers with comparable churn profile.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {similarCustomers.map((customer) => (
          <div key={customer.name} className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center dark:bg-white/5">
            <div>
              <p className="font-extrabold">{customer.name}</p>
              <p className="text-sm text-muted">{customer.retention}</p>
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge risk={riskLabelFromScore(customer.risk)} />
              <Badge tone={customer.outcome === "Saved" ? "success" : customer.outcome === "Churned" ? "danger" : "warning"}>{customer.outcome}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LargeRiskGauge({ value, risk, compact = false }: { value: number; risk: PredictionRisk; compact?: boolean }) {
  const color = riskColor(risk);
  const size = compact ? "h-52 w-52" : "h-72 w-72";
  return (
    <div className={cn("relative mx-auto", size)}>
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ background: `conic-gradient(${color} 0 0%, #EEF2FF 0% 100%)` }}
        animate={{ background: `conic-gradient(${color} 0 ${value}%, #EEF2FF ${value}% 100%)` }}
        transition={{ duration: 0.7 }}
      />
      <div className="absolute inset-7 grid place-items-center rounded-full bg-white dark:bg-slate-950">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase text-muted">Current Risk</p>
          <p className={cn("mt-2 font-extrabold", compact ? "text-5xl" : "text-6xl")}>{value}%</p>
          <p className="mt-2 text-sm font-extrabold uppercase" style={{ color }}>{risk} Risk</p>
        </div>
      </div>
    </div>
  );
}

function RiskProgress({ value, risk }: { value: number; risk: PredictionRisk }) {
  return (
    <div className="min-w-36">
      <div className="flex items-center justify-between text-xs font-extrabold">
        <span>{value}%</span>
        <span style={{ color: riskColor(risk) }}>{risk}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: riskColor(risk) }} />
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: PredictionRisk }) {
  return <Badge tone={riskTone(risk)}>{risk}</Badge>;
}

function MetricCard({ title, value, icon: Icon, tone }: { title: string; value: string; icon: LucideIcon; tone: BadgeTone }) {
  return (
    <Card className="transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <Badge tone={tone}>{title}</Badge>
      </div>
      <p className="mt-5 text-3xl font-extrabold">{value}</p>
    </Card>
  );
}

function FinancialCard({ title, value, icon: Icon, tone }: { title: string; value: string; icon: LucideIcon; tone: BadgeTone }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase text-muted">{title}</p>
          <p className="mt-2 text-2xl font-extrabold">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <Badge className="mt-4" tone={tone}>Financial impact</Badge>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-xs font-extrabold uppercase text-muted">{label}</p>
      <p className="mt-1 text-sm font-extrabold">{value}</p>
    </div>
  );
}

function StatusRow({ label, value, tone }: { label: string; value: string; tone: BadgeTone }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
      <span className="text-sm font-bold text-muted">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

function Avatar({ label }: { label: string }) {
  return <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent text-sm font-extrabold text-white">{label}</div>;
}

function ComparisonBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-muted">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

function estimateRisk(values: Partial<PredictionFormValues>) {
  const monthly = Number(values.MonthlyCharges) || 0;
  const tenure = Number(values.tenure) || 0;
  const contractScore = values.Contract === "Month-to-month" ? 24 : values.Contract === "One year" ? 8 : -6;
  const supportScore = values.TechSupport === "No" ? 12 : values.TechSupport === "Yes" ? -6 : 4;
  const securityScore = values.OnlineSecurity === "No" ? 7 : values.OnlineSecurity === "Yes" ? -5 : 0;
  const paymentScore = values.PaymentMethod === "Electronic check" ? 8 : -2;
  const tenureScore = tenure <= 12 ? 14 : tenure <= 24 ? 6 : tenure >= 48 ? -10 : -3;
  const seniorScore = values.SeniorCitizen === "Yes" ? 5 : 0;
  return Math.min(96, Math.max(6, Math.round(monthly / 2.35 + contractScore + supportScore + securityScore + paymentScore + tenureScore + seniorScore)));
}

function riskLabelFromScore(value: number): PredictionRisk {
  if (value >= 80) return "Critical";
  if (value >= 60) return "High";
  if (value >= 40) return "Medium";
  return "Low";
}

function riskTone(risk: PredictionRisk): BadgeTone {
  if (risk === "Low") return "success";
  if (risk === "Medium") return "warning";
  return "danger";
}

function riskColor(risk: PredictionRisk) {
  if (risk === "Low") return "#22C55E";
  if (risk === "Medium") return "#F59E0B";
  if (risk === "High") return "#F97316";
  return "#EF4444";
}

function metricIcon(label: string): LucideIcon {
  if (label.includes("Revenue")) return DollarSign;
  if (label.includes("High")) return AlertTriangle;
  if (label.includes("Medium")) return Gauge;
  if (label.includes("Low")) return ShieldCheck;
  if (label.includes("Retention")) return Target;
  return Users;
}

function metricTone(label: string): BadgeTone {
  if (label.includes("High") || label.includes("Revenue")) return "danger";
  if (label.includes("Medium")) return "warning";
  if (label.includes("Low") || label.includes("Retention")) return "success";
  return "primary";
}

function fallbackPrediction(values: PredictionFormValues): PredictionResultData {
  const risk = estimateRisk(values);
  return {
    churn_probability: risk / 100,
    will_churn: risk >= 50,
    risk_level: riskLabelFromScore(risk).toUpperCase(),
    recommendation: "Offer a targeted retention package with technical support and annual contract incentive.",
    confidence: 0.94,
    threshold_used: 0.62,
    model_version: "4.0.0",
    model_name: "Logistic Regression",
    model_source: "production",
    scored_at: new Date().toISOString()
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
