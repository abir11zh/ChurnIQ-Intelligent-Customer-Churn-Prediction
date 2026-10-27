import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Calculator,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileText,
  Layers,
  Megaphone,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
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
import { Input, Select } from "../../components/ui/input";
import { EmptyState } from "../../components/common/States";
import { cn } from "../../lib/utils";
import {
  aiRetentionSummary,
  campaignPerformance,
  executiveRetentionReport,
  retentionCampaigns,
  retentionCustomers,
  retentionHistory,
  retentionKpis,
  retentionOpportunities,
  retentionPlaybooks,
  retentionSegments,
  retentionTrend,
  riskValueHeatmap,
  simulatorActions,
  type RetentionAction,
  type RetentionCustomer,
  type RetentionOpportunity,
  type RetentionTone
} from "./retentionData";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

const chartTooltip = {
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  boxShadow: "0 20px 45px rgba(17, 24, 39, 0.08)"
};

const axisTick = { fill: "#64748B", fontSize: 11, fontWeight: 700 };
const gridStroke = "#EEF2FF";

const pageTabs = [
  { label: "Retention Intelligence", href: "/retention", icon: ShieldCheck },
  { label: "Simulator", href: "/retention/simulator", icon: Calculator },
  { label: "Opportunities", href: "/retention/opportunities", icon: Target },
  { label: "Campaigns", href: "/retention/campaigns", icon: Megaphone },
  { label: "Playbooks", href: "/retention/playbooks", icon: Layers }
];

const kpiIcons: Record<string, LucideIcon> = {
  "Customers At Risk": Users,
  "Revenue At Risk": CircleDollarSign,
  "Retention Opportunities": Target,
  "Potential Revenue Saved": ShieldCheck,
  "Active Campaigns": Megaphone,
  "Retention Success Rate": BadgeCheck,
  "Average Risk Reduction": TrendingDown
};

const opportunityIcons: Record<string, LucideIcon> = {
  discount: CircleDollarSign,
  support: ShieldCheck,
  loyalty: BadgeCheck,
  contract: FileText,
  call: Users,
  bundle: Layers
};

