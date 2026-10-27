import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Download,
  Filter,
  ImageDown,
  Maximize2,
  Minimize2,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Select } from "../../components/ui/input";
import { ChartSkeleton, EmptyState } from "../../components/common/States";
import { cn } from "../../lib/utils";
import {
  aiBusinessInsights,
  catBoostPerformanceCenter,
  churnByContract,
  churnByInternet,
  churnByMonthlyCharges,
  churnByPayment,
  churnBySegment,
  churnBySeniorCitizen,
  churnByTenure,
  churnTrendOverTime,
  customerLifetimeValue,
  customerSegments,
  dashboardExecutiveInsights,
  dashboardFilterOptions,
  dashboardKpiCards,
  distributionHub,
  monthlyRevenueTrend,
  recentActivityCenter,
  revenueByContract,
  revenueByRisk,
  revenueBySegment,
  revenueByService,
  revenueForecast,
  revenueLossForecast,
  segmentInsights,
  segmentScatter
} from "../../data/mock";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";
type Filters = {
  dateRange: string;
  segment: string;
  riskLevel: string;
  contractType: string;
  internetService: string;
};

const chartTooltip = {
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  boxShadow: "0 20px 45px rgba(17, 24, 39, 0.08)"
};

const axisTick = { fill: "#64748B", fontSize: 11, fontWeight: 700 };
const gridStroke = "#EEF2FF";

const defaultFilters: Filters = {
  dateRange: "Last 30 days",
  segment: "All segments",
  riskLevel: "All risks",
  contractType: "All contracts",
  internetService: "All services"
};

