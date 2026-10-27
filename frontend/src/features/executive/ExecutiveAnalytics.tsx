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
  YAxis,
  ZAxis
} from "recharts";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Gauge,
  GitBranch,
  LineChart as LineChartIcon,
  Presentation,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useToast } from "../../components/common/ToastProvider";
import { downloadCsv, downloadTextReport } from "../../lib/exportUtils";
import { cn } from "../../lib/utils";
import {
  churnDrivers,
  churnForecast,
  churnTrend,
  cohortHeatmap,
  customerValueMatrix,
  executiveInsights,
  executiveOverviewMetrics,
  executiveReports,
  executiveScorecard,
  forecastDashboard,
  forecastSeries,
  journeyFlows,
  journeyStages,
  ltvBySegment,
  ltvScatter,
  priorityCustomers,
  quarterlyCohorts,
  revenueByContract,
  revenueByCustomerType,
  revenueBySegment,
  revenueTrend,
  topOpportunities,
  topRisks,
  type ExecutiveMetric,
  type ExecutiveTone
} from "./executiveData";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

const chartTooltip = {
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  boxShadow: "0 20px 45px rgba(17, 24, 39, 0.08)"
};

const axisTick = { fill: "#64748B", fontSize: 11, fontWeight: 700 };
const gridStroke = "#EEF2FF";

const executiveTabs = [
  { label: "Overview", href: "/executive", icon: Building2 },
  { label: "Revenue", href: "/executive/revenue", icon: CircleDollarSign },
  { label: "Churn", href: "/executive/churn", icon: Activity },
  { label: "Cohorts", href: "/executive/cohorts", icon: CalendarDays },
  { label: "Customer LTV", href: "/executive/customer-ltv", icon: Users },
  { label: "Forecasting", href: "/executive/forecasting", icon: LineChartIcon },
  { label: "Journey", href: "/executive/journey", icon: GitBranch }
];

function exportRevenue() {
  return downloadCsv("revenue_intelligence", [
    ...revenueTrend.map((row) => ({ section: "trend", ...row })),
    ...revenueBySegment.map((row) => ({ section: "segment", ...row })),
    ...revenueByContract.map((row) => ({ section: "contract", ...row })),
    ...revenueByCustomerType.map((row) => ({ section: "customer_type", ...row }))
  ]);
}

function exportCohorts() {
  return downloadCsv("cohort_retention", [
    ...cohortHeatmap.map((row) => ({ section: "monthly_cohort", cohort: row.cohort, retentionByMonth: row.values.join("|") })),
    ...quarterlyCohorts.map((row) => ({ section: "quarterly_cohort", ...row }))
  ]);
}

function exportForecastSummary() {
  return downloadTextReport("forecast_summary", [
    "CHURNIQ AI Forecast Summary",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "Forecast Dashboard",
    ...forecastDashboard.map((item) => `${item.metric}: current ${item.current}, forecast ${item.forecast}, confidence ${item.confidence}, growth ${item.growth}`),
    "",
    "Revenue Forecast Series",
    ...forecastSeries.map((item) => `${item.month}: expected ${item.revenue}, low ${item.low}, high ${item.high}`)
  ]);
}

const metricIcons: Record<string, LucideIcon> = {
  Revenue: CircleDollarSign,
  "Revenue At Risk": TrendingUp,
  "Revenue Saved": ShieldCheck,
  "Customer Growth": Users,
  "Retention Rate": CheckCircle2,
  "Churn Rate": TrendingDown,
  "Model ROC-AUC": Gauge,
  "Campaign ROI": Target,
  MRR: CircleDollarSign,
  ARR: BarChart3,
  "Customer Lifetime Value": Users,
  "Average Revenue Per Customer": CircleDollarSign,
  "Customer Acquisition Cost": Target,
  "Revenue Recovery Rate": ShieldCheck,
  "Net Revenue Retention": TrendingUp
};

