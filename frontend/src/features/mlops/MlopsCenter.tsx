import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Database,
  Download,
  FileText,
  Gauge,
  Layers,
  LineChart as LineChartIcon,
  RefreshCw,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Upload,
  Zap,
  type LucideIcon
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import {
  aiHealthScores,
  alertCenter,
  confidenceBySegment,
  confidenceHistogram,
  correlationMatrix,
  dataQualityOverview,
  dataScientistReadout,
  datasetDistributions,
  datasetStats,
  driftAlerts,
  executiveAiReadout,
  explainabilityHealth,
  featureDriftRanking,
  featureMonitoring,
  mlopsExports,
  mlopsKpis,
  modelVersions,
  predictionDistribution,
  predictionVolumeTrend,
  productionModel,
  qualityChecks,
  retrainingHistory,
  retrainingSummary,
  riskDistribution,
  type MlopsMetric,
  type MlopsTone
} from "./mlopsData";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

const chartTooltip = {
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  boxShadow: "0 20px 45px rgba(17, 24, 39, 0.08)"
};

const axisTick = { fill: "#64748B", fontSize: 11, fontWeight: 700 };
const gridStroke = "#EEF2FF";

const mlopsTabs = [
  { label: "Operations", href: "/mlops", icon: BrainCircuit },
  { label: "Models", href: "/mlops/models", icon: Layers },
  { label: "Monitoring", href: "/mlops/monitoring", icon: Activity },
  { label: "Drift", href: "/mlops/drift", icon: AlertTriangle },
  { label: "Data Quality", href: "/mlops/data-quality", icon: ShieldCheck },
  { label: "Datasets", href: "/mlops/datasets", icon: Database },
  { label: "Retraining", href: "/mlops/retraining", icon: RefreshCw },
  { label: "Registry", href: "/mlops/registry", icon: FileText }
];

const metricIcons: Record<string, LucideIcon> = {
  "Current Accuracy": Gauge,
  Precision: Target,
  Recall: RefreshCw,
  "F1 Score": Activity,
  "ROC-AUC": LineChartIcon,
  "Predictions Today": Zap,
  "Predictions This Month": BarChart3,
  "Average Confidence": ShieldCheck,
  "Active Customers": Database
};