export function ExecutiveDashboard() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const filterMultiplier = useMemo(() => {
    let multiplier = 1;
    if (filters.dateRange === "Last 7 days") multiplier -= 0.04;
    if (filters.dateRange === "Last 90 days") multiplier += 0.05;
    if (filters.dateRange === "This quarter") multiplier += 0.07;
    if (filters.dateRange === "Year to date") multiplier += 0.11;
    if (filters.segment !== "All segments") multiplier += 0.04;
    if (filters.riskLevel === "High") multiplier += 0.08;
    if (filters.riskLevel === "Critical") multiplier += 0.13;
    if (filters.contractType === "Month-to-month") multiplier += 0.09;
    if (filters.internetService === "Fiber optic") multiplier += 0.05;
    return multiplier;
  }, [filters]);

  const filteredDistributionHub = useMemo(
    () =>
      distributionHub.map((card) => ({
        ...card,
        data: scaleRows(card.data, ["value"], filterMultiplier)
      })),
    [filterMultiplier]
  );

  const filteredChurnTrend = useMemo(() => scaleRows(churnTrendOverTime, ["churn", "highRisk"], filterMultiplier), [filterMultiplier]);
  const filteredRevenueTrend = useMemo(() => scaleRows(monthlyRevenueTrend, ["revenue", "protected"], filterMultiplier), [filterMultiplier]);
  const filteredRevenueForecast = useMemo(() => scaleRows(revenueForecast, ["forecast", "best", "loss"], filterMultiplier), [filterMultiplier]);
  const filteredRevenueLoss = useMemo(() => scaleRows(revenueLossForecast, ["loss"], filterMultiplier), [filterMultiplier]);
  const filteredSegmentScatter = useMemo(() => scaleRows(segmentScatter, ["revenue", "risk"], filterMultiplier), [filterMultiplier]);

  const activeFilters = Object.values(filters).filter((value) => !value.startsWith("All") && value !== "Last 30 days").length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <DashboardHeader activeFilters={activeFilters} />
      <AdvancedFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />

      <ExecutiveSummary />
      <KpiSection />

      <DashboardSection
        eyebrow="Customer Distribution Hub"
        title="Customer portfolio intelligence"
        description="Demographics, contract structure, service mix and billing distribution across the customer base."
      >
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
          {filteredDistributionHub.map((card) => (
            <PremiumChartCard key={card.title} title={card.title} description="Filtered customer mix" height="h-64" data={card.data}>
              <DistributionChart chart={card.chart} data={card.data} />
            </PremiumChartCard>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="Churn Analytics Center"
        title="Where churn is concentrated"
        description="Contract risk, payment behavior, tenure decay and segment-level churn intelligence."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <PremiumChartCard title="Churn by Contract Type" description="Stacked churn vs retained view" data={churnByContract}>
            <StackedBarChart data={scaleRows(churnByContract, ["churn", "retained"], filterMultiplier)} />
          </PremiumChartCard>
          <PremiumChartCard title="Churn Trend Over Time" description="Monthly churn and high-risk customer movement" data={filteredChurnTrend}>
            <ChurnTrendChart data={filteredChurnTrend} />
          </PremiumChartCard>
          <PremiumChartCard title="Churn by Payment Method" description="Payment methods with elevated churn" data={churnByPayment}>
            <SimpleBarChart data={scaleRows(churnByPayment, ["churn"], filterMultiplier)} color="#EF4444" valueKey="churn" />
          </PremiumChartCard>
          <PremiumChartCard title="Churn by Internet Service" description="Service type churn comparison" data={churnByInternet}>
            <StackedBarChart data={scaleRows(churnByInternet, ["churn", "retained"], filterMultiplier)} />
          </PremiumChartCard>
          <PremiumChartCard title="Churn by Tenure" description="Risk declines as customers mature" data={churnByTenure}>
            <AreaMetricChart data={scaleRows(churnByTenure, ["churn"], filterMultiplier)} valueKey="churn" color="#6D5BFF" />
          </PremiumChartCard>
          <PremiumChartCard title="Churn by Monthly Charges" description="Risk pressure by billing band" data={churnByMonthlyCharges}>
            <ChargeRiskChart data={scaleRows(churnByMonthlyCharges, ["churn", "volume"], filterMultiplier)} />
          </PremiumChartCard>
          <PremiumChartCard title="Churn by Senior Citizen" description="Senior-citizen risk differential" data={churnBySeniorCitizen}>
            <RiskPieChart data={scaleRows(churnBySeniorCitizen, ["churn"], filterMultiplier)} valueKey="churn" />
          </PremiumChartCard>
          <PremiumChartCard title="Churn by Customer Segment" description="Segment-level churn rate" data={churnBySegment}>
            <SimpleBarChart data={scaleRows(churnBySegment, ["churn"], filterMultiplier)} color="#8B5CF6" valueKey="churn" />
          </PremiumChartCard>
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="Revenue Analytics"
        title="Revenue risk and growth visibility"
        description="Financial intelligence for churn exposure, customer lifetime value and forecasted revenue loss."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <PremiumChartCard title="Monthly Revenue Trend" description="Revenue and protected revenue movement" data={filteredRevenueTrend}>
            <RevenueAreaChart data={filteredRevenueTrend} />
          </PremiumChartCard>
          <PremiumChartCard title="Revenue Forecast" description="Expected vs best-case revenue projection" data={filteredRevenueForecast}>
            <ForecastChart data={filteredRevenueForecast} />
          </PremiumChartCard>
          <PremiumChartCard title="Revenue by Customer Segment" description="Revenue and risk by segment" data={revenueBySegment}>
            <RevenueRiskChart data={scaleRows(revenueBySegment, ["revenue", "risk"], filterMultiplier)} />
          </PremiumChartCard>
          <PremiumChartCard title="Revenue by Contract Type" description="Contract revenue and expected loss" data={revenueByContract}>
            <RevenueRiskChart data={scaleRows(revenueByContract, ["revenue", "loss"], filterMultiplier)} riskKey="loss" />
          </PremiumChartCard>
          <PremiumChartCard title="Revenue by Service Type" description="Service contribution to recurring revenue" data={revenueByService}>
            <SimpleBarChart data={scaleRows(revenueByService, ["revenue"], filterMultiplier)} color="#00D4FF" valueKey="revenue" />
          </PremiumChartCard>
          <PremiumChartCard title="Revenue by Churn Risk" description="Revenue concentration across risk levels" data={revenueByRisk}>
            <RiskPieChart data={scaleRows(revenueByRisk, ["revenue"], filterMultiplier)} valueKey="revenue" />
          </PremiumChartCard>
          <PremiumChartCard title="Revenue Loss Forecast" description="Forecasted revenue leakage without intervention" data={filteredRevenueLoss}>
            <AreaMetricChart data={filteredRevenueLoss} valueKey="loss" color="#EF4444" />
          </PremiumChartCard>
          <PremiumChartCard title="Customer Lifetime Value" description="CLV by customer segment" data={customerLifetimeValue}>
            <SimpleBarChart data={scaleRows(customerLifetimeValue, ["clv"], filterMultiplier)} color="#22C55E" valueKey="clv" />
          </PremiumChartCard>
        </div>
      </DashboardSection>

      <CustomerSegmentationSection filterMultiplier={filterMultiplier} scatterData={filteredSegmentScatter} />

      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <LogisticRegressionPerformanceSection />
        <AiInsightsSection />
      </div>

      <RecentActivitySection />
    </div>
  );
}

function DashboardHeader({ activeFilters }: { activeFilters: number }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-soft dark:border-white/10 dark:bg-slate-900/80">
      <div className="relative grid gap-6 bg-gradient-to-br from-[#fbfbff] via-white to-[#effcff] p-6 lg:grid-cols-[1fr_420px] lg:p-8">
        <div>
          <Badge tone="primary">Executive AI Command Center</Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight tracking-normal text-ink dark:text-white lg:text-5xl">
            Customer churn, revenue risk and Logistic Regression intelligence in one operating view.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted lg:text-base">
            Real-time business intelligence for retention teams, executives and analysts protecting customer revenue.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Customer Churn Situation", "Business Risk", "Revenue Protection", "Model Performance"].map((item) => (
              <span key={item} className="rounded-full border border-primary/10 bg-white/80 px-3 py-1.5 text-xs font-extrabold text-muted shadow-sm dark:bg-white/5">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-3 rounded-3xl border border-white bg-white/82 p-5 shadow-glass dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase text-muted">Live Workspace Pulse</p>
              <p className="mt-2 text-3xl font-extrabold">84.7%</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f2efff] text-primary">
              <BrainCircuit className="h-6 w-6" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Risk", "421"],
              ["Revenue", "$45K"],
              ["Filters", String(activeFilters)]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-white/5">
                <p className="text-lg font-extrabold">{value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase text-muted">{label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-4 text-white">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm font-extrabold">Model governance now separates ROC-AUC leadership from recall-driven business value.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvancedFilterBar({
  filters,
  onChange,
  onReset
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}) {
  const [status, setStatus] = useState("Live");
  const update = (key: keyof Filters, value: string) => {
    setStatus("Live");
    onChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold">Advanced Dashboard Filters</p>
            <Badge tone={status === "Applied" ? "success" : "primary"}>{status}</Badge>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted">All chart sections react to these executive filters.</p>
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect label="Date Range" value={filters.dateRange} options={dashboardFilterOptions.dateRanges} onChange={(value) => update("dateRange", value)} />
          <FilterSelect label="Customer Segment" value={filters.segment} options={dashboardFilterOptions.segments} onChange={(value) => update("segment", value)} />
          <FilterSelect label="Risk Level" value={filters.riskLevel} options={dashboardFilterOptions.riskLevels} onChange={(value) => update("riskLevel", value)} />
          <FilterSelect label="Contract Type" value={filters.contractType} options={dashboardFilterOptions.contractTypes} onChange={(value) => update("contractType", value)} />
          <FilterSelect label="Internet Service" value={filters.internetService} options={dashboardFilterOptions.internetServices} onChange={(value) => update("internetService", value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setStatus("Live"); onReset(); }}><RefreshCw className="h-4 w-4" /> Reset</Button>
          <Button onClick={() => setStatus("Applied")}><SlidersHorizontal className="h-4 w-4" /> Apply</Button>
        </div>
      </div>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-muted">
      {label}
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </Select>
    </label>
  );
}

