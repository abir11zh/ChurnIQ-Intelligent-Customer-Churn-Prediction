import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
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
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenText,
  BrainCircuit,
  CheckCircle2,
  Download,
  Eye,
  Gauge,
  Layers,
  MessageSquareText,
  Save,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { CardSkeleton, EmptyState } from "../../components/common/States";
import { cn } from "../../lib/utils";
import {
  actionRecommendations,
  comparisonMetrics,
  globalFeatureDrivers,
  insightCards,
  localContributions,
  localCustomer,
  populationComparison,
  revenueImpact,
  waterfallSteps,
  type LocalContribution,
  type ShapFeatureDriver
} from "./explainabilityData";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 }
};

const pageTabs = [
  { label: "Center", href: "/shap", icon: Sparkles },
  { label: "Global SHAP", href: "/shap/global", icon: BarChart3 },
  { label: "Local SHAP", href: "/shap/local", icon: Target },
  { label: "Comparison", href: "/shap/comparison", icon: Users },
  { label: "Business Insights", href: "/shap/business-insights", icon: BrainCircuit }
];

export function ExplainabilityCenterPage() {
  return (
    <ExplainabilityPage
      eyebrow="Explainable AI Center"
      title="Business explainability for every churn decision."
      subtitle="Turn CatBoost prediction logic into plain business language, revenue impact and retention actions."
      action={<Button asChild><Link to="/shap/local"><Eye className="h-4 w-4" /> Explain a Customer</Link></Button>}
    >
      <HeroSummary />

      <div className="grid gap-5 lg:grid-cols-4">
        {[
          ["Top Driver", "Contract Type", "34% influence", Layers, "danger"],
          ["Revenue At Risk", "$45,230", "From explainable churn drivers", TrendingUp, "danger"],
          ["Customers Impacted", "1,240", "Actionable retention cohort", Users, "primary"],
          ["Potential Savings", "$18,400", "With recommended actions", ShieldCheck, "success"]
        ].map(([label, value, text, Icon, tone]) => (
          <MetricCard key={label as string} label={label as string} value={value as string} text={text as string} icon={Icon as LucideIcon} tone={tone as BadgeTone} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Explainability modules</CardTitle>
              <CardDescription>Separate views for model behavior, single-customer reasoning, comparison and executive business intelligence.</CardDescription>
            </div>
            <Badge tone="primary">Phase 5</Badge>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {pageTabs.slice(1).map((tab) => (
              <Link key={tab.href} to={tab.href} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                    <tab.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <p className="mt-5 font-extrabold">{tab.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{moduleDescription(tab.href)}</p>
              </Link>
            ))}
          </div>
        </Card>

        <AINarrator
          title="AI Narrator"
          text="Customers leave when they do not feel locked into value. The strongest warning signs are flexible contracts, higher bills and missing support. The best response is targeted: move risky customers to stronger plans, add support, and protect revenue before cancellation starts."
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <FeatureRankingCard compact />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Operational states ready</CardTitle>
              <CardDescription>Explainability pages include loading, empty and error UI patterns for production workflows.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <CardSkeleton className="rounded-2xl border border-slate-100 bg-white/70 shadow-none" />
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-extrabold">Empty search state</p>
                  <p className="text-sm text-muted">No customer explanation found.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-danger" />
                <div>
                  <p className="font-extrabold text-danger">API error state</p>
                  <p className="text-sm text-muted">Retry explanation generation.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ExplainabilityPage>
  );
}

export function GlobalShapPage() {
  const [selectedFeature, setSelectedFeature] = useState<ShapFeatureDriver>(globalFeatureDrivers[0]);

  return (
    <ExplainabilityPage
      eyebrow="Global SHAP"
      title="Understand global model behavior."
      subtitle="See the strongest drivers that influence churn across the full customer base."
      action={<ExportActions />}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <MetricCard label="Top Churn Driver" value="Contract Type" text="34% importance score" icon={Layers} tone="danger" />
        <MetricCard label="Explained Revenue Risk" value="$45,230" text="Mapped to top model signals" icon={TrendingUp} tone="danger" />
        <MetricCard label="Business Actions" value="7" text="Directly connected to retention plays" icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top Features Influencing Churn</CardTitle>
              <CardDescription>Click a bar to inspect its business meaning and recommended action.</CardDescription>
            </div>
            <Badge tone="primary">Interactive ranking</Badge>
          </CardHeader>
          <div className="h-[430px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={globalFeatureDrivers} layout="vertical" margin={{ left: 18, right: 24, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF2FF" />
                <XAxis type="number" domain={[0, 38]} tick={{ fill: "#6B7280", fontSize: 12 }} />
                <YAxis type="category" dataKey="shortName" tick={{ fill: "#111827", fontSize: 12, fontWeight: 700 }} width={92} />
                <Tooltip content={<FeatureTooltip />} />
                <Bar dataKey="importance" radius={[0, 12, 12, 0]} onClick={(data) => setSelectedFeature(data as ShapFeatureDriver)}>
                  {globalFeatureDrivers.map((feature) => (
                    <Cell key={feature.feature} fill={feature.direction === "Risk reducing" ? "#22C55E" : feature.importance > 20 ? "#EF4444" : "#6D5BFF"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <FeatureDetailsPanel feature={selectedFeature} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <AINarrator
          title="AI business explanation"
          text="Contract type is the strongest churn driver in the current customer base. Customers using month-to-month contracts are significantly more likely to leave, especially when their bills are high and support is missing."
        />
        <FeatureTimeline />
      </div>
    </ExplainabilityPage>
  );
}

export function LocalShapPage() {
  const [query, setQuery] = useState("Sarah Johnson");
  const foundCustomer = `${localCustomer.name} ${localCustomer.id} ${localCustomer.email}`.toLowerCase().includes(query.trim().toLowerCase());
  const increasing = localContributions.filter((item) => item.direction === "increase");
  const reducing = localContributions.filter((item) => item.direction === "reduce");

  return (
    <ExplainabilityPage
      eyebrow="Local SHAP"
      title="Explain a single customer prediction."
      subtitle="Select a customer and translate their CatBoost score into business factors and retention actions."
      action={<ExportActions />}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f7f5ff]">
        <CardHeader>
          <div>
            <CardTitle>Customer selector</CardTitle>
            <CardDescription>Search by name, email or customer ID.</CardDescription>
          </div>
          <Badge tone="success">Explanation loaded</Badge>
        </CardHeader>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Search customer..." />
        </div>
      </Card>

      {!foundCustomer ? (
        <EmptyState icon={Search} title="No customer explanation found" description="Try Sarah Johnson or CUST_03246 to load the local explanation workspace." />
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-4">
            <MetricCard label="Customer Risk" value={`${localCustomer.risk}%`} text={localCustomer.riskLevel} icon={Gauge} tone="danger" />
            <MetricCard label="Prediction" value={localCustomer.prediction} text="CatBoost production score" icon={Zap} tone="primary" />
            <MetricCard label="Confidence" value={`${localCustomer.confidence}%`} text="High confidence" icon={BadgeCheck} tone="success" />
            <MetricCard label="Revenue At Risk" value={`$${localCustomer.revenueAtRisk.toLocaleString()}`} text={localCustomer.segment} icon={TrendingUp} tone="danger" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Local Contributions</CardTitle>
                  <CardDescription>Factors increasing or reducing this customer's churn risk.</CardDescription>
                </div>
                <Badge tone="danger">{localCustomer.riskLevel} Risk</Badge>
              </CardHeader>
              <div className="grid gap-4 lg:grid-cols-2">
                <ContributionGroup title="Factors Increasing Risk" items={increasing} tone="danger" />
                <ContributionGroup title="Factors Reducing Risk" items={reducing} tone="success" />
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Why Is This Customer Risky?</CardTitle>
                  <CardDescription>Plain-language explanation for managers and executives.</CardDescription>
                </div>
              </CardHeader>
              <p className="text-sm leading-7 text-muted">
                This customer is considered high risk primarily because they use a month-to-month contract, have high monthly charges, and do not subscribe to technical support services. These signals historically appear together in customers who cancel faster than the average customer.
              </p>
              <div className="mt-5 rounded-2xl bg-[#f2efff] p-4">
                <p className="font-extrabold text-primary">Best next action</p>
                <p className="mt-2 text-sm leading-6 text-muted">Offer a 15% save discount, include technical support for 90 days, and propose a one-year plan with onboarding support.</p>
              </div>
            </Card>
          </div>

          <WaterfallCard />
        </>
      )}
    </ExplainabilityPage>
  );
}

export function ShapComparisonPage() {
  return (
    <ExplainabilityPage
      eyebrow="Customer Comparison"
      title="Compare one customer against the population."
      subtitle="Understand how this customer differs from average, high-risk and low-risk customer groups."
      action={<ExportActions />}
    >
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Visual Comparison</CardTitle>
              <CardDescription>Customer versus population average, high-risk customers and low-risk customers.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-[410px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={populationComparison} margin={{ left: 8, right: 16, top: 12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
                <XAxis dataKey="group" tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="monthly" name="Monthly charges" fill="#6D5BFF" radius={[10, 10, 0, 0]} />
                <Bar dataKey="tenure" name="Tenure" fill="#00D4FF" radius={[10, 10, 0, 0]} />
                <Bar dataKey="support" name="Support usage" fill="#22C55E" radius={[10, 10, 0, 0]} />
                <Bar dataKey="risk" name="Risk level" fill="#EF4444" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Comparison Metrics</CardTitle>
              <CardDescription>Where Sarah Johnson is above or below key groups.</CardDescription>
            </div>
            <Badge tone="danger">82% risk</Badge>
          </CardHeader>
          <div className="space-y-5">
            {comparisonMetrics.map((metric) => (
              <ComparisonRow key={metric.metric} {...metric} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardTitle>Customer Profile Radar</CardTitle>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { axis: "Revenue", customer: 78, average: 58 },
                { axis: "Loyalty", customer: 24, average: 61 },
                { axis: "Support", customer: 18, average: 42 },
                { axis: "Services", customer: 54, average: 61 },
                { axis: "Risk", customer: 82, average: 27 }
              ]}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "#6B7280", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Customer" dataKey="customer" stroke="#EF4444" fill="#EF4444" fillOpacity={0.22} />
                <Radar name="Average" dataKey="average" stroke="#6D5BFF" fill="#6D5BFF" fillOpacity={0.16} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <AINarrator
          title="Plain English comparison"
          text="This customer is riskier than the average population because her monthly bill is higher, tenure is shorter, and support usage is lower. Customers who stay longer usually have deeper service usage and more support coverage."
        />
      </div>
    </ExplainabilityPage>
  );
}

export function ShapBusinessInsightsPage() {
  const [executiveMode, setExecutiveMode] = useState(true);

  return (
    <ExplainabilityPage
      eyebrow="Business Insights"
      title="Translate explanations into business intelligence."
      subtitle="Prioritize churn drivers by affected customers, revenue impact and recommended actions."
      action={
        <Button variant={executiveMode ? "secondary" : "outline"} onClick={() => setExecutiveMode((value) => !value)}>
          <BookOpenText className="h-4 w-4" /> Executive Mode
        </Button>
      }
    >
      {executiveMode && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary to-secondary text-white">
          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr] xl:items-center">
            <div>
              <Badge className="bg-white/20 text-white" tone="primary">Executive Summary</Badge>
              <h2 className="mt-4 text-3xl font-extrabold tracking-normal">Revenue risk is concentrated in contract, pricing and support gaps.</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/82">
                The biggest churn opportunities are customers on monthly contracts, customers paying above average without visible value, and customers missing support coverage. Focus retention spend on these groups first.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Top Churn Drivers", "Contract, Charges, Support"],
                ["Revenue Risk", "$45,230"],
                ["Recommended Actions", "4 priority plays"],
                ["Retention Opportunities", "312 customers"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/14 p-4 backdrop-blur">
                  <p className="text-xs font-bold uppercase text-white/70">{label}</p>
                  <p className="mt-2 text-xl font-extrabold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-4">
        <MetricCard label="Revenue At Risk" value={`$${revenueImpact.revenueAtRisk.toLocaleString()}`} text="Across top drivers" icon={TrendingUp} tone="danger" />
        <MetricCard label="Customers Impacted" value={revenueImpact.customersImpacted.toLocaleString()} text="Need targeted intervention" icon={Users} tone="primary" />
        <MetricCard label="Potential Savings" value={`$${revenueImpact.potentialSavings.toLocaleString()}`} text="From recommended plays" icon={ShieldCheck} tone="success" />
        <MetricCard label="Retention Opportunities" value={revenueImpact.retentionOpportunities.toString()} text="Ready for campaigns" icon={Target} tone="warning" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <TopDriversTable />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI Insight Cards</CardTitle>
              <CardDescription>Business interpretation generated from the explanation layer.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {insightCards.map((insight, index) => (
              <motion.div key={insight} variants={fade} initial="hidden" animate="show" transition={{ delay: index * 0.04 }} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2efff] text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold leading-6">{insight}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ActionRecommendationPanel />
        <AINarrator
          title="AI Narrator"
          text="The business priority is clear: reduce churn by improving contract commitment, matching price to perceived value, and adding support before frustration becomes cancellation. These actions protect revenue while improving customer experience."
        />
      </div>
    </ExplainabilityPage>
  );
}

function ExplainabilityPage({
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
    <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.45 }} className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone="primary">{eyebrow}</Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-normal text-ink dark:text-white md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">{subtitle}</p>
        </div>
        {action && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
      <div className="flex flex-wrap gap-2">
        {pageTabs.map((tab) => (
          <Button key={tab.href} asChild variant="outline" size="sm">
            <Link to={tab.href}><tab.icon className="h-4 w-4" /> {tab.label}</Link>
          </Button>
        ))}
      </div>
      {children}
    </motion.div>
  );
}

function HeroSummary() {
  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-white via-[#f7f5ff] to-[#effcff]">
      <div className="absolute right-8 top-8 hidden h-40 w-40 rounded-full bg-primary/10 blur-3xl lg:block" />
      <div className="relative grid gap-8 xl:grid-cols-[1fr_0.8fr] xl:items-center">
        <div>
          <Badge tone="success">Business Explainability Platform</Badge>
          <h2 className="mt-5 text-3xl font-extrabold tracking-normal md:text-4xl">Explain the why behind every churn prediction.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
            CHURNIQ AI connects CatBoost predictions to drivers, customer context, revenue impact and practical retention actions. Managers do not need to understand machine learning to understand what to do next.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link to="/shap/global">View Global Drivers <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline"><Link to="/shap/business-insights">Open Executive Mode</Link></Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Why risk happened", icon: MessageSquareText },
            { label: "What increased risk", icon: TrendingUp },
            { label: "What reduced risk", icon: TrendingDown },
            { label: "How to reduce risk", icon: CheckCircle2 }
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-extrabold">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function FeatureRankingCard({ compact = false }: { compact?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Top churn drivers</CardTitle>
          <CardDescription>Feature importance translated into business impact.</CardDescription>
        </div>
        <Badge tone="primary">Global</Badge>
      </CardHeader>
      <div className="space-y-4">
        {globalFeatureDrivers.slice(0, compact ? 5 : 10).map((feature) => (
          <div key={feature.feature}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-extrabold">{feature.feature}</span>
              <span className="font-bold text-muted">{feature.importance}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className={cn("h-full rounded-full", feature.direction === "Risk reducing" ? "bg-success" : feature.importance > 20 ? "bg-danger" : "bg-primary")}
                style={{ width: `${feature.importance}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FeatureDetailsPanel({ feature }: { feature: ShapFeatureDriver }) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div>
          <CardTitle>Feature Details Panel</CardTitle>
          <CardDescription>{feature.feature}</CardDescription>
        </div>
        <Badge tone={feature.direction === "Risk reducing" ? "success" : feature.impact === "Critical" ? "danger" : "warning"}>{feature.impact}</Badge>
      </CardHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <DetailTile label="Importance Score" value={`${feature.importance}%`} />
        <DetailTile label="Business Impact" value={feature.businessImpact} />
        <DetailTile label="Influence Direction" value={feature.direction} />
        <DetailTile label="Affected Customers" value={feature.affectedCustomers.toLocaleString()} />
      </div>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
        <p className="text-xs font-bold uppercase text-muted">Historical contribution</p>
        <p className="mt-2 text-sm font-semibold leading-6">{feature.historicalContribution}</p>
      </div>
      <div className="mt-4 rounded-2xl bg-[#f2efff] p-4">
        <p className="text-xs font-bold uppercase text-primary">Business explanation</p>
        <p className="mt-2 text-sm leading-6 text-muted">{feature.explanation}</p>
      </div>
      <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-bold uppercase text-muted">Suggested action</p>
        <p className="mt-2 text-sm font-bold">{feature.action}</p>
        <Badge className="mt-3" tone="success">Expected risk reduction {feature.expectedReduction}%</Badge>
      </div>
    </Card>
  );
}

function FeatureTimeline() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Historical Contribution</CardTitle>
          <CardDescription>How top drivers shape churn pressure across the customer base.</CardDescription>
        </div>
      </CardHeader>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[
            { month: "Jan", contract: 28, charges: 18, support: 12 },
            { month: "Feb", contract: 30, charges: 19, support: 13 },
            { month: "Mar", contract: 31, charges: 21, support: 14 },
            { month: "Apr", contract: 33, charges: 22, support: 15 },
            { month: "May", contract: 34, charges: 23, support: 16 },
            { month: "Jun", contract: 34, charges: 24, support: 17 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
            <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="contract" stackId="1" stroke="#EF4444" fill="#FCA5A5" />
            <Area type="monotone" dataKey="charges" stackId="1" stroke="#6D5BFF" fill="#C4B5FD" />
            <Area type="monotone" dataKey="support" stackId="1" stroke="#00D4FF" fill="#A5F3FC" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ContributionGroup({ title, items, tone }: { title: string; items: LocalContribution[]; tone: "danger" | "success" }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-extrabold">{title}</p>
        <Badge tone={tone}>{items.length}</Badge>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.feature}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">{item.feature}</span>
              <span className={cn("font-extrabold", tone === "danger" ? "text-danger" : "text-success")}>{item.contribution > 0 ? "+" : ""}{item.contribution}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-white dark:bg-slate-900">
              <div className={cn("h-full rounded-full", tone === "danger" ? "bg-danger" : "bg-success")} style={{ width: `${Math.abs(item.contribution) * 3.4}%` }} />
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">{item.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaterfallCard() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Premium Waterfall Visualization</CardTitle>
          <CardDescription>Base risk plus customer factors equals final prediction.</CardDescription>
        </div>
        <Badge tone="danger">Final 82%</Badge>
      </CardHeader>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={waterfallSteps} margin={{ top: 20, right: 18, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
            <XAxis dataKey="label" tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 700 }} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="cumulative" radius={[12, 12, 0, 0]}>
              {waterfallSteps.map((step) => (
                <Cell key={step.label} fill={step.type === "increase" ? "#EF4444" : step.type === "reduce" ? "#22C55E" : step.type === "final" ? "#6D5BFF" : "#00D4FF"} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="cumulative" stroke="#111827" strokeWidth={2} dot={{ r: 4 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ComparisonRow({ metric, customer, average, highRisk, lowRisk, suffix }: { metric: string; customer: number; average: number; highRisk: number; lowRisk: number; suffix: string }) {
  const max = Math.max(customer, average, highRisk, lowRisk, 100);

  return (
    <div>
      <p className="mb-3 font-extrabold">{metric}</p>
      {[
        ["Customer", customer, "bg-danger"],
        ["Population Average", average, "bg-primary"],
        ["High-Risk Customers", highRisk, "bg-warning"],
        ["Low-Risk Customers", lowRisk, "bg-success"]
      ].map(([label, value, color]) => (
        <div key={label as string} className="mb-2 grid grid-cols-[140px_1fr_56px] items-center gap-3 text-xs">
          <span className="font-bold text-muted">{label}</span>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10">
            <div className={cn("h-full rounded-full", color as string)} style={{ width: `${(Number(value) / max) * 100}%` }} />
          </div>
          <span className="text-right font-extrabold">{suffix === "$" ? "$" : ""}{value}{suffix !== "$" ? suffix : ""}</span>
        </div>
      ))}
    </div>
  );
}

function TopDriversTable() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Top 10 Drivers</CardTitle>
          <CardDescription>Prioritized by business impact, affected customers and revenue exposure.</CardDescription>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              {["Driver", "Business Impact", "Affected Customers", "Revenue Impact", "Action"].map((header) => (
                <th key={header} className="px-4 py-3 font-bold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {globalFeatureDrivers.map((feature) => (
              <tr key={feature.feature} className="border-t border-slate-100 dark:border-white/10">
                <td className="px-4 py-4 font-extrabold">{feature.feature}</td>
                <td className="px-4 py-4"><Badge tone={feature.impact === "Protective" ? "success" : feature.impact === "Critical" ? "danger" : "warning"}>{feature.impact}</Badge></td>
                <td className="px-4 py-4">{feature.affectedCustomers.toLocaleString()}</td>
                <td className="px-4 py-4">${feature.revenueImpact.toLocaleString()}</td>
                <td className="px-4 py-4 font-semibold text-primary">{feature.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ActionRecommendationPanel() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Action Recommendations</CardTitle>
          <CardDescription>Each important driver is converted into a retention action.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        {actionRecommendations.map((item) => (
          <div key={item.problem} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-bold uppercase text-muted">Problem</p>
            <p className="mt-1 font-extrabold">{item.problem}</p>
            <p className="mt-4 text-xs font-bold uppercase text-muted">Suggested Action</p>
            <p className="mt-1 font-bold text-primary">{item.action}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <DetailTile label="Risk Reduction" value={`${item.expectedRiskReduction}%`} />
              <DetailTile label="Revenue Saved" value={`$${item.revenueSaved.toLocaleString()}`} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AINarrator({ title, text }: { title: string; text: string }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f7f5ff]">
      <CardHeader>
        <div>
          <Badge tone="primary">Plain English</Badge>
          <CardTitle className="mt-3">{title}</CardTitle>
          <CardDescription>No machine-learning jargon. Only business language.</CardDescription>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary">
          <BrainCircuit className="h-6 w-6" />
        </div>
      </CardHeader>
      <p className="text-sm leading-7 text-muted">{text}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm"><Download className="h-4 w-4" /> Export Explanation</Button>
        <Button variant="outline" size="sm"><Share2 className="h-4 w-4" /> Share</Button>
        <Button variant="outline" size="sm"><Save className="h-4 w-4" /> Save</Button>
      </div>
    </Card>
  );
}

function MetricCard({ label, value, text, icon: Icon, tone }: { label: string; value: string; text: string; icon: LucideIcon; tone: BadgeTone }) {
  return (
    <Card className="transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">{label}</p>
          <p className="mt-3 text-2xl font-extrabold tracking-normal">{value}</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-muted">{text}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f2efff] text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <Badge className="mt-4" tone={tone}>{toneLabel(tone)}</Badge>
    </Card>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="mt-2 font-extrabold">{value}</p>
    </div>
  );
}

function ExportActions() {
  return (
    <>
      <Button variant="outline"><Download className="h-4 w-4" /> Export Explanation</Button>
      <Button variant="outline"><Share2 className="h-4 w-4" /> Share</Button>
      <Button><Save className="h-4 w-4" /> Save</Button>
    </>
  );
}

function FeatureTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ShapFeatureDriver }> }) {
  if (!active || !payload?.length) return null;
  const feature = payload[0].payload;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
      <p className="font-extrabold">{feature.feature}</p>
      <p className="mt-1 text-sm text-muted">Importance: {feature.importance}%</p>
      <p className="mt-1 text-sm text-muted">{feature.direction}</p>
    </div>
  );
}

function moduleDescription(href: string) {
  const descriptions: Record<string, string> = {
    "/shap/global": "Understand global model behavior and top churn drivers.",
    "/shap/local": "Explain one customer prediction with risk and protective factors.",
    "/shap/comparison": "Compare a customer against average, high-risk and low-risk groups.",
    "/shap/business-insights": "Translate explanations into revenue impact and retention actions."
  };

  return descriptions[href] ?? "Explain churn decisions.";
}

function toneLabel(tone: BadgeTone) {
  const labels: Record<BadgeTone, string> = {
    neutral: "Stable",
    success: "Positive",
    warning: "Watch",
    danger: "High impact",
    primary: "AI signal"
  };

  return labels[tone];
}