export function MlopsDashboardPage() {
  return (
    <MlopsPage
      eyebrow="AI Operations"
      title="Production AI monitoring with recall-aware governance."
      subtitle="Executives monitor business reliability. Data scientists monitor ROC-AUC, recall and cost tradeoffs. ML engineers monitor AI health, drift, data quality and retraining readiness."
      action={<Button><Download className="h-4 w-4" /> Export Monitoring Report</Button>}
    >
      <ProductionHero />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {aiHealthScores.map((score) => <HealthScoreCard key={score.label} score={score} />)}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mlopsKpis.slice(0, 9).map((metric) => <MlopsMetricCard key={metric.label} metric={metric} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Prediction Volume and Confidence" description="Daily scoring throughput and average confidence.">
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={predictionVolumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" tick={axisTick} />
              <YAxis yAxisId="left" tick={axisTick} />
              <YAxis yAxisId="right" orientation="right" tick={axisTick} domain={[85, 95]} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar yAxisId="left" dataKey="volume" fill="#6D5BFF" radius={[10, 10, 0, 0]} name="Prediction volume" />
              <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#00D4FF" strokeWidth={3} name="Confidence %" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <AlertCenter />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ReadoutCard title="Executive AI View" subtitle="Business-friendly monitoring without technical noise." items={executiveAiReadout} icon={ShieldCheck} />
        <ReadoutCard title="Data Scientist View" subtitle="Technical signals for drift, metrics and retraining." items={dataScientistReadout} icon={BrainCircuit} />
      </div>

      <ExplainabilityHealth />
      <ExportsPanel />
    </MlopsPage>
  );
}

export function MlopsModelsPage() {
  return (
    <MlopsPage
      eyebrow="Active Model"
      title="Current scoring artifact and business recommendation."
      subtitle="Track current version, deployment date, predictions served, ROC-AUC benchmark, recall risk and deployment health."
      action={<Button variant="outline"><Server className="h-4 w-4" /> Serving Details</Button>}
    >
      <ProductionHero />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Production Scoring Artifact</CardTitle>
              <CardDescription>Current active scoring model served by the platform, with governance context.</CardDescription>
            </div>
            <Badge tone="success">{productionModel.status}</Badge>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Model", productionModel.name],
              ["Current Version", productionModel.version],
              ["Deployment Date", productionModel.deploymentDate],
              ["Predictions Served", productionModel.predictionsServed],
              ["Benchmark Signal", productionModel.averageConfidence],
              ["Serving Latency", productionModel.servingLatency]
            ].map(([label, value]) => <InfoTile key={label} label={label} value={value} />)}
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-muted dark:bg-white/5">
            {productionModel.governanceNote}
          </div>
        </Card>
        <ChartCard title="Model Performance Trend" description="Production confidence and high-risk volume.">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={predictionVolumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Area type="monotone" dataKey="confidence" stroke="#6D5BFF" fill="#6D5BFF" fillOpacity={0.2} name="Confidence" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <ModelVersionsTable />
    </MlopsPage>
  );
}

export function MlopsMonitoringPage() {
  return (
    <MlopsPage
      eyebrow="Model Monitoring"
      title="Prediction behavior, confidence and risk distribution."
      subtitle="Monitor prediction volume, confidence trends, risk distribution, Logistic Regression scoring behavior and recall-first business signals."
      action={<Button><SlidersHorizontal className="h-4 w-4" /> Configure Monitors</Button>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Prediction Volume", "7,043 today", "Live scoring throughput"],
          ["Benchmark ROC-AUC", "84.7%", "Logistic Regression technical signal"],
          ["High Risk Customers", "421", "Requires retention action"],
          ["Distribution Shift", "Stable", "No critical prediction shift"]
        ].map(([label, value, detail], index) => (
          <Card key={label}>
            <Badge tone={index === 2 ? "warning" : "primary"}>{detail}</Badge>
            <p className="mt-4 text-3xl font-extrabold">{value}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Prediction Trends" description="Daily prediction volume and critical risk count.">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={predictionVolumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="volume" fill="#6D5BFF" radius={[10, 10, 0, 0]} name="Volume" />
              <Line type="monotone" dataKey="highRisk" stroke="#EF4444" strokeWidth={3} name="High risk" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Confidence Histogram" description="Distribution of prediction confidence bands.">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={confidenceHistogram}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="bucket" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="count" fill="#00D4FF" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <PredictionDistributionCard />
        <ChartCard title="Risk Distribution" description="Customers by risk level.">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="risk" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="customers" fill="#6D5BFF" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Confidence by Segment" description="Reliability across business segments.">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={confidenceBySegment}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="segment" tick={axisTick} />
              <YAxis domain={[80, 100]} tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="confidence" fill="#22C55E" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <FeatureMonitoringTable />
    </MlopsPage>
  );
}

export function MlopsDriftPage() {
  return (
    <MlopsPage
      eyebrow="Data Drift Center"
      title="Training data versus current production data."
      subtitle="Detect feature drift affecting the scoring pipeline, rank feature drift severity and review drift alerts before model performance degrades."
      action={<Button><Download className="h-4 w-4" /> Export Drift Report</Button>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Drift Status", "Medium", "3 features shifted"],
          ["Highest Drift", "Monthly Charges", "Score 0.21"],
          ["Critical Alerts", "0", "No critical drift"],
          ["Retraining Need", "Watch", "Not mandatory yet"]
        ].map(([label, value, detail], index) => (
          <Card key={label}>
            <Badge tone={index === 0 || index === 1 ? "warning" : "success"}>{detail}</Badge>
            <p className="mt-4 text-3xl font-extrabold">{value}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Feature Drift Ranking" description="Higher scores indicate greater distribution shift.">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={featureDriftRanking} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick} />
              <YAxis type="category" dataKey="feature" tick={axisTick} width={120} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="driftScore" fill="#F59E0B" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <DriftAlerts />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Training vs Current Data</CardTitle>
            <CardDescription>Feature-level distribution comparison and business impact.</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-muted">
              <tr>{["Feature", "Training Data", "Current Data", "Drift Score", "Severity", "Impact"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
            </thead>
            <tbody>
              {featureDriftRanking.map((row) => (
                <tr key={row.feature} className="border-t border-slate-100 dark:border-white/10">
                  <td className="px-4 py-4 font-extrabold">{row.feature}</td>
                  <td className="px-4 py-4 text-muted">{row.training}</td>
                  <td className="px-4 py-4 text-muted">{row.current}</td>
                  <td className="px-4 py-4 font-bold">{row.driftScore.toFixed(2)}</td>
                  <td className="px-4 py-4"><SeverityBadge value={row.severity} /></td>
                  <td className="px-4 py-4 text-muted">{row.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MlopsPage>
  );
}

export function MlopsDataQualityPage() {
  return (
    <MlopsPage
      eyebrow="Data Quality Center"
      title="Prediction readiness and dataset trust."
      subtitle="Monitor missing values, duplicates, invalid records, outliers, completeness, column health and feature health."
      action={<Button><ShieldCheck className="h-4 w-4" /> Run Quality Checks</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <Card className="grid place-items-center text-center">
          <div className="relative grid h-44 w-44 place-items-center rounded-full" style={{ background: "conic-gradient(#22C55E 0 96%, #E5E7EB 96% 100%)" }}>
            <div className="grid h-32 w-32 place-items-center rounded-full bg-white shadow-soft dark:bg-slate-900">
              <div>
                <p className="text-4xl font-extrabold text-success">96%</p>
                <p className="text-sm font-bold text-muted">Excellent</p>
              </div>
            </div>
          </div>
          <h3 className="mt-6 text-2xl font-extrabold">Data Quality Score</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">The current scoring dataset is complete, consistent and ready for governed churn scoring and threshold review.</p>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dataQualityOverview.map((metric) => <MlopsMetricCard key={metric.label} metric={metric} />)}
        </div>
      </div>

      <QualityChecksPanel />
      <FeatureMonitoringTable />
    </MlopsPage>
  );
}

export function MlopsDatasetsPage() {
  return (
    <MlopsPage
      eyebrow="Dataset Explorer"
      title="Advanced dataset statistics and feature analysis."
      subtitle="Explore rows, columns, missing values, distributions, correlations, histograms, box plots and scatter plots for churn prediction workflows."
      action={<Button><Upload className="h-4 w-4" /> Upload Dataset</Button>}
    >
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {datasetStats.map((stat) => (
          <Card key={stat.label}>
            <Database className="h-6 w-6 text-primary" />
            <p className="mt-4 text-2xl font-extrabold">{stat.value}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Feature Box Plot Summary" description="P25, median, P75 and outlier counts.">
          <div className="space-y-4">
            {datasetDistributions.map((row) => (
              <div key={row.feature}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-extrabold">{row.feature}</span>
                  <span className="font-bold text-muted">{row.outliers} outliers</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-100 dark:bg-white/10">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(96, Math.max(12, row.p75))}%` }} />
                </div>
                <p className="mt-1 text-xs font-bold text-muted">P25 {row.p25} - Median {row.median} - P75 {row.p75}</p>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Correlation Matrix" description="Feature relationships relevant to churn.">
          <div className="grid gap-3 md:grid-cols-2">
            {correlationMatrix.map((item) => (
              <div key={item.pair} className="rounded-2xl p-4" style={{ background: correlationColor(item.value) }}>
                <p className="font-extrabold">{item.pair}</p>
                <p className="mt-2 text-2xl font-extrabold">{item.value.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Scatter Plot: Charges vs Churn Probability" description="Synthetic production monitoring sample.">
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="monthly" name="Monthly charges" tick={axisTick} />
              <YAxis dataKey="risk" name="Risk" tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Scatter data={[
                { monthly: 42, risk: 18 }, { monthly: 58, risk: 31 }, { monthly: 72, risk: 48 },
                { monthly: 86, risk: 67 }, { monthly: 99, risk: 82 }, { monthly: 110, risk: 91 }
              ]} fill="#6D5BFF" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Feature Histograms" description="Current production feature snapshots.">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={confidenceHistogram}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="bucket" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="count" fill="#00D4FF" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </MlopsPage>
  );
}

export function MlopsRetrainingPage() {
  return (
    <MlopsPage
      eyebrow="Retraining Center"
      title="Model retraining management and history."
      subtitle="Track model benchmark runs, training datasets, duration, status, recall reviews and scheduled governance checks."
      action={<Button><RefreshCw className="h-4 w-4" /> Start Retraining</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="bg-gradient-to-br from-primary to-secondary text-white">
          <Badge className="bg-white/20 text-white" tone="primary">{retrainingSummary.status}</Badge>
          <h2 className="mt-5 text-4xl font-extrabold">Retraining Ready</h2>
          <p className="mt-3 text-sm font-bold text-white/78">The model can be retrained when drift thresholds, schedule or governance policies require it.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <MiniStat label="Last Training" value={retrainingSummary.lastTrainingDate} inverted />
            <MiniStat label="Duration" value={retrainingSummary.trainingDuration} inverted />
            <MiniStat label="Dataset" value={retrainingSummary.trainingDataset} inverted />
            <MiniStat label="Next Run" value={retrainingSummary.nextScheduledRun} inverted />
          </div>
        </Card>
        <QualityChecksPanel compact />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Retraining Status</CardTitle>
            <CardDescription>Ready, scheduled, running, completed and failed states.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-5">
          {["Ready", "Scheduled", "Running", "Completed", "Failed"].map((status, index) => (
            <div key={status} className={cn("rounded-2xl border p-4", index === 0 ? "border-green-100 bg-green-50 dark:border-green-900/40 dark:bg-green-950/20" : "border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5")}>
              <p className="font-extrabold">{status}</p>
              <p className="mt-2 text-sm text-muted">{index === 0 ? "Current status" : "Lifecycle state"}</p>
            </div>
          ))}
        </div>
      </Card>

      <RetrainingHistoryTable />
    </MlopsPage>
  );
}

export function MlopsRegistryPage() {
  return (
    <MlopsPage
      eyebrow="Model Registry"
      title="Professional model registry for churn model candidates."
      subtitle="Track model name, version, created date, status, ROC-AUC, recall, deployment status and training metrics."
      action={<Button><FileText className="h-4 w-4" /> Register Model</Button>}
    >
      <ModelVersionsTable />
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <ChartCard title="Registry Performance" description="Accuracy, recall, precision, F1 and ROC-AUC by version.">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={modelVersions}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="version" tick={axisTick} />
              <YAxis domain={[0, 100]} tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="accuracy" fill="#6D5BFF" radius={[10, 10, 0, 0]} name="Accuracy" />
              <Bar dataKey="rocAuc" fill="#00D4FF" radius={[10, 10, 0, 0]} name="ROC-AUC" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ReadoutCard title="Governance Summary" subtitle="Why the decision is not one metric." items={[
          "Logistic Regression is the technical ROC-AUC champion by a very small margin.",
          "Logistic Regression is the business champion because recall is much higher.",
          "Stacking was rejected because training cost and complexity are not justified.",
          "All model comparison belongs in registry and performance pages, not normal prediction flows."
        ]} icon={ShieldCheck} />
      </div>
    </MlopsPage>
  );
}

function MlopsPage({
  eyebrow,
  title,
  subtitle,
  action,
  children
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="overflow-hidden rounded-[30px] border border-white/80 bg-gradient-to-br from-white via-[#f7fbff] to-[#f2efff] p-6 shadow-soft dark:border-white/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Badge tone="primary">{eyebrow}</Badge>
            <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight tracking-normal text-ink dark:text-white md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted md:text-base">{subtitle}</p>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link to="/model-performance"><Gauge className="h-4 w-4" /> Model Performance</Link></Button>
            {action}
          </div>
        </div>
        <MlopsRouteTabs />
      </div>
      {children}
    </div>
  );
}

function MlopsRouteTabs() {
  const location = useLocation();

  return (
    <div className="mt-6 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {mlopsTabs.map((tab) => {
          const active = location.pathname === tab.href || (tab.href !== "/mlops" && location.pathname.startsWith(`${tab.href}/`));
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold transition",
                active ? "bg-primary text-white shadow-soft" : "bg-white/80 text-muted hover:bg-white hover:text-primary dark:bg-white/5 dark:hover:bg-white/10"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ProductionHero() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-6 bg-gradient-to-br from-primary via-secondary to-[#00D4FF] p-6 text-white xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge className="bg-white/20 text-white" tone="primary">Governed Scoring Artifact</Badge>
          <h2 className="mt-4 text-4xl font-extrabold">{productionModel.name} {productionModel.version}</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/78">Current scoring is online and monitored through registry, drift checks, confidence monitoring, recall review and data quality gates.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <MiniStat label="Status" value={productionModel.status} inverted />
            <MiniStat label="Health" value={productionModel.health} inverted />
            <MiniStat label="ROC-AUC" value={productionModel.averageConfidence} inverted />
            <MiniStat label="Latency" value={productionModel.servingLatency} inverted />
          </div>
        </div>
        <div className="rounded-3xl bg-white/14 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-white/75">Predictions served</p>
              <p className="mt-2 text-3xl font-extrabold">{productionModel.predictionsServed}</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20">
              <BrainCircuit className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-6 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionVolumeTrend}>
                <Area type="monotone" dataKey="confidence" stroke="#fff" fill="#fff" fillOpacity={0.22} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MlopsMetricCard({ metric }: { metric: MlopsMetric }) {
  const Icon = metricIcons[metric.label] ?? BarChart3;
  return (
    <Card className="transition hover:-translate-y-1 hover:border-primary/30">
      <div className="flex items-start justify-between gap-4">
        <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", toneSurface(metric.tone), toneText(metric.tone))}>
          <Icon className="h-5 w-5" />
        </div>
        <Badge tone={badgeTone(metric.tone)}>{metric.tone === "success" ? "Healthy" : metric.tone === "warning" ? "Watch" : "Live"}</Badge>
      </div>
      <p className="mt-5 text-sm font-semibold text-muted">{metric.label}</p>
      <p className="mt-2 text-3xl font-extrabold">{metric.value}</p>
      <p className="mt-2 text-xs font-bold leading-5 text-muted">{metric.detail}</p>
    </Card>
  );
}

function HealthScoreCard({ score }: { score: { label: string; value: number; status: string; tone: MlopsTone } }) {
  return (
    <Card className="text-center">
      <div className={cn("mx-auto grid h-20 w-20 place-items-center rounded-full border-8", score.value >= 90 ? "border-green-100 bg-green-50 text-success" : "border-amber-100 bg-amber-50 text-warning")}>
        <span className="text-xl font-extrabold">{score.value}%</span>
      </div>
      <p className="mt-4 font-extrabold">{score.label}</p>
      <Badge className="mt-2" tone={badgeTone(score.tone)}>{score.status}</Badge>
    </Card>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button variant="ghost" size="icon"><BarChart3 className="h-4 w-4" /></Button>
      </CardHeader>
      {children}
    </Card>
  );
}

function MiniStat({ label, value, inverted = false }: { label: string; value: string; inverted?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-4", inverted ? "bg-white/14 text-white" : "bg-slate-50 dark:bg-white/5")}>
      <p className={cn("text-xs font-bold uppercase", inverted ? "text-white/70" : "text-muted")}>{label}</p>
      <p className="mt-1 text-base font-extrabold">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="mt-2 break-words font-extrabold">{value}</p>
    </div>
  );
}

function ModelVersionsTable() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Model Versions</CardTitle>
          <CardDescription>Model candidates with deployment, ROC-AUC, recall and metric history.</CardDescription>
        </div>
        <Badge tone="success">Production: v2.0</Badge>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="text-muted">
            <tr>{["Model", "Version", "Created", "Status", "Performance", "Deployment", "Accuracy", "Recall", "Precision", "F1", "ROC-AUC", "Training Date"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
          </thead>
          <tbody>
            {modelVersions.map((model) => (
              <tr key={model.version} className="border-t border-slate-100 dark:border-white/10">
                <td className="px-4 py-4 font-extrabold">{model.name}</td>
                <td className="px-4 py-4">{model.version}</td>
                <td className="px-4 py-4 text-muted">{model.createdDate}</td>
                <td className="px-4 py-4"><SeverityBadge value={model.status} /></td>
                <td className="px-4 py-4 font-bold">{model.performance}</td>
                <td className="px-4 py-4"><SeverityBadge value={model.deploymentStatus} /></td>
                <td className="px-4 py-4">{model.accuracy}%</td>
                <td className="px-4 py-4">{model.recall}%</td>
                <td className="px-4 py-4">{model.precision}%</td>
                <td className="px-4 py-4">{model.f1}%</td>
                <td className="px-4 py-4">{model.rocAuc}%</td>
                <td className="px-4 py-4 text-muted">{model.trainingDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function FeatureMonitoringTable() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Feature Monitoring</CardTitle>
          <CardDescription>Distribution, mean, median, variance and current vs training snapshots.</CardDescription>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-muted">
            <tr>{["Feature", "Mean", "Median", "Variance", "Training", "Current", "Drift Score", "Status"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
          </thead>
          <tbody>
            {featureMonitoring.map((feature) => (
              <tr key={feature.feature} className="border-t border-slate-100 dark:border-white/10">
                <td className="px-4 py-4 font-extrabold">{feature.feature}</td>
                <td className="px-4 py-4">{feature.mean}</td>
                <td className="px-4 py-4">{feature.median}</td>
                <td className="px-4 py-4">{feature.variance}</td>
                <td className="px-4 py-4 text-muted">{feature.training}</td>
                <td className="px-4 py-4 text-muted">{feature.current}</td>
                <td className="px-4 py-4 font-bold">{feature.driftScore.toFixed(2)}</td>
                <td className="px-4 py-4"><SeverityBadge value={feature.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AlertCenter() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Alert Center</CardTitle>
          <CardDescription>Drift, data, prediction and performance alerts.</CardDescription>
        </div>
        <AlertTriangle className="h-6 w-6 text-warning" />
      </CardHeader>
      <div className="space-y-3">
        {alertCenter.map((alert) => (
          <div key={alert.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold">{alert.title}</p>
                <p className="mt-1 text-sm text-muted">{alert.type} - Owner: {alert.owner}</p>
              </div>
              <SeverityBadge value={alert.severity} />
            </div>
            <p className="mt-3 text-sm font-bold text-primary">{alert.action}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DriftAlerts() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Drift Alerts</CardTitle>
          <CardDescription>Color-coded drift severity and recommended review items.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {driftAlerts.map((alert) => (
          <div key={alert.title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-extrabold">{alert.title}</p>
              <SeverityBadge value={alert.severity} />
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{alert.detail}</p>
            <p className="mt-2 text-xs font-bold text-muted">{alert.time}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QualityChecksPanel({ compact = false }: { compact?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Quality Checks</CardTitle>
          <CardDescription>Column health, feature health, consistency and prediction readiness.</CardDescription>
        </div>
      </CardHeader>
      <div className={cn("grid gap-3", compact ? "md:grid-cols-2" : "md:grid-cols-4")}>
        {qualityChecks.map((check) => (
          <div key={check.check} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-extrabold">{check.check}</p>
              <Badge tone={check.score >= 95 ? "success" : "warning"}>{check.score}%</Badge>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <span className="block h-full rounded-full bg-success" style={{ width: `${check.score}%` }} />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{check.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PredictionDistributionCard() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Prediction Distribution</CardTitle>
          <CardDescription>Retain versus churn classification share.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-4">
        {predictionDistribution.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-extrabold">{item.label}</span>
              <span className="font-bold text-muted">{item.value}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <span className="block h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RetrainingHistoryTable() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Retraining History</CardTitle>
          <CardDescription>All previous training events and outcomes.</CardDescription>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-muted">
            <tr>{["Run", "Status", "Dataset", "Duration", "Accuracy", "Date"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
          </thead>
          <tbody>
            {retrainingHistory.map((run) => (
              <tr key={run.run} className="border-t border-slate-100 dark:border-white/10">
                <td className="px-4 py-4 font-extrabold">{run.run}</td>
                <td className="px-4 py-4"><SeverityBadge value={run.status} /></td>
                <td className="px-4 py-4 text-muted">{run.dataset}</td>
                <td className="px-4 py-4">{run.duration}</td>
                <td className="px-4 py-4">{run.accuracy}</td>
                <td className="px-4 py-4 text-muted">{run.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReadoutCard({ title, subtitle, items, icon: Icon }: { title: string; subtitle: string; items: string[]; icon: LucideIcon }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
            <p className="text-sm font-semibold leading-6">{item}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ExplainabilityHealth() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Model Explainability Health</CardTitle>
          <CardDescription>SHAP status, explanation coverage and explanation success rate.</CardDescription>
        </div>
        <Button asChild variant="outline"><Link to="/shap"><BrainCircuit className="h-4 w-4" /> Open Explainability</Link></Button>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-3">
        {explainabilityHealth.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold text-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-extrabold">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ExportsPanel() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Exports</CardTitle>
          <CardDescription>Production AI governance reports.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-3 md:grid-cols-5">
        {mlopsExports.map((item) => (
          <Button key={item} variant="outline"><Download className="h-4 w-4" /> {item}</Button>
        ))}
      </div>
    </Card>
  );
}

function SeverityBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone: BadgeTone =
    normalized.includes("critical") ||
    normalized.includes("failed") ||
    normalized.includes("high") ? "danger" :
      normalized.includes("medium") ||
      normalized.includes("watch") ||
      normalized.includes("scheduled") ||
      normalized.includes("running") ||
      normalized.includes("ready") ? "warning" :
        normalized.includes("low") ||
        normalized.includes("completed") ||
        normalized.includes("production") ||
        normalized.includes("deployed") ||
        normalized.includes("online") ||
        normalized.includes("success") ? "success" : "neutral";

  return <Badge tone={tone}>{value}</Badge>;
}

function badgeTone(tone: MlopsTone): BadgeTone {
  if (tone === "success") return "success";
  if (tone === "warning") return "warning";
  if (tone === "danger") return "danger";
  if (tone === "primary") return "primary";
  return "neutral";
}

function toneSurface(tone: MlopsTone) {
  return tone === "success" ? "bg-green-50 dark:bg-green-950/30" :
    tone === "warning" ? "bg-amber-50 dark:bg-amber-950/30" :
      tone === "danger" ? "bg-red-50 dark:bg-red-950/30" :
        tone === "primary" ? "bg-[#f2efff] dark:bg-primary/20" : "bg-slate-100 dark:bg-white/10";
}

function toneText(tone: MlopsTone) {
  return tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning" :
      tone === "danger" ? "text-danger" :
        tone === "primary" ? "text-primary" : "text-muted";
}

function correlationColor(value: number) {
  const intensity = Math.min(0.95, Math.max(0.18, Math.abs(value)));
  return value >= 0 ? `rgba(109, 91, 255, ${intensity})` : `rgba(34, 197, 94, ${intensity})`;
}