export function RetentionDashboardPage() {
  return (
    <RetentionPage
      eyebrow="Retention Intelligence"
      title="Revenue Protection Command Center"
      subtitle="Move from churn prediction to AI-guided decisions, ROI, campaigns and revenue saved."
      action={<Button asChild><Link to="/retention/simulator"><Calculator className="h-4 w-4" /> Open Simulator</Link></Button>}
    >
      <ExecutiveHero />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {retentionKpis.map((kpi) => {
          const Icon = kpiIcons[kpi.label] ?? ShieldCheck;
          return <MetricCard key={kpi.label} label={kpi.label} value={kpi.value} delta={kpi.delta} tone={kpi.tone} icon={Icon} />;
        })}
      </div>

      <RetentionSection
        eyebrow="Retention Opportunities"
        title="Highest-impact actions to reduce churn"
        description="Each strategy is scored by risk reduction, revenue saved, success rate, affected customers, implementation cost and ROI."
      >
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {retentionOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      </RetentionSection>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Retention Revenue Trend" description="Revenue saved and average risk reduction by month.">
          <ResponsiveContainer width="100%" height={310}>
            <ComposedChart data={retentionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="saved" radius={[12, 12, 0, 0]} fill="#6D5BFF" name="Revenue saved" />
              <Line type="monotone" dataKey="risk" stroke="#22C55E" strokeWidth={3} name="Avg risk reduction" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Retention Heatmap</CardTitle>
              <CardDescription>Prioritize customers by risk level and customer value.</CardDescription>
            </div>
            <Badge tone="danger">Priority</Badge>
          </CardHeader>
          <PriorityHeatmap />
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI Retention Assistant</CardTitle>
              <CardDescription>Ask what to do next, which campaign to launch and which customers to prioritize.</CardDescription>
            </div>
            <Badge tone="primary">Copilot ready</Badge>
          </CardHeader>
          <div className="rounded-3xl border border-primary/10 bg-gradient-to-br from-[#f6f4ff] to-white p-5 dark:border-white/10 dark:from-white/10 dark:to-white/5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shadow-soft">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <p className="font-extrabold">Recommended next decision</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Launch the Technical Support Upgrade play for 245 customers first. It has the best blend of confidence, success rate and revenue saved.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["How do I retain Sarah Johnson?", "Which campaign should I launch?", "Which customers should I prioritize?", "What strategy has the highest ROI?"].map((prompt) => (
                <Link key={prompt} to="/copilot" className="rounded-2xl bg-white p-4 text-sm font-extrabold text-ink shadow-sm transition hover:-translate-y-0.5 hover:text-primary dark:bg-slate-900 dark:text-white">
                  {prompt}
                </Link>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Executive Retention Report</CardTitle>
              <CardDescription>Board-ready summary of risk, savings, strategy performance and recommendations.</CardDescription>
            </div>
            <Button variant="outline"><Download className="h-4 w-4" /> Export</Button>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-2">
            {executiveRetentionReport.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="font-extrabold">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </RetentionPage>
  );
}

export function RetentionSimulatorPage() {
  const [customerId, setCustomerId] = useState(retentionCustomers[0]?.id ?? "");
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>(["support", "discount15"]);

  const fallbackCustomer = retentionCustomers[0]!;
  const selectedCustomer = retentionCustomers.find((customer) => customer.id === customerId) ?? fallbackCustomer;
  const selectedActions = simulatorActions.filter((action) => selectedActionIds.includes(action.id));
  const simulation = useMemo(() => calculateSimulation(selectedCustomer, selectedActions), [selectedCustomer, selectedActions]);

  const toggleAction = (actionId: string) => {
    setSelectedActionIds((current) =>
      current.includes(actionId) ? current.filter((id) => id !== actionId) : [...current, actionId]
    );
  };

  return (
    <RetentionPage
      eyebrow="Retention Simulator"
      title="Model the best action before spending retention budget."
      subtitle="Build scenarios, compare before vs after risk, and estimate saved revenue, action cost and ROI in real time."
      action={<Button asChild variant="outline"><Link to="/retention/campaigns"><Megaphone className="h-4 w-4" /> Create Campaign</Link></Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Simulation Workspace</CardTitle>
              <CardDescription>Select a customer and review the current risk baseline.</CardDescription>
            </div>
            <Badge tone={riskTone(selectedCustomer.risk)}>{riskLabel(selectedCustomer.risk)}</Badge>
          </CardHeader>
          <Select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            {retentionCustomers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name} - {customer.id}</option>
            ))}
          </Select>
          <div className="mt-5 grid place-items-center rounded-3xl bg-slate-50 p-6 dark:bg-white/5">
            <RetentionGauge value={selectedCustomer.risk} label="Current Risk" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoTile label="Current Revenue" value={formatCurrency(selectedCustomer.monthlyRevenue)} />
            <InfoTile label="Lifetime Value" value={formatCurrency(selectedCustomer.lifetimeValue)} />
            <InfoTile label="Current Segment" value={selectedCustomer.segment} />
            <InfoTile label="Contract" value={selectedCustomer.contract} />
          </div>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Scenario Builder</CardTitle>
                <CardDescription>Combine retention actions and watch the risk, cost and ROI change live.</CardDescription>
              </div>
              <Badge tone="primary">{selectedActions.length} actions</Badge>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {simulatorActions.map((action) => {
                const active = selectedActionIds.includes(action.id);
                return (
                  <button
                    key={action.id}
                    onClick={() => toggleAction(action.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft",
                      active ? "border-primary/30 bg-[#f6f4ff] dark:bg-primary/15" : "border-slate-100 bg-white dark:border-white/10 dark:bg-white/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold">{action.label}</p>
                        <p className="mt-2 text-sm leading-6 text-muted">{action.description}</p>
                      </div>
                      <span className={cn("grid h-8 w-8 place-items-center rounded-xl", active ? "bg-primary text-white" : "bg-slate-100 text-muted")}>
                        {active ? <CheckCircle2 className="h-4 w-4" /> : <PlusIcon />}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-bold text-muted">
                      <span>-{action.effect}% risk</span>
                      <span>{formatCurrency(action.cost)} cost</span>
                      <span>{action.successRate}% success</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Real-Time Simulation</CardTitle>
                <CardDescription>Before and after risk plus financial impact.</CardDescription>
              </div>
              <Button variant="secondary"><RefreshCw className="h-4 w-4" /> Recalculate</Button>
            </CardHeader>
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-red-100 bg-red-50/60 p-5 text-center dark:border-red-900/40 dark:bg-red-950/20">
                  <RetentionGauge value={selectedCustomer.risk} label="Before Action" compact />
                  <p className="mt-4 text-sm font-bold text-muted">Risk = {selectedCustomer.risk}%</p>
                </div>
                <div className="rounded-3xl border border-green-100 bg-green-50/60 p-5 text-center dark:border-green-900/40 dark:bg-green-950/20">
                  <RetentionGauge value={simulation.afterRisk} label="After Action" compact />
                  <p className="mt-4 text-sm font-bold text-muted">Risk = {simulation.afterRisk}%</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <FinancialCard label="Risk Reduction" value={`${simulation.riskReduction}%`} tone="success" />
                <FinancialCard label="Revenue Saved" value={formatCurrency(simulation.revenueSaved)} tone="success" />
                <FinancialCard label="Cost of Action" value={formatCurrency(simulation.cost)} tone="warning" />
                <FinancialCard label="Expected ROI" value={`${simulation.roi}%`} tone="primary" />
                <FinancialCard label="Retention Probability" value={`${simulation.retentionProbability}%`} tone="success" />
                <FinancialCard label="Confidence" value={`${simulation.confidence}%`} tone="primary" />
              </div>
            </div>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: "Before", risk: selectedCustomer.risk, revenue: selectedCustomer.revenueAtRisk }, { name: "After", risk: simulation.afterRisk, revenue: Math.max(0, selectedCustomer.revenueAtRisk - simulation.revenueSaved) }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" tick={axisTick} />
                  <YAxis tick={axisTick} />
                  <Tooltip contentStyle={chartTooltip} />
                  <Bar dataKey="risk" radius={[12, 12, 0, 0]} fill="#EF4444" name="Risk" />
                  <Bar dataKey="revenue" radius={[12, 12, 0, 0]} fill="#6D5BFF" name="Revenue at risk" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI Recommendation Engine</CardTitle>
              <CardDescription>Best action generated from risk, segment, contract, value and response likelihood.</CardDescription>
            </div>
            <Badge tone="success">{selectedCustomer.confidence}% confidence</Badge>
          </CardHeader>
          <div className="rounded-3xl bg-gradient-to-br from-[#f6f4ff] to-white p-6 dark:from-white/10 dark:to-white/5">
            <p className="text-sm font-extrabold uppercase text-primary">Recommended Action</p>
            <h3 className="mt-2 text-2xl font-extrabold">{selectedCustomer.recommendedAction}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Customer risk is {selectedCustomer.risk}%. This action is expected to reduce risk by {selectedCustomer.expectedRiskReduction}% and protect {formatCurrency(selectedCustomer.expectedRevenueSaved)}.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <InfoTile label="Expected Risk Reduction" value={`${selectedCustomer.expectedRiskReduction}%`} />
              <InfoTile label="Expected Revenue Saved" value={formatCurrency(selectedCustomer.expectedRevenueSaved)} />
              <InfoTile label="Response Likelihood" value={selectedCustomer.responseLikelihood} />
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Retention History</CardTitle>
              <CardDescription>Track action taken, risk before and after, result and revenue impact.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {retentionHistory.map((item, index) => (
              <div key={`${item.action}-${item.date}`} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2efff] text-sm font-extrabold text-primary">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-extrabold">{item.action}</p>
                    <Badge tone={item.result === "Accepted" ? "success" : item.result === "Pending" ? "warning" : "primary"}>{item.result}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{item.date}</p>
                  <p className="mt-2 text-sm text-muted">Risk {item.riskBefore}% to {item.riskAfter}% - Revenue impact {formatCurrency(item.revenueImpact)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </RetentionPage>
  );
}

export function RetentionOpportunitiesPage() {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("All priorities");

  const filteredOpportunities = retentionOpportunities.filter((opportunity) => {
    const matchesQuery = `${opportunity.title} ${opportunity.description} ${opportunity.target}`.toLowerCase().includes(query.toLowerCase());
    const matchesPriority = priority === "All priorities" || opportunity.priority === priority;
    return matchesQuery && matchesPriority;
  });

  return (
    <RetentionPage
      eyebrow="Retention Opportunities"
      title="Find the actions with the highest chance of saving revenue."
      subtitle="Prioritize campaigns by customer response likelihood, implementation cost, expected savings and ROI."
      action={<Button asChild><Link to="/retention/campaigns"><Megaphone className="h-4 w-4" /> Create Campaign</Link></Button>}
    >
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Search strategy, target, ROI or customer group..." />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={priority} onChange={(event) => setPriority(event.target.value)} className="w-48">
              <option>All priorities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
            </Select>
            <Button variant="outline"><SlidersHorizontal className="h-4 w-4" /> Advanced Filters</Button>
            <Button variant="outline"><Download className="h-4 w-4" /> Export</Button>
          </div>
        </div>
      </Card>

      {filteredOpportunities.length ? (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Search} title="No retention opportunities found" description="Try another priority, action or customer segment." />
      )}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Priority Customer Queue</CardTitle>
              <CardDescription>Customers most likely to respond to AI-recommended retention actions.</CardDescription>
            </div>
            <Badge tone="danger">Action required</Badge>
          </CardHeader>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-muted">
                <tr>{["Customer", "Segment", "Risk", "Revenue At Risk", "Recommended Action", "Saved", "Confidence", "Action"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
              </thead>
              <tbody>
                {retentionCustomers.map((customer) => (
                  <tr key={customer.id} className="border-t border-slate-100 dark:border-white/10">
                    <td className="px-4 py-4">
                      <p className="font-extrabold">{customer.name}</p>
                      <p className="text-xs text-muted">{customer.id}</p>
                    </td>
                    <td className="px-4 py-4"><Badge tone="primary">{customer.segment}</Badge></td>
                    <td className="px-4 py-4"><RiskPill value={customer.risk} /></td>
                    <td className="px-4 py-4 font-bold">{formatCurrency(customer.revenueAtRisk)}</td>
                    <td className="px-4 py-4">{customer.recommendedAction}</td>
                    <td className="px-4 py-4 font-bold text-success">{formatCurrency(customer.expectedRevenueSaved)}</td>
                    <td className="px-4 py-4">{customer.confidence}%</td>
                    <td className="px-4 py-4"><Button variant="secondary" size="sm">Add to Campaign</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Retention Segmentation</CardTitle>
              <CardDescription>Response likelihood and revenue concentration.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            {retentionSegments.map((segment) => (
              <div key={segment.name} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{segment.name}</p>
                    <p className="text-sm text-muted">{segment.customers} customers - {segment.value}</p>
                  </div>
                  <Badge tone={segment.rate >= 70 ? "success" : segment.rate >= 60 ? "primary" : "warning"}>{segment.rate}%</Badge>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${segment.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </RetentionPage>
  );
}

export function RetentionCampaignsPage() {
  const totals = retentionCampaigns.reduce(
    (acc, campaign) => ({
      targeted: acc.targeted + campaign.customersTargeted,
      retained: acc.retained + campaign.customersRetained,
      saved: acc.saved + campaign.revenueSaved,
      roi: acc.roi + campaign.roi
    }),
    { targeted: 0, retained: 0, saved: 0, roi: 0 }
  );
  const averageRoi = Math.round(totals.roi / retentionCampaigns.length);

  return (
    <RetentionPage
      eyebrow="Retention Campaigns"
      title="Turn recommendations into measurable save campaigns."
      subtitle="Manage discount, upgrade, support and loyalty campaigns with ROI, success rate and saved revenue."
      action={<Button><Megaphone className="h-4 w-4" /> New Campaign</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Customers Targeted" value={totals.targeted.toLocaleString()} delta="+18%" tone="primary" icon={Users} />
        <MetricCard label="Customers Retained" value={totals.retained.toLocaleString()} delta="+11%" tone="success" icon={ShieldCheck} />
        <MetricCard label="Revenue Saved" value={formatCurrency(totals.saved)} delta="+22%" tone="success" icon={CircleDollarSign} />
        <MetricCard label="Campaign ROI" value={`${averageRoi}%`} delta="Avg" tone="primary" icon={TrendingUp} />
        <MetricCard label="Success Rate" value="68%" delta="+6.1%" tone="success" icon={BadgeCheck} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Campaign Manager</CardTitle>
              <CardDescription>Campaign type, audience, retained customers, revenue saved and ROI.</CardDescription>
            </div>
            <Badge tone="primary">{retentionCampaigns.length} campaigns</Badge>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {retentionCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <CampaignStatusBadge status={campaign.status} />
                </div>
                <h3 className="mt-5 text-lg font-extrabold">{campaign.name}</h3>
                <p className="mt-1 text-sm text-muted">{campaign.type} - Owner: {campaign.owner}</p>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <InfoTile label="Targeted" value={campaign.customersTargeted.toLocaleString()} />
                  <InfoTile label="Retained" value={campaign.customersRetained.toLocaleString()} />
                  <InfoTile label="Success" value={`${campaign.successRate}%`} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <InfoTile label="Revenue Saved" value={formatCurrency(campaign.revenueSaved)} />
                  <InfoTile label="ROI" value={`${campaign.roi}%`} />
                </div>
                <div className="mt-5 flex gap-2">
                  <Button variant="secondary" className="flex-1"><Play className="h-4 w-4" /> Launch</Button>
                  <Button variant="outline" className="flex-1">View</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <ChartCard title="Campaign Performance" description="Saved revenue, ROI and success by campaign type.">
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={campaignPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="saved" fill="#6D5BFF" radius={[12, 12, 0, 0]} name="Revenue saved" />
              <Line type="monotone" dataKey="success" stroke="#22C55E" strokeWidth={3} name="Success rate" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Bulk Retention Actions</CardTitle>
            <CardDescription>Create campaigns directly from recommendations and selected high-risk customers.</CardDescription>
          </div>
          <Badge tone="danger">421 customers eligible</Badge>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-4">
          {["Add Critical Customers to Save Desk", "Create Campaign from Recommendation", "Bulk Apply Support Upgrade", "Export Executive Campaign Plan"].map((action, index) => (
            <button key={action} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left font-extrabold transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-[#f6f4ff] hover:text-primary dark:border-white/10 dark:bg-white/5">
              <span className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-white text-primary shadow-sm dark:bg-slate-900">{index + 1}</span>
              {action}
            </button>
          ))}
        </div>
      </Card>
    </RetentionPage>
  );
}

export function RetentionPlaybooksPage() {
  const [activeId, setActiveId] = useState(retentionPlaybooks[0]?.id ?? "");
  const fallbackPlaybook = retentionPlaybooks[0]!;
  const activePlaybook = retentionPlaybooks.find((playbook) => playbook.id === activeId) ?? fallbackPlaybook;

  return (
    <RetentionPage
      eyebrow="Retention Playbooks"
      title="Strategy library for every churn scenario."
      subtitle="Reusable AI-guided playbooks for high-risk, VIP, contract risk, revenue risk and new customers."
      action={<Button asChild variant="outline"><Link to="/retention/opportunities"><Target className="h-4 w-4" /> View Opportunities</Link></Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Playbook Library</CardTitle>
              <CardDescription>Select a strategy to inspect audience, actions, ROI and success rate.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {retentionPlaybooks.map((playbook) => (
              <button
                key={playbook.id}
                onClick={() => setActiveId(playbook.id)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/30",
                  activePlaybook.id === playbook.id ? "border-primary/30 bg-[#f6f4ff] shadow-sm dark:bg-primary/15" : "border-slate-100 bg-white dark:border-white/10 dark:bg-white/5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{playbook.title}</p>
                    <p className="mt-1 text-sm text-muted">{playbook.audience}</p>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 text-muted", activePlaybook.id === playbook.id && "text-primary")} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{activePlaybook.title}</CardTitle>
              <CardDescription>{activePlaybook.description}</CardDescription>
            </div>
            <Badge tone="success">{activePlaybook.successRate}% success</Badge>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoTile label="Target Audience" value={activePlaybook.audience} />
            <InfoTile label="Expected ROI" value={activePlaybook.expectedRoi} />
            <InfoTile label="Expected Results" value={activePlaybook.expectedResults} />
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="font-extrabold">Recommended Actions</h3>
              <div className="mt-4 space-y-3">
                {activePlaybook.recommendedActions.map((action, index) => (
                  <div key={action} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f2efff] text-xs font-extrabold text-primary">{index + 1}</span>
                    <p className="text-sm font-bold">{action}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-extrabold">Best For</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {activePlaybook.bestFor.map((item) => (
                  <Badge key={item} tone="primary">{item}</Badge>
                ))}
              </div>
              <div className="mt-6 rounded-3xl border border-green-100 bg-green-50 p-5 dark:border-green-900/40 dark:bg-green-950/20">
                <p className="font-extrabold text-success">Playbook Details</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Use this playbook when the goal is to reduce churn risk with a measurable revenue outcome. Track risk before and after each action.
                </p>
                <Button className="mt-5 w-full">Launch Playbook</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </RetentionPage>
  );
}

function ExecutiveHero() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-white via-[#f7f5ff] to-[#effcff] p-0 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <div>
          <Badge tone="primary">AI Retention Summary</Badge>
          <h2 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-normal text-ink dark:text-white md:text-4xl">
            The next best action is now part of the product.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            CHURNIQ AI connects churn probability, revenue exposure, retention actions and expected ROI so teams know what to do next.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {aiRetentionSummary.map((summary, index) => (
              <motion.div
                key={summary}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-white/80 bg-white/82 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f2efff] text-xs font-extrabold text-primary">{index + 1}</span>
                  <p className="text-sm font-bold leading-6">{summary}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-white/78 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-muted">Most effective strategy</p>
              <h3 className="mt-2 text-2xl font-extrabold">Technical Support Upgrade</h3>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white shadow-soft">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              ["Expected Risk Reduction", "18%"],
              ["Expected Revenue Saved", "$11,200"],
              ["Expected Success Rate", "72%"],
              ["Affected Customers", "245"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <span className="text-sm font-bold text-muted">{label}</span>
                <span className="text-lg font-extrabold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function RetentionPage({
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
          <Button asChild variant="secondary"><Link to="/copilot"><BrainCircuit className="h-4 w-4" /> Ask Copilot</Link></Button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
        {pageTabs.map((tab) => (
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

function RetentionSection({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
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

function MetricCard({ label, value, delta, tone, icon: Icon }: { label: string; value: string; delta: string; tone: RetentionTone; icon: LucideIcon }) {
  return (
    <Card className="transition hover:-translate-y-1 hover:border-primary/30">
      <div className="flex items-start justify-between gap-4">
        <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", toneSurface(tone), toneText(tone))}>
          <Icon className="h-5 w-5" />
        </div>
        <Badge tone={badgeTone(tone)}>{delta}</Badge>
      </div>
      <p className="mt-5 text-sm font-semibold text-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </Card>
  );
}

function OpportunityCard({ opportunity }: { opportunity: RetentionOpportunity }) {
  const Icon = opportunityIcons[opportunity.id] ?? Target;
  return (
    <Card className="transition hover:-translate-y-1 hover:border-primary/30">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <Badge tone={opportunity.priority === "Critical" ? "danger" : opportunity.priority === "High" ? "warning" : "primary"}>{opportunity.priority}</Badge>
      </div>
      <h3 className="mt-5 text-xl font-extrabold">{opportunity.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{opportunity.description}</p>
      <p className="mt-3 text-xs font-extrabold uppercase text-primary">{opportunity.target}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <ImpactMetric label="Risk Reduction" value={`${opportunity.estimatedRiskReduction}%`} tone="success" />
        <ImpactMetric label="Revenue Saved" value={formatCurrency(opportunity.estimatedRevenueSaved)} tone="success" />
        <ImpactMetric label="Success Rate" value={`${opportunity.expectedSuccessRate}%`} tone="primary" />
        <ImpactMetric label="Affected" value={opportunity.affectedCustomers.toString()} tone="warning" />
        <ImpactMetric label="Cost" value={formatCurrency(opportunity.implementationCost)} tone="warning" />
        <ImpactMetric label="ROI" value={`${opportunity.roi}%`} tone="primary" />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-muted">
          <Sparkles className="h-4 w-4 text-primary" />
          {opportunity.confidence}% confidence
        </div>
        <Button variant="secondary" size="sm">Create Play</Button>
      </div>
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

function PriorityHeatmap() {
  const riskRows = ["Critical", "High", "Medium"];
  const valueColumns = ["High Value", "Mid Value", "Low Value"];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        <div className="grid grid-cols-[100px_repeat(3,1fr)] gap-2 text-xs font-extrabold uppercase text-muted">
          <span />
          {valueColumns.map((value) => <span key={value} className="px-2">{value}</span>)}
        </div>
        <div className="mt-2 grid gap-2">
          {riskRows.map((risk) => (
            <div key={risk} className="grid grid-cols-[100px_repeat(3,1fr)] gap-2">
              <span className="flex items-center text-sm font-extrabold">{risk}</span>
              {valueColumns.map((value) => {
                const cell = riskValueHeatmap.find((item) => item.risk === risk && item.value === value);
                const priority = cell?.priority ?? 0;
                return (
                  <div
                    key={`${risk}-${value}`}
                    className="rounded-2xl p-4 text-white shadow-sm"
                    style={{ background: heatColor(priority) }}
                  >
                    <p className="text-xl font-extrabold">{cell?.customers ?? 0}</p>
                    <p className="text-xs font-bold text-white/80">Priority {priority}</p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RetentionGauge({ value, label, compact = false }: { value: number; label: string; compact?: boolean }) {
  const color = riskColor(value);
  const size = compact ? "h-40 w-40" : "h-56 w-56";
  const inner = compact ? "inset-4" : "inset-5";

  return (
    <div className={cn("relative", size)}>
      <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(${color} 0 ${value}%, #E9ECF8 ${value}% 100%)` }} />
      <div className={cn("absolute grid place-items-center rounded-full bg-white dark:bg-slate-950", inner)}>
        <div className="text-center">
          <p className={cn("font-extrabold", compact ? "text-3xl" : "text-5xl")}>{value}%</p>
          <p className="mt-2 text-xs font-extrabold uppercase" style={{ color }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="mt-2 break-words text-lg font-extrabold">{value}</p>
    </div>
  );
}

function ImpactMetric({ label, value, tone }: { label: string; value: string; tone: RetentionTone }) {
  return (
    <div className={cn("rounded-2xl p-3", toneSurface(tone))}>
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className={cn("mt-1 text-lg font-extrabold", toneText(tone))}>{value}</p>
    </div>
  );
}

function FinancialCard({ label, value, tone }: { label: string; value: string; tone: RetentionTone }) {
  return (
    <div className={cn("rounded-2xl p-4", toneSurface(tone))}>
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className={cn("mt-2 text-2xl font-extrabold", toneText(tone))}>{value}</p>
    </div>
  );
}

function RiskPill({ value }: { value: number }) {
  return <Badge tone={riskTone(value)}>{value}% {riskLabel(value)}</Badge>;
}

function CampaignStatusBadge({ status }: { status: string }) {
  const tone: BadgeTone = status === "Active" ? "success" : status === "Draft" ? "warning" : status === "Completed" ? "primary" : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}

function PlusIcon() {
  return <Zap className="h-4 w-4" />;
}

function calculateSimulation(customer: RetentionCustomer, actions: RetentionAction[]) {
  const riskReduction = Math.min(44, actions.reduce((total, action) => total + action.effect, 0));
  const afterRisk = Math.max(8, customer.risk - riskReduction);
  const cost = actions.reduce((total, action) => total + action.cost, 0);
  const revenueMultiplier = actions.reduce((total, action) => total + action.revenueMultiplier, 0);
  const revenueSaved = Math.round(customer.revenueAtRisk * (riskReduction / Math.max(customer.risk, 1)) + customer.monthlyRevenue * revenueMultiplier);
  const roi = cost > 0 ? Math.round(((revenueSaved - cost) / cost) * 100) : 0;
  const averageSuccess = actions.length ? Math.round(actions.reduce((total, action) => total + action.successRate, 0) / actions.length) : 38;
  const retentionProbability = Math.min(96, Math.round(100 - afterRisk + averageSuccess * 0.2));
  const confidence = Math.min(97, Math.round(82 + actions.length * 3 + riskReduction * 0.12));

  return { riskReduction, afterRisk, cost, revenueSaved, roi, retentionProbability, confidence };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function riskColor(value: number) {
  if (value >= 80) return "#EF4444";
  if (value >= 60) return "#F97316";
  if (value >= 40) return "#F59E0B";
  return "#22C55E";
}

function riskLabel(value: number) {
  if (value >= 80) return "Critical";
  if (value >= 60) return "High";
  if (value >= 40) return "Medium";
  return "Low";
}

function riskTone(value: number): BadgeTone {
  if (value >= 80) return "danger";
  if (value >= 60) return "warning";
  if (value >= 40) return "warning";
  return "success";
}

function badgeTone(tone: RetentionTone): BadgeTone {
  if (tone === "danger") return "danger";
  if (tone === "warning") return "warning";
  if (tone === "success") return "success";
  return "primary";
}

function toneText(tone: RetentionTone) {
  if (tone === "danger") return "text-danger";
  if (tone === "warning") return "text-warning";
  if (tone === "success") return "text-success";
  return "text-primary";
}

function toneSurface(tone: RetentionTone) {
  if (tone === "danger") return "bg-red-50 dark:bg-red-950/20";
  if (tone === "warning") return "bg-amber-50 dark:bg-amber-950/20";
  if (tone === "success") return "bg-green-50 dark:bg-green-950/20";
  return "bg-[#f2efff] dark:bg-primary/15";
}

function heatColor(priority: number) {
  if (priority >= 90) return "linear-gradient(135deg,#EF4444,#8B5CF6)";
  if (priority >= 75) return "linear-gradient(135deg,#F97316,#EF4444)";
  if (priority >= 55) return "linear-gradient(135deg,#F59E0B,#F97316)";
  return "linear-gradient(135deg,#6D5BFF,#00D4FF)";
}