export function ExecutiveOverviewPage() {
  return (
    <ExecutivePage
      eyebrow="Executive Analytics"
      title="CEO intelligence for revenue, risk, retention and growth."
      subtitle="Answer what is happening, why it is happening, what will happen next and what to do."
      action={<Button asChild><Link to="/executive/forecasting"><LineChartIcon className="h-4 w-4" /> Open Forecast</Link></Button>}
    >
      <ExecutiveHero />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {executiveOverviewMetrics.map((metric) => (
          <ExecutiveMetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <ExecutiveSection
        eyebrow="Executive Scorecard"
        title="Board-ready performance snapshot"
        description="Core SaaS metrics for monthly revenue, retention, recovery, acquisition cost and customer value."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {executiveScorecard.map((metric) => (
            <ExecutiveMetricCard key={metric.label} metric={metric} compact />
          ))}
        </div>
      </ExecutiveSection>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Revenue, Risk and Recovery" description="Revenue growth, exposed revenue and recovered revenue in one executive view.">
          <ResponsiveContainer width="100%" height={330}>
            <ComposedChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Area type="monotone" dataKey="revenue" fill="#6D5BFF" fillOpacity={0.18} stroke="#6D5BFF" strokeWidth={3} name="Revenue M" />
              <Bar dataKey="recovered" fill="#22C55E" radius={[10, 10, 0, 0]} name="Recovered M" />
              <Line type="monotone" dataKey="atRisk" stroke="#EF4444" strokeWidth={3} name="At risk M" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI Executive Insights</CardTitle>
              <CardDescription>Plain-language business intelligence generated from revenue, churn, retention and customer value.</CardDescription>
            </div>
            <Badge tone="primary">AI</Badge>
          </CardHeader>
          <div className="space-y-3">
            {executiveInsights.map((insight, index) => (
              <motion.div
                key={insight}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2efff] text-xs font-extrabold text-primary">{index + 1}</span>
                <p className="text-sm font-bold leading-6">{insight}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top Risks</CardTitle>
              <CardDescription>What could reduce revenue, retention or growth.</CardDescription>
            </div>
            <Badge tone="danger">Watch list</Badge>
          </CardHeader>
          <div className="space-y-3">
            {topRisks.map((risk) => (
              <div key={risk.label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <div>
                  <p className="font-extrabold">{risk.label}</p>
                  <p className="mt-1 text-sm text-muted">{risk.value}</p>
                </div>
                <Badge tone={risk.severity === "Critical" ? "danger" : risk.severity === "High" ? "warning" : "primary"}>{risk.severity}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top Opportunities</CardTitle>
              <CardDescription>Highest-confidence opportunities to save or grow revenue.</CardDescription>
            </div>
            <Badge tone="success">Actionable</Badge>
          </CardHeader>
          <div className="space-y-3">
            {topOpportunities.map((opportunity) => (
              <div key={opportunity.label} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-extrabold">{opportunity.label}</p>
                    <p className="mt-1 text-sm text-muted">{opportunity.value}</p>
                  </div>
                  <Badge tone={opportunity.confidence >= 90 ? "success" : "primary"}>{opportunity.confidence}% confidence</Badge>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${opportunity.confidence}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <PriorityEngine />
      <ExecutiveReports />
    </ExecutivePage>
  );
}

export function ExecutiveRevenuePage() {
  const { toast } = useToast();
  const handleExport = () => {
    const filename = exportRevenue();
    toast({ tone: "success", title: "Revenue export ready", description: filename });
  };

  return (
    <ExecutivePage
      eyebrow="Revenue Intelligence"
      title="Revenue overview, contribution, risk and recovery."
      subtitle="Understand revenue by segment, contract, customer type, at-risk exposure, recovered revenue and forecasted revenue."
      action={<Button variant="outline" onClick={handleExport}><Download className="h-4 w-4" /> Export Revenue</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "MRR", value: "$1.20M", delta: "+9.8%", tone: "success" },
          { label: "Revenue At Risk", value: "$45,230", delta: "+6.0%", tone: "danger" },
          { label: "Recovered Revenue", value: "$31,500", delta: "+18.4%", tone: "success" },
          { label: "Forecasted Revenue", value: "$1.39M", delta: "+15.8%", tone: "primary" }
        ].map((metric) => <ExecutiveMetricCard key={metric.label} metric={metric as ExecutiveMetric} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title="Revenue Trend" description="Actual revenue, forecast and recovered revenue.">
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="executiveRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6D5BFF" stopOpacity={0.36} />
                  <stop offset="95%" stopColor="#6D5BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Area type="monotone" dataKey="revenue" stroke="#6D5BFF" fill="url(#executiveRevenue)" strokeWidth={3} name="Revenue M" />
              <Area type="monotone" dataKey="forecast" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.12} strokeWidth={2} name="Forecast M" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Treemap-style contribution by customer type.</CardDescription>
            </div>
            <Badge tone="primary">$1.2M</Badge>
          </CardHeader>
          <RevenueTreemap />
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Revenue By Segment" description="Segment contribution, exposure and recovery.">
          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={revenueBySegment}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="revenue" stackId="a" fill="#6D5BFF" radius={[12, 12, 0, 0]} name="Revenue" />
              <Bar dataKey="atRisk" stackId="a" fill="#EF4444" name="At risk" />
              <Bar dataKey="recovered" stackId="a" fill="#22C55E" name="Recovered" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Revenue By Contract" description="Stable revenue, revenue at risk and recovered revenue by contract.">
          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={revenueByContract}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="stable" stackId="contract" fill="#6D5BFF" radius={[12, 12, 0, 0]} name="Stable" />
              <Bar dataKey="atRisk" stackId="contract" fill="#EF4444" name="At risk" />
              <Bar dataKey="recovered" stackId="contract" fill="#22C55E" name="Recovered" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </ExecutivePage>
  );
}

export function ExecutiveChurnPage() {
  return (
    <ExecutivePage
      eyebrow="Churn Intelligence"
      title="Current churn, forecasted churn and business impact."
      subtitle="Track historical churn, future churn, churn drivers, segment churn and expected revenue loss."
      action={<Button asChild variant="outline"><Link to="/shap/business-insights"><BrainCircuit className="h-4 w-4" /> Explain Drivers</Link></Button>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Current Churn Rate", value: "26.5%", delta: "-3.1%", tone: "warning" },
          { label: "Forecasted Churn", value: "21.5%", delta: "Dec forecast", tone: "success" },
          { label: "Revenue Impact", value: "$45,230", delta: "+6.0%", tone: "danger" }
        ].map((metric) => <ExecutiveMetricCard key={metric.label} metric={metric as ExecutiveMetric} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Historical and Forecasted Churn" description="Observed churn rate compared with forward projection.">
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={churnTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Line type="monotone" dataKey="churn" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: "#EF4444" }} name="Current churn" />
              <Line type="monotone" dataKey="forecast" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: "#22C55E" }} name="Forecasted churn" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Churn Forecasting</CardTitle>
              <CardDescription>Expected churn, revenue loss and retention opportunities.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {churnForecast.map((forecast) => (
              <div key={forecast.period} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-extrabold">{forecast.period}</p>
                  <Badge tone="warning">{forecast.expectedChurn}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <MiniStat label="Revenue Loss" value={forecast.expectedLoss} />
                  <MiniStat label="Opportunities" value={forecast.opportunities} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Churn Drivers</CardTitle>
              <CardDescription>Why churn is happening, translated for executives.</CardDescription>
            </div>
            <Badge tone="primary">Top 5</Badge>
          </CardHeader>
          <div className="space-y-4">
            {churnDrivers.map((driver) => (
              <div key={driver.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-extrabold">{driver.name}</span>
                  <span className="text-muted">{driver.impact}% impact - {driver.affected} customers</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-100 dark:bg-white/10">
                  <div className="h-full rounded-full bg-danger" style={{ width: `${driver.impact * 2.2}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <ChartCard title="Revenue Loss Over Time" description="Churn-driven revenue loss trend.">
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={churnTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Area type="monotone" dataKey="revenueLoss" stroke="#EF4444" fill="#EF4444" fillOpacity={0.18} strokeWidth={3} name="Revenue loss" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </ExecutivePage>
  );
}

export function ExecutiveCohortsPage() {
  const { toast } = useToast();
  const handleExport = () => {
    const filename = exportCohorts();
    toast({ tone: "success", title: "Cohort export ready", description: filename });
  };

  return (
    <ExecutivePage
      eyebrow="Cohort Analysis"
      title="Retention heatmaps across monthly, quarterly and annual cohorts."
      subtitle="See how customer cohorts retain over time and where retention decay appears first."
      action={<Button variant="outline" onClick={handleExport}><FileSpreadsheet className="h-4 w-4" /> Export Cohorts</Button>}
    >
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Monthly Cohort Retention Heatmap</CardTitle>
            <CardDescription>Rows are customer cohorts, columns are months since acquisition, values are retention percentage.</CardDescription>
          </div>
          <Badge tone="primary">Red to green</Badge>
        </CardHeader>
        <CohortHeatmap />
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <ChartCard title="Quarterly Cohorts" description="Customers, retained share and revenue by quarter.">
          <ResponsiveContainer width="100%" height={330}>
            <ComposedChart data={quarterlyCohorts}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="cohort" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="customers" fill="#6D5BFF" radius={[12, 12, 0, 0]} name="Customers" />
              <Line type="monotone" dataKey="retention" stroke="#22C55E" strokeWidth={3} name="Retention" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Cohort Executive Readout</CardTitle>
              <CardDescription>What the cohort view says in business language.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {[
              "Q4 2025 customers have the strongest retention profile at 83%.",
              "Early retention drops appear between month 2 and month 4.",
              "New customer onboarding is the fastest lever for first-year churn.",
              "Cohort revenue grows when support is adopted in the first billing cycle."
            ].map((text, index) => (
              <div key={text} className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f2efff] text-xs font-extrabold text-primary">{index + 1}</span>
                <p className="text-sm font-bold leading-6">{text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ExecutivePage>
  );
}

export function ExecutiveLtvPage() {
  return (
    <ExecutivePage
      eyebrow="Customer Lifetime Value"
      title="Understand customer value by segment, contract and risk."
      subtitle="Analyze average CLV, high-value customers, value distribution and risk-adjusted customer priority."
      action={<Button asChild variant="outline"><Link to="/customers"><Users className="h-4 w-4" /> Open Customers</Link></Button>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Average CLV", value: "$4,820", delta: "+7.4%", tone: "primary" },
          { label: "High Value Customers", value: "713", delta: "$2.4M ARR", tone: "success" },
          { label: "CLV At Risk", value: "$640K", delta: "High risk", tone: "danger" },
          { label: "Expansion Potential", value: "$188K", delta: "+12%", tone: "success" }
        ].map((metric) => <ExecutiveMetricCard key={metric.label} metric={metric as ExecutiveMetric} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="CLV By Segment" description="Average customer lifetime value and risk by segment.">
          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={ltvBySegment}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="clv" fill="#6D5BFF" radius={[12, 12, 0, 0]} name="CLV" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Customer Value Scatter" description="Customer value versus churn risk with priority sizing.">
          <ResponsiveContainer width="100%" height={330}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" dataKey="value" name="CLV" tick={axisTick} />
              <YAxis type="number" dataKey="risk" name="Risk" tick={axisTick} />
              <ZAxis type="number" dataKey="priority" range={[80, 420]} />
              <Tooltip contentStyle={chartTooltip} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={ltvScatter} fill="#6D5BFF" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Customer Value Matrix</CardTitle>
            <CardDescription>Quadrants combine customer value and customer risk into executive actions.</CardDescription>
          </div>
          <Badge tone="primary">4 quadrants</Badge>
        </CardHeader>
        <ValueMatrix />
      </Card>

      <PriorityEngine />
    </ExecutivePage>
  );
}

export function ExecutiveForecastingPage() {
  const { toast } = useToast();
  const handleExport = () => {
    const filename = exportForecastSummary();
    toast({ tone: "success", title: "Forecast summary exported", description: filename });
  };

  return (
    <ExecutivePage
      eyebrow="Forecasting Center"
      title="Forecast revenue, churn, retention and growth."
      subtitle="Executive forecast workspace with current value, forecast value, confidence intervals, growth and risk factors."
      action={<Button variant="outline" onClick={handleExport}><Presentation className="h-4 w-4" /> Export Summary</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {forecastDashboard.map((forecast) => (
          <Card key={forecast.metric}>
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                <LineChartIcon className="h-5 w-5" />
              </div>
              <Badge tone={forecast.growth.startsWith("-") ? "success" : "primary"}>{forecast.growth}</Badge>
            </div>
            <p className="mt-5 text-sm font-semibold text-muted">{forecast.metric}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MiniStat label="Current" value={forecast.current} />
              <MiniStat label="Forecast" value={forecast.forecast} />
            </div>
            <p className="mt-4 text-sm font-bold text-muted">Confidence {forecast.confidence}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {forecast.riskFactors.map((factor) => <Badge key={factor} tone="warning">{factor}</Badge>)}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard title="Revenue Forecast With Confidence Range" description="Low, expected and high revenue scenarios.">
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={forecastSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Area type="monotone" dataKey="high" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.1} name="High" />
              <Area type="monotone" dataKey="low" stroke="#CBD5E1" fill="#CBD5E1" fillOpacity={0.18} name="Low" />
              <Line type="monotone" dataKey="revenue" stroke="#6D5BFF" strokeWidth={3} name="Expected revenue" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Risk Factors</CardTitle>
              <CardDescription>What could change the forecast.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {["High-value churn risk", "Support team capacity", "Month-to-month contract mix", "New customer onboarding", "Campaign execution speed"].map((factor, index) => (
              <div key={factor} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="font-extrabold">{factor}</p>
                <Badge tone={index < 2 ? "danger" : index < 4 ? "warning" : "primary"}>{index < 2 ? "High" : index < 4 ? "Medium" : "Tracked"}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ExecutivePage>
  );
}

export function ExecutiveJourneyPage() {
  return (
    <ExecutivePage
      eyebrow="Customer Journey Analytics"
      title="Journey flow, drop-off points and retention opportunities."
      subtitle="Track movement from acquisition to activation, engagement, retention, loyalty and churn."
      action={<Button asChild variant="outline"><Link to="/retention"><ShieldCheck className="h-4 w-4" /> Open Retention</Link></Button>}
    >
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {journeyStages.map((stage) => (
          <Card key={stage.stage}>
            <p className="text-sm font-semibold text-muted">{stage.stage}</p>
            <p className="mt-2 text-3xl font-extrabold">{stage.customers.toLocaleString()}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-primary" style={{ width: `${stage.conversion}%` }} />
            </div>
            <p className="mt-3 text-xs font-bold text-muted">{stage.conversion}% conversion - {stage.risk}% risk</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Customer Journey Flow</CardTitle>
              <CardDescription>Sankey-style movement across lifecycle stages with risk zones highlighted.</CardDescription>
            </div>
            <Badge tone="primary">Flow</Badge>
          </CardHeader>
          <JourneySankey />
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Drop-Off Points</CardTitle>
              <CardDescription>Where customers become risky and what to do.</CardDescription>
            </div>
            <Badge tone="danger">Risk zones</Badge>
          </CardHeader>
          <div className="space-y-3">
            {[
              ["Engagement to Churn", "780 customers", "Launch onboarding and support education."],
              ["Retention to Churn", "1,087 customers", "Prioritize save plays and contract upgrades."],
              ["Activation drop-off", "763 customers", "Improve first-bill and product activation."]
            ].map(([title, value, action]) => (
              <div key={title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-extrabold">{title}</p>
                  <Badge tone="warning">{value}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted">{action}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Customer Value Matrix</CardTitle>
            <CardDescription>Journey actions prioritized by customer value and customer risk.</CardDescription>
          </div>
        </CardHeader>
        <ValueMatrix />
      </Card>
    </ExecutivePage>
  );
}

function ExecutiveHero() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-white via-[#f7f5ff] to-[#effcff] p-0 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.9fr] lg:p-8">
        <div>
          <Badge tone="primary">Executive Business Intelligence</Badge>
          <h2 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-normal text-ink dark:text-white md:text-4xl">
            Revenue, churn, retention and forecasts in one executive cockpit.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Executives can understand what is happening, why it is happening, what happens next, and which action protects the most revenue.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              ["What is happening?", "Revenue risk rose 6%."],
              ["Why?", "Contract and support gaps."],
              ["What next?", "$1.39M forecasted MRR."],
              ["What to do?", "Prioritize support upgrade."]
            ].map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-white/80 bg-white/82 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-extrabold uppercase text-primary">{question}</p>
                <p className="mt-2 text-sm font-bold leading-6">{answer}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-white/78 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-muted">Executive forecast</p>
              <h3 className="mt-2 text-2xl font-extrabold">$1.39M MRR</h3>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white shadow-soft">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastSeries}>
                <Tooltip contentStyle={chartTooltip} />
                <Area type="monotone" dataKey="revenue" stroke="#6D5BFF" fill="#6D5BFF" fillOpacity={0.22} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ExecutivePage({
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
  const location = useLocation();

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <Badge tone="primary">{eyebrow}</Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-normal text-ink dark:text-white md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {action}
          <Button asChild variant="secondary"><Link to="/reports"><FileText className="h-4 w-4" /> Reports</Link></Button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
        {executiveTabs.map((tab) => (
          <Link
            key={tab.href}
            to={tab.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-muted transition hover:bg-[#f6f4ff] hover:text-primary",
              location.pathname === tab.href && "bg-[#f2efff] text-primary"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}

function ExecutiveSection({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <Badge tone="primary">{eyebrow}</Badge>
        <h2 className="mt-3 text-2xl font-extrabold tracking-normal text-ink dark:text-white">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ExecutiveMetricCard({ metric, compact = false }: { metric: ExecutiveMetric; compact?: boolean }) {
  const Icon = metricIcons[metric.label] ?? BarChart3;
  return (
    <Card className="transition hover:-translate-y-1 hover:border-primary/30">
      <div className="flex items-start justify-between gap-4">
        <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", toneSurface(metric.tone), toneText(metric.tone))}>
          <Icon className="h-5 w-5" />
        </div>
        <Badge tone={badgeTone(metric.tone)}>{metric.delta}</Badge>
      </div>
      <p className="mt-5 text-sm font-semibold text-muted">{metric.label}</p>
      <p className={cn("mt-2 font-extrabold", compact ? "text-2xl" : "text-3xl")}>{metric.value}</p>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="mt-1 text-base font-extrabold">{value}</p>
    </div>
  );
}

function RevenueTreemap() {
  const total = revenueByCustomerType.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="grid h-[330px] grid-cols-12 grid-rows-6 gap-3">
      {revenueByCustomerType.map((item, index) => {
        const area = item.value / total;
        const className = index === 0 ? "col-span-7 row-span-6" : index === 1 ? "col-span-5 row-span-3" : "col-span-5 row-span-3";
        return (
          <div key={item.name} className={cn("rounded-3xl p-5 text-white shadow-sm", className)} style={{ background: `linear-gradient(135deg, ${item.color}, #111827)` }}>
            <p className="text-sm font-bold text-white/80">{item.name}</p>
            <p className="mt-2 text-2xl font-extrabold">{formatCurrency(item.value)}</p>
            <p className="mt-1 text-xs font-bold text-white/70">{Math.round(area * 100)}% contribution</p>
          </div>
        );
      })}
    </div>
  );
}

function CohortHeatmap() {
  const months = ["M0", "M1", "M2", "M3", "M4", "M5"];
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[120px_repeat(6,1fr)] gap-2 text-xs font-extrabold uppercase text-muted">
          <span>Cohort</span>
          {months.map((month) => <span key={month}>{month}</span>)}
        </div>
        <div className="mt-3 grid gap-2">
          {cohortHeatmap.map((row) => (
            <div key={row.cohort} className="grid grid-cols-[120px_repeat(6,1fr)] gap-2">
              <span className="flex items-center text-sm font-extrabold">{row.cohort}</span>
              {row.values.map((value, index) => (
                <div key={`${row.cohort}-${index}`} className="rounded-2xl p-4 text-center text-sm font-extrabold" style={{ background: cohortColor(value), color: value === 0 ? "#94A3B8" : value >= 85 ? "#166534" : value >= 75 ? "#92400E" : "#991B1B" }}>
                  {value ? `${value}%` : "-"}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ValueMatrix() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {customerValueMatrix.map((quadrant, index) => (
        <div
          key={quadrant.quadrant}
          className={cn(
            "rounded-3xl border p-5",
            index === 1 ? "border-red-100 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20" :
              index === 0 ? "border-green-100 bg-green-50 dark:border-green-900/40 dark:bg-green-950/20" :
                "border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-extrabold">{quadrant.quadrant}</p>
              <p className="mt-1 text-sm text-muted">{quadrant.customers.toLocaleString()} customers - {quadrant.revenue}</p>
            </div>
            <Badge tone={index === 1 ? "danger" : index === 0 ? "success" : "primary"}>{index === 1 ? "P1" : index === 0 ? "Expand" : "Automate"}</Badge>
          </div>
          <p className="mt-4 text-sm font-bold leading-6">{quadrant.action}</p>
        </div>
      ))}
    </div>
  );
}

function JourneySankey() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-6">
        {journeyStages.map((stage) => (
          <div key={stage.stage} className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-white/5">
            <p className="text-xs font-bold uppercase text-muted">{stage.stage}</p>
            <p className="mt-2 text-xl font-extrabold">{stage.customers.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3">
        {journeyFlows.map((flow) => (
          <div key={`${flow.from}-${flow.to}`} className="grid gap-3 md:grid-cols-[130px_1fr_130px] md:items-center">
            <p className="text-sm font-extrabold">{flow.from}</p>
            <div className="relative h-10 rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className={cn("absolute left-0 top-0 h-10 rounded-full", flow.type === "risk" ? "bg-danger" : flow.type === "warning" ? "bg-warning" : "bg-primary")}
                style={{ width: `${Math.min(100, (flow.value / 7043) * 100)}%` }}
              />
              <span className="absolute inset-0 grid place-items-center text-xs font-extrabold text-ink dark:text-white">{flow.value.toLocaleString()} customers</span>
            </div>
            <p className="text-sm font-extrabold text-muted">{flow.to}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriorityEngine() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Priority Engine</CardTitle>
          <CardDescription>Customer priority score based on revenue, churn risk, retention probability and strategic importance.</CardDescription>
        </div>
        <Badge tone="primary">AI ranking</Badge>
      </CardHeader>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="text-muted">
            <tr>{["Customer", "Revenue", "Risk", "Retention Probability", "Strategic Importance", "Priority Score", "Action"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
          </thead>
          <tbody>
            {priorityCustomers.map((customer) => (
              <tr key={customer.customer} className="border-t border-slate-100 dark:border-white/10">
                <td className="px-4 py-4 font-extrabold">{customer.customer}</td>
                <td className="px-4 py-4">{formatCurrency(customer.revenue)}</td>
                <td className="px-4 py-4"><Badge tone={customer.risk >= 70 ? "danger" : customer.risk >= 40 ? "warning" : "success"}>{customer.risk}%</Badge></td>
                <td className="px-4 py-4">{customer.retentionProbability}%</td>
                <td className="px-4 py-4">{customer.strategicImportance}%</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-white/10">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${customer.score}%` }} />
                    </div>
                    <span className="font-extrabold">{customer.score}</span>
                  </div>
                </td>
                <td className="px-4 py-4"><Button variant="secondary" size="sm">Prioritize</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ExecutiveReports() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Executive Reporting</CardTitle>
          <CardDescription>Premium reports for CEO, revenue, risk, retention and forecasting workflows.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline"><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
          <Button variant="outline"><Presentation className="h-4 w-4" /> PowerPoint</Button>
          <Button><Download className="h-4 w-4" /> PDF</Button>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {executiveReports.map((report) => (
          <div key={report.title} className="rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-primary shadow-sm dark:bg-slate-900">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-extrabold">{report.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{report.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.exportTypes.map((type) => <Badge key={type} tone="primary">{type}</Badge>)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function badgeTone(tone: ExecutiveTone): BadgeTone {
  if (tone === "danger") return "danger";
  if (tone === "warning") return "warning";
  if (tone === "success") return "success";
  return "primary";
}

function toneText(tone: ExecutiveTone) {
  if (tone === "danger") return "text-danger";
  if (tone === "warning") return "text-warning";
  if (tone === "success") return "text-success";
  return "text-primary";
}

function toneSurface(tone: ExecutiveTone) {
  if (tone === "danger") return "bg-red-50 dark:bg-red-950/20";
  if (tone === "warning") return "bg-amber-50 dark:bg-amber-950/20";
  if (tone === "success") return "bg-green-50 dark:bg-green-950/20";
  return "bg-[#f2efff] dark:bg-primary/15";
}

function cohortColor(value: number) {
  if (!value) return "#F8FAFC";
  if (value >= 90) return "#DCFCE7";
  if (value >= 80) return "#FEF3C7";
  if (value >= 70) return "#FFEDD5";
  return "#FEE2E2";
}