function ExecutiveSummary() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-white via-[#fbfaff] to-[#f2fbff] p-0 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="grid gap-5 p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
        <div>
          <Badge tone="primary">AI Executive Summary</Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-normal">Real-time customer intelligence with recall-first model governance.</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            ChurnIQ AI is detecting rising customer risk, quantifying revenue exposure and preparing retention actions from the latest scoring signals.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Situation", "Elevated risk in early-tenure contracts"],
              ["Recommendation", "Prioritize tech support save plays"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white bg-white/72 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-extrabold uppercase text-muted">{label}</p>
                <p className="mt-2 text-sm font-extrabold leading-6">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {dashboardExecutiveInsights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="group rounded-3xl border border-white bg-white/82 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                  <insight.icon className="h-5 w-5" />
                </div>
                <Badge tone={toneOf(insight.tone)}>{insight.delta}</Badge>
              </div>
              <p className="mt-5 text-xs font-extrabold uppercase text-muted">{insight.title}</p>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-3xl font-extrabold">{insight.value}</p>
                <p className="pb-1 text-sm font-bold leading-5 text-muted">{insight.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function KpiSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {dashboardKpiCards.map((kpi, index) => (
        <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }}>
          <Card className="group h-full transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary transition group-hover:scale-105">
                <kpi.icon className="h-5 w-5" />
              </div>
              <Badge className="gap-1" tone={toneOf(kpi.tone)}>
                {kpi.direction === "down" ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                {kpi.trend}
              </Badge>
            </div>
            <p className="mt-5 text-xs font-extrabold uppercase text-muted">{kpi.label}</p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 + index * 0.02 }} className="mt-2 text-3xl font-extrabold">
              {kpi.value}
            </motion.p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function DashboardSection({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <Badge tone="primary">{eyebrow}</Badge>
          <h2 className="mt-3 text-2xl font-extrabold tracking-normal text-ink dark:text-white">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PremiumChartCard({
  title,
  description,
  children,
  data,
  loading = false,
  height = "h-80"
}: {
  title: string;
  description: string;
  children: ReactNode;
  data: unknown[];
  loading?: boolean;
  height?: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const chartId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const exportChart = () => {
    const node = document.querySelector(`[data-chart-id="${chartId}"] svg`);
    if (!node) return;
    const blob = new Blob([node.outerHTML], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${chartId}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("transition hover:border-primary/20 hover:shadow-soft", fullscreen && "fixed inset-4 z-50 overflow-auto bg-white p-6 dark:bg-slate-950")}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label={`Export ${title}`} title="Export image" onClick={exportChart}>
            <ImageDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Fullscreen ${title}`} title="Fullscreen view" onClick={() => setFullscreen((value) => !value)}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <div data-chart-id={chartId} className={cn(height, fullscreen && "h-[72vh]")}>
        {loading ? <ChartSkeleton /> : data.length ? children : <EmptyState icon={BarChart3} title="No data available" description="There is no data for the selected filters." />}
      </div>
    </Card>
  );
}

function DistributionChart({ chart, data }: { chart: string; data: Array<{ name: string; value: number; color: string }> }) {
  if (chart === "bar") {
    return <SimpleBarChart data={data} valueKey="value" />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={chart === "donut" ? 48 : 0}
          outerRadius={82}
          paddingAngle={chart === "donut" ? 4 : 1}
          isAnimationActive
        >
          {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
        </Pie>
        <Tooltip contentStyle={chartTooltip} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function SimpleBarChart({ data, valueKey, color = "#6D5BFF" }: { data: Array<Record<string, string | number>>; valueKey: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="name" tick={axisTick} interval={0} />
        <YAxis tick={axisTick} />
        <Tooltip contentStyle={chartTooltip} />
        <Bar dataKey={valueKey} radius={[12, 12, 0, 0]} fill={color} isAnimationActive>
          {data.map((entry) => <Cell key={String(entry.name)} fill={String(entry.color ?? color)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function StackedBarChart({ data }: { data: Array<Record<string, string | number>> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="name" tick={axisTick} interval={0} />
        <YAxis tick={axisTick} />
        <Tooltip contentStyle={chartTooltip} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
        <Bar dataKey="retained" stackId="a" fill="#22C55E" radius={[0, 0, 8, 8]} isAnimationActive />
        <Bar dataKey="churn" stackId="a" fill="#EF4444" radius={[8, 8, 0, 0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChurnTrendChart({ data }: { data: Array<Record<string, string | number>> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="month" tick={axisTick} />
        <YAxis tick={axisTick} />
        <Tooltip contentStyle={chartTooltip} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
        <Bar dataKey="highRisk" fill="#E9E7FF" radius={[10, 10, 0, 0]} />
        <Line type="monotone" dataKey="churn" stroke="#6D5BFF" strokeWidth={3} dot={{ r: 4, fill: "#6D5BFF" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function AreaMetricChart({ data, valueKey, color }: { data: Array<Record<string, string | number>>; valueKey: string; color: string }) {
  const gradientId = `${valueKey}-gradient`;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="name" tick={axisTick} />
        <YAxis tick={axisTick} />
        <Tooltip contentStyle={chartTooltip} />
        <Area type="monotone" dataKey={valueKey} stroke={color} fill={`url(#${gradientId})`} strokeWidth={3} isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChargeRiskChart({ data }: { data: Array<Record<string, string | number>> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="name" tick={axisTick} />
        <YAxis tick={axisTick} />
        <Tooltip contentStyle={chartTooltip} />
        <Bar dataKey="volume" fill="#E9E7FF" radius={[10, 10, 0, 0]} />
        <Line type="monotone" dataKey="churn" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: "#EF4444" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function RiskPieChart({ data, valueKey }: { data: Array<Record<string, string | number>>; valueKey: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey={valueKey} nameKey="name" innerRadius={64} outerRadius={94} paddingAngle={4}>
          {data.map((entry, index) => <Cell key={String(entry.name)} fill={String(entry.color ?? ["#22C55E", "#F59E0B", "#EF4444", "#6D5BFF"][index % 4])} />)}
        </Pie>
        <Tooltip contentStyle={chartTooltip} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RevenueAreaChart({ data }: { data: Array<Record<string, string | number>> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="monthlyRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6D5BFF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6D5BFF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="protectedRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="month" tick={axisTick} />
        <YAxis tick={axisTick} />
        <Tooltip contentStyle={chartTooltip} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
        <Area type="monotone" dataKey="revenue" stroke="#6D5BFF" fill="url(#monthlyRevenue)" strokeWidth={3} />
        <Area type="monotone" dataKey="protected" stroke="#22C55E" fill="url(#protectedRevenue)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ForecastChart({ data }: { data: Array<Record<string, string | number>> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="month" tick={axisTick} />
        <YAxis tick={axisTick} />
        <Tooltip contentStyle={chartTooltip} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
        <Line type="monotone" dataKey="best" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: "#22C55E" }} />
        <Line type="monotone" dataKey="forecast" stroke="#6D5BFF" strokeWidth={3} dot={{ r: 4, fill: "#6D5BFF" }} />
        <Line type="monotone" dataKey="loss" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: "#EF4444" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RevenueRiskChart({ data, riskKey = "risk" }: { data: Array<Record<string, string | number>>; riskKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="name" tick={axisTick} />
        <YAxis tick={axisTick} />
        <Tooltip contentStyle={chartTooltip} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
        <Bar dataKey="revenue" fill="#6D5BFF" radius={[10, 10, 0, 0]} />
        <Line type="monotone" dataKey={riskKey} stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: "#EF4444" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function CustomerSegmentationSection({ filterMultiplier, scatterData }: { filterMultiplier: number; scatterData: Array<Record<string, string | number>> }) {
  return (
    <DashboardSection
      eyebrow="Customer Segmentation"
      title="Segment performance and revenue concentration"
      description="Segment statistics, segment revenue, churn pressure and growth opportunities."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {customerSegments.map((segment) => (
          <Card key={segment.name} className="transition hover:-translate-y-1 hover:shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <Badge tone={toneOf(segment.tone)}>{segment.name}</Badge>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-5 text-3xl font-extrabold">{Math.round(segment.customers * filterMultiplier).toLocaleString()}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <SegmentMiniStat label="Revenue" value={segment.revenue} />
              <SegmentMiniStat label="Churn" value={segment.churnRate} />
              <SegmentMiniStat label="Growth" value={segment.growth} />
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <PremiumChartCard title="Interactive Segment Scatter Plot" description="Tenure, revenue and churn risk by segment" data={scatterData}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" dataKey="tenure" name="Tenure" tick={axisTick} />
              <YAxis type="number" dataKey="revenue" name="Revenue" tick={axisTick} />
              <ZAxis type="number" dataKey="risk" range={[120, 520]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={chartTooltip} />
              <Scatter name="Segments" data={scatterData} fill="#6D5BFF" />
            </ScatterChart>
          </ResponsiveContainer>
        </PremiumChartCard>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Segment Insights</CardTitle>
              <CardDescription>AI-generated segment priorities.</CardDescription>
            </div>
            <Zap className="h-5 w-5 text-primary" />
          </CardHeader>
          <div className="space-y-3">
            {segmentInsights.map((insight, index) => (
              <div key={insight} className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f2efff] text-xs font-extrabold text-primary">{index + 1}</span>
                <p className="text-sm font-semibold leading-6">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardSection>
  );
}

function SegmentMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-[10px] font-extrabold uppercase text-muted">{label}</p>
      <p className="mt-1 text-sm font-extrabold">{value}</p>
    </div>
  );
}

function LogisticRegressionPerformanceSection() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f8f7ff] dark:from-slate-900 dark:to-slate-950">
      <CardHeader>
        <div>
          <Badge tone="warning">Model Governance Review</Badge>
          <CardTitle className="mt-3 text-2xl">Model Performance Decision Center</CardTitle>
          <CardDescription>Logistic Regression leads narrowly on ROC-AUC, while Logistic Regression is the stronger business champion because recall matters most in churn.</CardDescription>
        </div>
        <ShieldCheck className="h-6 w-6 text-success" />
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {catBoostPerformanceCenter.metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white bg-white/82 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-extrabold uppercase text-muted">{metric.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-primary">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl bg-white/82 p-5 shadow-sm dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold">{catBoostPerformanceCenter.status}</p>
              <p className="mt-1 text-3xl font-extrabold">{catBoostPerformanceCenter.model}</p>
            </div>
            <Bot className="h-9 w-9 text-primary" />
          </div>
          <div className="mt-5 grid gap-3">
            <ProgressMetric label="Governance Confidence" value={catBoostPerformanceCenter.confidence} />
            <ProgressMetric label="Validation Health" value={catBoostPerformanceCenter.health} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <SegmentMiniStat label="Prediction Volume" value={catBoostPerformanceCenter.predictionVolume} />
            <SegmentMiniStat label="Last Retrained" value={catBoostPerformanceCenter.lastRetrained} />
          </div>
        </div>
        <div className="rounded-3xl bg-white/82 p-5 shadow-sm dark:bg-white/5">
          <p className="font-extrabold">Feature Importance Preview</p>
          <div className="mt-5 space-y-4">
            {catBoostPerformanceCenter.features.map((feature) => (
              <div key={feature.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{feature.name}</span>
                  <span className="font-extrabold text-primary">{feature.importance}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${feature.importance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-muted">{label}</span>
        <span className="font-extrabold">{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-success" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function AiInsightsSection() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <Badge tone="primary">AI Insights Center</Badge>
          <CardTitle className="mt-3 text-2xl">AI Business Insights</CardTitle>
          <CardDescription>Generated from customer behavior, revenue exposure, recall impact and explainability signals.</CardDescription>
        </div>
        <BrainCircuit className="h-6 w-6 text-primary" />
      </CardHeader>
      <div className="grid gap-3">
        {aiBusinessInsights.map((insight) => (
          <div key={insight.title} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 transition hover:border-primary/20 hover:bg-[#f8f7ff] dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="font-extrabold">{insight.title}</p>
              </div>
              <Badge tone={toneOf(insight.tone)}>{insight.badge}</Badge>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-muted">{insight.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecentActivitySection() {
  return (
    <DashboardSection
      eyebrow="Recent Activity Center"
      title="Latest operational movement"
      description="Recent predictions, reports, customers, campaigns and risk alerts in one timeline."
    >
      <Card>
        <div className="space-y-4">
          {recentActivityCenter.map((item, index) => (
            <div key={item.title} className="relative flex gap-4 rounded-3xl bg-slate-50 p-4 dark:bg-white/5">
              {index < recentActivityCenter.length - 1 && <span className="absolute left-8 top-14 h-8 w-px bg-slate-200 dark:bg-white/10" />}
              <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-2xl", item.type === "Alert" ? "bg-red-50 text-danger" : "bg-[#f2efff] text-primary")}>
                {activityIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <Badge tone={item.type === "Alert" ? "danger" : item.type === "Campaign" ? "success" : "primary"}>{item.type}</Badge>
                    <p className="mt-2 font-extrabold">{item.title}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold uppercase text-muted">{item.time}</p>
                    <p className="mt-1 text-sm font-extrabold text-primary">{item.status}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardSection>
  );
}

function activityIcon(type: string) {
  const icons: Record<string, ReactNode> = {
    Prediction: <Sparkles className="h-4 w-4" />,
    Alert: <AlertTriangle className="h-4 w-4" />,
    Report: <Download className="h-4 w-4" />,
    Customer: <CheckCircle2 className="h-4 w-4" />,
    Campaign: <CalendarDays className="h-4 w-4" />
  };
  return icons[type] ?? <Sparkles className="h-4 w-4" />;
}

function scaleRows<T extends Record<string, unknown>>(rows: T[], keys: string[], multiplier: number): T[] {
  return rows.map((row) => {
    const next: Record<string, unknown> = { ...row };
    keys.forEach((key) => {
      const value = row[key];
      if (typeof value === "number") {
        const decimals = Math.abs(value) >= 100 ? 0 : 1;
        next[key] = Number((value * multiplier).toFixed(decimals));
      }
    });
    return next as T;
  });
}

function toneOf(value?: string): BadgeTone {
  if (value === "success" || value === "warning" || value === "danger" || value === "primary" || value === "neutral") {
    return value;
  }
  return "primary";
}
