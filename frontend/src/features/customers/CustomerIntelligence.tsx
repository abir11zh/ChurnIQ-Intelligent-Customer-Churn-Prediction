import { useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
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
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
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
  AlertTriangle,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Crown,
  Download,
  Eye,
  FileText,
  Filter,
  Flame,
  Gauge,
  History,
  Mail,
  MoreHorizontal,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Users,
  X,
  type LucideIcon
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input, Select } from "../../components/ui/input";
import { EmptyState } from "../../components/common/States";
import { useToast } from "../../components/common/ToastProvider";
import { downloadCsv } from "../../lib/exportUtils";
import { cn } from "../../lib/utils";
import {
  crmSegmentSummaries,
  customerCrmRecords,
  getCustomerByRouteId,
  segmentRiskHeatmap,
  segmentScatterPoints,
  type CustomerCrmRecord,
  type CustomerRisk,
  type CustomerSegment
} from "./customerCrmData";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

type CustomerFilters = {
  riskLevel: string;
  segment: string;
  contract: string;
  internetService: string;
  paymentMethod: string;
  tenureRange: string;
  monthlyChargesRange: string;
  churnRange: string;
  healthRange: string;
  seniorCitizen: string;
  techSupport: string;
  onlineSecurity: string;
};

const defaultFilters: CustomerFilters = {
  riskLevel: "All risks",
  segment: "All segments",
  contract: "All contracts",
  internetService: "All services",
  paymentMethod: "All payments",
  tenureRange: "Any tenure",
  monthlyChargesRange: "Any charges",
  churnRange: "Any churn",
  healthRange: "Any health",
  seniorCitizen: "All customers",
  techSupport: "Any support",
  onlineSecurity: "Any security"
};

const chartTooltip = {
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  boxShadow: "0 20px 45px rgba(17, 24, 39, 0.08)"
};

const axisTick = { fill: "#64748B", fontSize: 11, fontWeight: 700 };
const gridStroke = "#EEF2FF";

const segmentMeta: Record<CustomerSegment, { tone: BadgeTone; icon: LucideIcon; description: string; className: string }> = {
  VIP: {
    tone: "primary",
    icon: Crown,
    description: "Premium customer with high revenue contribution.",
    className: "bg-[#f2efff] text-primary"
  },
  Loyal: {
    tone: "success",
    icon: BadgeCheck,
    description: "Long-tenure customer with strong retention behavior.",
    className: "bg-green-50 text-green-600"
  },
  "At Risk": {
    tone: "danger",
    icon: AlertTriangle,
    description: "Customer requires immediate retention action.",
    className: "bg-red-50 text-red-600"
  },
  New: {
    tone: "warning",
    icon: Sparkles,
    description: "Recently acquired customer in onboarding phase.",
    className: "bg-amber-50 text-amber-600"
  },
  Dormant: {
    tone: "danger",
    icon: Bell,
    description: "Low engagement with elevated risk signals.",
    className: "bg-rose-50 text-rose-600"
  },
  "High Value": {
    tone: "primary",
    icon: CircleDollarSign,
    description: "Large revenue account needing premium care.",
    className: "bg-cyan-50 text-cyan-600"
  }
};

const riskMeta: Record<CustomerRisk, { tone: BadgeTone; icon: LucideIcon; color: string; className: string }> = {
  Low: { tone: "success", icon: CheckCircle2, color: "#22C55E", className: "bg-green-50 text-green-600" },
  Medium: { tone: "warning", icon: Activity, color: "#F59E0B", className: "bg-amber-50 text-amber-600" },
  High: { tone: "warning", icon: Flame, color: "#F97316", className: "bg-orange-50 text-orange-600" },
  Critical: { tone: "danger", icon: AlertTriangle, color: "#EF4444", className: "bg-red-50 text-red-600" }
};

function customerExportRows(customers: CustomerCrmRecord[]) {
  return customers.map((customer) => ({
    customerId: customer.customerId,
    name: customer.name,
    email: customer.email,
    contract: customer.contract,
    tenure: customer.tenure,
    monthlyCharges: customer.monthlyCharges,
    totalCharges: customer.totalCharges,
    segment: customer.segment,
    healthScore: customer.healthScore,
    churnProbability: customer.churnProbability,
    riskLevel: customer.riskLevel,
    lastPrediction: customer.lastPrediction,
    lifetimeValue: customer.lifetimeValue,
    revenueContribution: customer.revenueContribution
  }));
}

function exportCustomers(name: string, customers: CustomerCrmRecord[]) {
  return downloadCsv(name, customerExportRows(customers));
}

function exportSegments() {
  return downloadCsv("customer_segments", [
    ...crmSegmentSummaries.map((segment) => ({
      section: "segment_summary",
      segment: segment.name,
      customers: segment.customers,
      avgChurnProbability: segment.avgChurnProbability,
      avgRevenue: segment.avgRevenue,
      retentionRate: segment.retentionRate,
      strategy: segment.strategy
    })),
    ...segmentRiskHeatmap.map((row) => ({ section: "risk_heatmap", ...row })),
    ...segmentScatterPoints.map((row) => ({ section: "scatter_plot", ...row }))
  ]);
}

export function CustomerIntelligencePage() {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<CustomerFilters>(defaultFilters);
  const [selected, setSelected] = useState<string[]>([]);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredCustomers = useMemo(() => {
    return customerCrmRecords.filter((customer) => {
      const searchText = [
        customer.name,
        customer.email,
        customer.customerId,
        customer.contract,
        customer.segment,
        customer.riskLevel
      ].join(" ").toLowerCase();
      if (query.trim() && !searchText.includes(query.trim().toLowerCase())) return false;
      if (filters.riskLevel !== "All risks" && customer.riskLevel !== filters.riskLevel) return false;
      if (filters.segment !== "All segments" && customer.segment !== filters.segment) return false;
      if (filters.contract !== "All contracts" && customer.contract !== filters.contract) return false;
      if (filters.internetService !== "All services" && customer.internetService !== filters.internetService) return false;
      if (filters.paymentMethod !== "All payments" && customer.paymentMethod !== filters.paymentMethod) return false;
      if (filters.seniorCitizen === "Senior only" && !customer.seniorCitizen) return false;
      if (filters.seniorCitizen === "Non-senior only" && customer.seniorCitizen) return false;
      if (filters.techSupport === "Has tech support" && !customer.techSupport) return false;
      if (filters.techSupport === "No tech support" && customer.techSupport) return false;
      if (filters.onlineSecurity === "Has online security" && !customer.onlineSecurity) return false;
      if (filters.onlineSecurity === "No online security" && customer.onlineSecurity) return false;
      if (!matchesRange(customer.tenure, filters.tenureRange)) return false;
      if (!matchesRange(customer.monthlyCharges, filters.monthlyChargesRange)) return false;
      if (!matchesRange(customer.churnProbability, filters.churnRange)) return false;
      if (!matchesRange(customer.healthScore, filters.healthRange)) return false;
      return true;
    });
  }, [filters, query]);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return customerCrmRecords.slice(0, 4);
    return customerCrmRecords.filter((customer) => `${customer.name} ${customer.email} ${customer.customerId}`.toLowerCase().includes(normalized)).slice(0, 4);
  }, [query]);

  const toggleSelected = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const toggleAll = () => {
    setSelected((current) => current.length === filteredCustomers.length ? [] : filteredCustomers.map((customer) => customer.customerId));
  };

  const selectedCustomers = filteredCustomers.filter((customer) => selected.includes(customer.customerId));

  const handleExportFiltered = () => {
    const filename = exportCustomers("customers_filtered", filteredCustomers);
    toast({ tone: "success", title: "Customer export ready", description: filename });
  };

  const handleExportSelected = () => {
    const filename = exportCustomers("customers_selected", selectedCustomers);
    toast({ tone: "success", title: "Selected customers exported", description: filename });
  };

  const handleExportCustomer = (customer: CustomerCrmRecord) => {
    const filename = exportCustomers(`customer_${customer.customerId}`, [customer]);
    toast({ tone: "success", title: "Customer exported", description: filename });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <CustomerListHeader />
      <CustomerSummaryCards />
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-10"
              placeholder="Search by name, email, customer ID, contract, segment or risk level..."
            />
            {query && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-14 z-20 rounded-2xl border border-slate-100 bg-white p-2 shadow-soft dark:border-white/10 dark:bg-slate-900">
                {suggestions.map((customer) => (
                  <button key={customer.customerId} onClick={() => setQuery(customer.name)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#f6f4ff]">
                    <CustomerAvatar customer={customer} size="sm" />
                    <div>
                      <p className="text-sm font-extrabold">{customer.name}</p>
                      <p className="text-xs text-muted">{customer.customerId} - {customer.segment}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setFiltersOpen((value) => !value)}><Filter className="h-4 w-4" /> Advanced Filters</Button>
            <Button variant="outline" onClick={handleExportFiltered}><Download className="h-4 w-4" /> Export</Button>
            <Button><Users className="h-4 w-4" /> Add Customer</Button>
          </div>
        </div>

        {filtersOpen && <CustomerFilterPanel filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />}

        <div className="mt-5 flex flex-wrap gap-2">
          {["High risk", "Month-to-month", "No tech support", "High value", "New customers", "Critical churn"].map((chip) => (
            <button key={chip} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-muted transition hover:bg-[#f2efff] hover:text-primary dark:bg-white/5">
              {chip}
            </button>
          ))}
        </div>

        {selected.length > 0 && <BulkActionBar count={selected.length} onClear={() => setSelected([])} onExport={handleExportSelected} />}

        <div className="mt-5 overflow-x-auto scrollbar-thin">
          {filteredCustomers.length ? (
            <table className="w-full min-w-[1520px] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="px-4 py-3"><input type="checkbox" checked={selected.length === filteredCustomers.length} onChange={toggleAll} /></th>
                  {["Customer", "Email", "Customer ID", "Contract Type", "Tenure", "Monthly Charges", "Total Charges", "Segment", "Health Score", "Churn Probability", "Risk Level", "Last Prediction", "Actions"].map((header) => (
                    <th key={header} className="px-4 py-3 font-extrabold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.customerId} className="border-t border-slate-100 transition hover:bg-[#fbfaff] dark:border-white/10 dark:hover:bg-white/5">
                    <td className="px-4 py-4"><input type="checkbox" checked={selected.includes(customer.customerId)} onChange={() => toggleSelected(customer.customerId)} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <CustomerAvatar customer={customer} />
                        <div>
                          <Link to={`/customers/${customer.customerId}`} className="font-extrabold text-ink hover:text-primary dark:text-white">{customer.name}</Link>
                          <p className="text-xs text-muted">{customer.gender} - {customer.customerSince}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted">{customer.email}</td>
                    <td className="px-4 py-4 font-bold text-primary">{customer.customerId}</td>
                    <td className="px-4 py-4">{customer.contract}</td>
                    <td className="px-4 py-4">{customer.tenure} mo</td>
                    <td className="px-4 py-4">${customer.monthlyCharges.toFixed(2)}</td>
                    <td className="px-4 py-4">${customer.totalCharges.toLocaleString()}</td>
                    <td className="px-4 py-4"><SegmentBadge segment={customer.segment} /></td>
                    <td className="px-4 py-4"><HealthMiniGauge score={customer.healthScore} /></td>
                    <td className="px-4 py-4"><ChurnProbability probability={customer.churnProbability} risk={customer.riskLevel} /></td>
                    <td className="px-4 py-4"><RiskBadge risk={customer.riskLevel} /></td>
                    <td className="px-4 py-4 text-muted">{customer.lastPrediction}</td>
                    <td className="relative px-4 py-4">
                      <Button variant="ghost" size="icon" onClick={() => setActionMenu((current) => current === customer.customerId ? null : customer.customerId)}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                          {actionMenu === customer.customerId && <CustomerActionMenu customer={customer} onClose={() => setActionMenu(null)} onExport={() => handleExportCustomer(customer)} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState icon={Search} title="No customers found" description="Try a different search, clear filters, or import a customer file." actionLabel="Clear filters" onAction={() => setFilters(defaultFilters)} />
          )}
        </div>
      </Card>
    </div>
  );
}

export function CustomerProfilePage() {
  const { id } = useParams();
  const customer = getCustomerByRouteId(id);
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <CustomerProfileHeader customer={customer} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CustomerKpiCard title="Churn Probability" value={`${customer.churnProbability}%`} icon={AlertTriangle} tone={customer.riskLevel === "Critical" ? "danger" : "warning"} />
        <CustomerKpiCard title="Customer Health Score" value={`${customer.healthScore}/100`} icon={Gauge} tone={customer.healthScore >= 70 ? "success" : customer.healthScore >= 50 ? "warning" : "danger"} />
        <CustomerKpiCard title="Lifetime Value" value={`$${customer.lifetimeValue.toLocaleString()}`} icon={CircleDollarSign} tone="primary" />
        <CustomerKpiCard title="Monthly Charges" value={`$${customer.monthlyCharges.toFixed(2)}`} icon={FileText} tone="neutral" />
        <CustomerKpiCard title="Total Charges" value={`$${customer.totalCharges.toLocaleString()}`} icon={CircleDollarSign} tone="success" />
        <CustomerKpiCard title="Tenure" value={`${customer.tenure} mo`} icon={History} tone="primary" />
        <CustomerKpiCard title="Revenue Contribution" value={`$${customer.revenueContribution.toLocaleString()}`} icon={Activity} tone="success" />
        <CustomerKpiCard title="Retention Probability" value={`${customer.retentionProbability}%`} icon={ShieldCheck} tone={customer.retentionProbability >= 70 ? "success" : "warning"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <RiskGaugeSection customer={customer} />
        <CustomerInsightsPanel customer={customer} />
      </div>

      <Card>
        <Tabs tabs={["Overview", "Services", "Billing", "Predictions", "SHAP Explanation", "Retention", "Timeline"]} active={activeTab} onChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === "Overview" && <OverviewTab customer={customer} />}
          {activeTab === "Services" && <ServicesTab customer={customer} />}
          {activeTab === "Billing" && <BillingTab customer={customer} />}
          {activeTab === "Predictions" && <PredictionsTab customer={customer} />}
          {activeTab === "SHAP Explanation" && <ShapPreviewTab />}
          {activeTab === "Retention" && <RetentionTab customer={customer} />}
          {activeTab === "Timeline" && <TimelineTab customer={customer} />}
        </div>
      </Card>
    </div>
  );
}

export function CustomerSegmentsPage() {
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment>("At Risk");
  const { toast } = useToast();
  const selected = crmSegmentSummaries.find((segment) => segment.name === selectedSegment) ?? crmSegmentSummaries[0];
  const segmentDistribution = crmSegmentSummaries.map((segment) => ({
    name: segment.name,
    value: segment.customers,
    color: segmentColor(segment.name)
  }));

  const handleExport = () => {
    const filename = exportSegments();
    toast({ tone: "success", title: "Segments export ready", description: filename });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge tone="primary">Customer Segmentation</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-ink dark:text-white">Customer intelligence segments</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Prioritize retention, revenue protection and expansion strategies by customer segment.</p>
        </div>
        <Button onClick={handleExport}><Download className="h-4 w-4" /> Export Segments</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {crmSegmentSummaries.map((segment) => (
          <button key={segment.name} onClick={() => setSelectedSegment(segment.name)} className="text-left">
            <Card className={cn("h-full transition hover:-translate-y-1 hover:shadow-soft", selectedSegment === segment.name && "border-primary/30 ring-4 ring-primary/10")}>
              <div className="flex items-start justify-between gap-3">
                <SegmentBadge segment={segment.name} />
                <ChevronDown className="h-4 w-4 text-muted" />
              </div>
              <p className="mt-5 text-3xl font-extrabold">{segment.customers.toLocaleString()}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{segment.description}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Avg Risk" value={`${segment.avgChurnProbability}%`} />
                <MiniStat label="Avg Revenue" value={`$${segment.avgRevenue}`} />
                <MiniStat label="Retention" value={`${segment.retentionRate}%`} />
              </div>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Segment Distribution</CardTitle>
              <CardDescription>Total customers by segment.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentDistribution} dataKey="value" nameKey="name" innerRadius={72} outerRadius={112} paddingAngle={4}>
                  {segmentDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue by Segment</CardTitle>
              <CardDescription>Average revenue and risk exposure.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crmSegmentSummaries} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={chartTooltip} />
                <Bar dataKey="avgRevenue" radius={[12, 12, 0, 0]} fill="#6D5BFF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SegmentHeatmap />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Customer Segment Scatter Plot</CardTitle>
              <CardDescription>Tenure, revenue and churn risk by segment.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis type="number" dataKey="tenure" name="Tenure" tick={axisTick} />
                <YAxis type="number" dataKey="revenue" name="Revenue" tick={axisTick} />
                <ZAxis type="number" dataKey="risk" range={[140, 620]} />
                <Tooltip contentStyle={chartTooltip} />
                <Scatter data={segmentScatterPoints} fill="#6D5BFF" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f8f7ff] dark:from-slate-900 dark:to-slate-950">
        <CardHeader>
          <div>
            <SegmentBadge segment={selected.name} />
            <CardTitle className="mt-3">{selected.name} Segment Details</CardTitle>
            <CardDescription>{selected.description}</CardDescription>
          </div>
          <Badge tone={segmentMeta[selected.name].tone}>{selected.retentionRate}% retention</Badge>
        </CardHeader>
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-3">
            <MiniStat label="Total Customers" value={selected.customers.toLocaleString()} />
            <MiniStat label="Average Churn Probability" value={`${selected.avgChurnProbability}%`} />
            <MiniStat label="Average Revenue" value={`$${selected.avgRevenue}`} />
            <MiniStat label="Recommended Strategy" value={selected.strategy} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {customerCrmRecords.filter((customer) => customer.segment === selected.name).slice(0, 4).map((customer) => (
              <Link key={customer.customerId} to={`/customers/${customer.customerId}`} className="rounded-2xl bg-white/82 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <CustomerAvatar customer={customer} />
                  <div>
                    <p className="font-extrabold">{customer.name}</p>
                    <p className="text-xs text-muted">{customer.customerId}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <RiskBadge risk={customer.riskLevel} />
                  <span className="text-sm font-extrabold">{customer.churnProbability}% churn</span>
                </div>
              </Link>
            ))}
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="font-extrabold">Recommended Campaigns</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Save Desk", "Support Bundle", "Annual Upgrade", "Loyalty Credit"].map((campaign) => (
                  <Badge key={campaign} tone="primary">{campaign}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CustomerListHeader() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-soft dark:border-white/10 dark:bg-slate-900/80">
      <div className="grid gap-6 bg-gradient-to-br from-[#fbfbff] via-white to-[#effcff] p-6 lg:grid-cols-[1fr_360px] lg:p-8">
        <div>
          <Badge tone="primary">Customer Intelligence CRM</Badge>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-normal text-ink dark:text-white">
            Customer profiles, churn risk and retention actions in one premium workspace.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            Identify risky customers, understand why they are risky, quantify business value and launch retention actions from the customer list.
          </p>
        </div>
        <div className="rounded-3xl border border-white bg-white/82 p-5 shadow-glass dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs font-extrabold uppercase text-muted">CRM Intelligence Pulse</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat label="Customers" value="7,043" />
            <MiniStat label="High Risk" value="421" />
            <MiniStat label="Revenue at Risk" value="$45K" />
            <MiniStat label="Retention Plays" value="68" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerSummaryCards() {
  const cards = [
    { label: "VIP", value: "842", text: "Premium accounts", icon: Crown, tone: "primary" },
    { label: "Loyal", value: "2,418", text: "Stable customers", icon: BadgeCheck, tone: "success" },
    { label: "At Risk", value: "1,234", text: "Need retention", icon: AlertTriangle, tone: "danger" },
    { label: "New", value: "689", text: "Onboarding cohort", icon: Sparkles, tone: "warning" },
    { label: "Dormant", value: "426", text: "Low engagement", icon: Bell, tone: "danger" },
    { label: "High Value", value: "713", text: "Revenue priority", icon: CircleDollarSign, tone: "primary" }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label} className="transition hover:-translate-y-1 hover:shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <Badge tone={card.tone as BadgeTone}>{card.label}</Badge>
            <card.icon className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-4 text-3xl font-extrabold">{card.value}</p>
          <p className="mt-1 text-sm text-muted">{card.text}</p>
        </Card>
      ))}
    </div>
  );
}

function CustomerFilterPanel({ filters, onChange, onReset }: { filters: CustomerFilters; onChange: (filters: CustomerFilters) => void; onReset: () => void }) {
  const update = (key: keyof CustomerFilters, value: string) => onChange({ ...filters, [key]: value });
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-3xl border border-slate-100 bg-[#fbfbff] p-4 dark:border-white/10 dark:bg-white/5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <FilterSelect label="Risk Level" value={filters.riskLevel} options={["All risks", "Low", "Medium", "High", "Critical"]} onChange={(value) => update("riskLevel", value)} />
        <FilterSelect label="Customer Segment" value={filters.segment} options={["All segments", "VIP", "Loyal", "At Risk", "New", "Dormant", "High Value"]} onChange={(value) => update("segment", value)} />
        <FilterSelect label="Contract Type" value={filters.contract} options={["All contracts", "Month-to-month", "One year", "Two year"]} onChange={(value) => update("contract", value)} />
        <FilterSelect label="Internet Service" value={filters.internetService} options={["All services", "Fiber optic", "DSL", "No internet service"]} onChange={(value) => update("internetService", value)} />
        <FilterSelect label="Payment Method" value={filters.paymentMethod} options={["All payments", "Electronic check", "Mailed check", "Bank transfer", "Credit card"]} onChange={(value) => update("paymentMethod", value)} />
        <FilterSelect label="Tenure Range" value={filters.tenureRange} options={["Any tenure", "0-12", "13-36", "37+"]} onChange={(value) => update("tenureRange", value)} />
        <FilterSelect label="Monthly Charges" value={filters.monthlyChargesRange} options={["Any charges", "0-50", "51-80", "81+"]} onChange={(value) => update("monthlyChargesRange", value)} />
        <FilterSelect label="Churn Probability" value={filters.churnRange} options={["Any churn", "0-30", "31-60", "61+"]} onChange={(value) => update("churnRange", value)} />
        <FilterSelect label="Health Score" value={filters.healthRange} options={["Any health", "0-49", "50-69", "70+"]} onChange={(value) => update("healthRange", value)} />
        <FilterSelect label="Senior Citizen" value={filters.seniorCitizen} options={["All customers", "Senior only", "Non-senior only"]} onChange={(value) => update("seniorCitizen", value)} />
        <FilterSelect label="Tech Support" value={filters.techSupport} options={["Any support", "Has tech support", "No tech support"]} onChange={(value) => update("techSupport", value)} />
        <FilterSelect label="Online Security" value={filters.onlineSecurity} options={["Any security", "Has online security", "No online security"]} onChange={(value) => update("onlineSecurity", value)} />
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={onReset}><X className="h-4 w-4" /> Clear filters</Button>
      </div>
    </motion.div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-muted">
      {label}
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </Select>
    </label>
  );
}

function BulkActionBar({ count, onClear, onExport }: { count: number; onClear: () => void; onExport: () => void }) {
  return (
    <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-primary/15 bg-[#f6f4ff] p-4 sm:flex-row sm:items-center">
      <p className="text-sm font-extrabold text-primary">{count} customers selected</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm"><Play className="h-4 w-4" /> Run Batch Prediction</Button>
        <Button size="sm" variant="outline"><Target className="h-4 w-4" /> Add to Campaign</Button>
        <Button size="sm" variant="outline" onClick={onExport}><Download className="h-4 w-4" /> Export Selected</Button>
        <Button size="sm" variant="outline"><CheckCircle2 className="h-4 w-4" /> Mark Reviewed</Button>
        <Button size="sm" variant="ghost" onClick={onClear}>Clear</Button>
      </div>
    </div>
  );
}

function CustomerActionMenu({ customer, onClose, onExport }: { customer: CustomerCrmRecord; onClose: () => void; onExport: () => void }) {
  const actions = [
    { label: "View Profile", icon: Eye, href: `/customers/${customer.customerId}` },
    { label: "Run Prediction", icon: Play, href: "/predictions/single" },
    { label: "View SHAP Explanation", icon: Sparkles, href: "/shap" },
    { label: "Add to Retention Campaign", icon: Target, href: "/retention" },
    { label: "Delete Customer", icon: Trash2, href: "#", danger: true }
  ];

  return (
    <div className="absolute right-4 top-14 z-30 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-soft dark:border-white/10 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => {
          onExport();
          onClose();
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-muted transition hover:bg-[#f6f4ff] hover:text-primary"
      >
        <Download className="h-4 w-4" />
        Export Customer
      </button>
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.href}
          onClick={onClose}
          className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-muted transition hover:bg-[#f6f4ff] hover:text-primary", action.danger && "text-danger hover:bg-red-50 hover:text-danger")}
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </Link>
      ))}
    </div>
  );
}

function CustomerProfileHeader({ customer }: { customer: CustomerCrmRecord }) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-white via-[#fbfaff] to-[#effcff] p-0 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="flex flex-col justify-between gap-6 p-6 lg:flex-row lg:items-center lg:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <CustomerAvatar customer={customer} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-normal">{customer.name}</h1>
              <SegmentBadge segment={customer.segment} />
              <RiskBadge risk={customer.riskLevel} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-muted">
              <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {customer.email}</span>
              <span>{customer.customerId}</span>
              <span>{customer.contract}</span>
              <span>Customer since {formatDate(customer.customerSince)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link to="/predictions/single"><Play className="h-4 w-4" /> Run Prediction</Link></Button>
          <Button asChild variant="outline"><Link to="/retention"><Target className="h-4 w-4" /> Add to Campaign</Link></Button>
        </div>
      </div>
    </Card>
  );
}

function CustomerKpiCard({ title, value, icon: Icon, tone }: { title: string; value: string; icon: LucideIcon; tone: BadgeTone }) {
  return (
    <Card className="transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <Badge tone={tone}>{title.includes("Probability") ? "CatBoost" : "CRM"}</Badge>
      </div>
      <p className="mt-5 text-xs font-extrabold uppercase text-muted">{title}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </Card>
  );
}

function RiskGaugeSection({ customer }: { customer: CustomerCrmRecord }) {
  const meta = riskMeta[customer.riskLevel];
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Risk Gauge</CardTitle>
          <CardDescription>Current CatBoost churn risk, previous risk and confidence.</CardDescription>
        </div>
        <Badge tone={meta.tone}>{customer.riskLevel}</Badge>
      </CardHeader>
      <div className="grid gap-6 md:grid-cols-[260px_1fr] md:items-center">
        <div className="grid place-items-center">
          <LargeRiskGauge value={customer.churnProbability} risk={customer.riskLevel} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat label="Previous Risk" value={`${customer.previousRisk}%`} />
          <MiniStat label="Risk Change" value={`${customer.riskChange > 0 ? "+" : ""}${customer.riskChange}%`} />
          <MiniStat label="Confidence" value={`${customer.confidence}%`} />
        </div>
      </div>
    </Card>
  );
}

function CustomerInsightsPanel({ customer }: { customer: CustomerCrmRecord }) {
  const insights = [
    ["Why this customer is risky", customer.aiInsights.riskyBecause, AlertTriangle],
    ["Best action to retain", customer.aiInsights.bestAction, Target],
    ["Revenue impact", customer.aiInsights.revenueImpact, CircleDollarSign],
    ["Similar customers behavior", customer.aiInsights.similarBehavior, Users]
  ] as const;

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <Badge tone="primary">AI Insights Panel</Badge>
          <CardTitle className="mt-3">Customer Intelligence</CardTitle>
          <CardDescription>Plain-English guidance generated from churn and customer value signals.</CardDescription>
        </div>
        <BrainIcon />
      </CardHeader>
      <div className="space-y-3">
        {insights.map(([title, text, Icon]) => (
          <div key={title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2efff] text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <p className="font-extrabold">{title}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function OverviewTab({ customer }: { customer: CustomerCrmRecord }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-4 md:grid-cols-2">
        <InfoBlock title="Personal Information" rows={[
          ["Name", customer.name],
          ["Email", customer.email],
          ["Gender", customer.gender],
          ["Senior Citizen", customer.seniorCitizen ? "Yes" : "No"],
          ["Partner", customer.partner ? "Yes" : "No"],
          ["Dependents", customer.dependents ? "Yes" : "No"]
        ]} />
        <InfoBlock title="Contract Summary" rows={[
          ["Contract", customer.contract],
          ["Customer Since", formatDate(customer.customerSince)],
          ["Tenure", `${customer.tenure} months`],
          ["Payment Method", customer.paymentMethod],
          ["Paperless Billing", customer.paperlessBilling ? "Yes" : "No"],
          ["Internet Service", customer.internetService]
        ]} />
        <InfoBlock title="Customer Segment" rows={[
          ["Segment", customer.segment],
          ["Lifetime Value", `$${customer.lifetimeValue.toLocaleString()}`],
          ["Revenue Contribution", `$${customer.revenueContribution.toLocaleString()}`],
          ["Retention Probability", `${customer.retentionProbability}%`]
        ]} />
        <InfoBlock title="Health Summary" rows={[
          ["Health Score", healthLabel(customer.healthScore)],
          ["Risk Level", customer.riskLevel],
          ["Churn Probability", `${customer.churnProbability}%`],
          ["Confidence", `${customer.confidence}%`]
        ]} />
      </div>
      <div className="grid gap-5">
        <Card className="bg-[#f8f7ff]">
          <CardTitle>AI Summary</CardTitle>
          <p className="mt-4 text-sm leading-7 text-muted">{customer.aiSummary}</p>
        </Card>
        <Card>
          <CardTitle>Customer Radar</CardTitle>
          <div className="mt-4 h-72">
            <CustomerRadar data={customer.radar} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ServicesTab({ customer }: { customer: CustomerCrmRecord }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {customer.services.map((service) => (
        <Card key={service.label} className={cn("transition hover:-translate-y-1", service.risk && "border-red-100 bg-red-50/50")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-extrabold">{service.label}</p>
              <p className="mt-2 text-sm text-muted">{service.value}</p>
            </div>
            <Badge tone={service.active ? "success" : service.risk ? "danger" : "neutral"}>{service.active ? "Active" : "Inactive"}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}

function BillingTab({ customer }: { customer: CustomerCrmRecord }) {
  const trend = [
    { month: "Jan", charges: customer.monthlyCharges - 12, revenue: customer.revenueContribution * 0.72 },
    { month: "Feb", charges: customer.monthlyCharges - 8, revenue: customer.revenueContribution * 0.78 },
    { month: "Mar", charges: customer.monthlyCharges - 4, revenue: customer.revenueContribution * 0.84 },
    { month: "Apr", charges: customer.monthlyCharges, revenue: customer.revenueContribution * 0.9 },
    { month: "May", charges: customer.monthlyCharges + 2, revenue: customer.revenueContribution * 0.96 },
    { month: "Jun", charges: customer.monthlyCharges, revenue: customer.revenueContribution }
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <InfoBlock title="Billing Profile" rows={[
        ["Monthly Charges", `$${customer.monthlyCharges.toFixed(2)}`],
        ["Total Charges", `$${customer.totalCharges.toLocaleString()}`],
        ["Payment Method", customer.paymentMethod],
        ["Paperless Billing", customer.paperlessBilling ? "Yes" : "No"],
        ["Revenue Contribution", `$${customer.revenueContribution.toLocaleString()}`],
        ["Payment Risk", customer.paymentMethod === "Electronic check" ? "Elevated" : "Controlled"]
      ]} />
      <Card>
        <CardTitle>Billing Trend</CardTitle>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="billingTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6D5BFF" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#6D5BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Area type="monotone" dataKey="charges" stroke="#6D5BFF" fill="url(#billingTrend)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function PredictionsTab({ customer }: { customer: CustomerCrmRecord }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardTitle>Risk Evolution</CardTitle>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customer.predictionHistory} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Line type="monotone" dataKey="probability" stroke="#6D5BFF" strokeWidth={3} dot={{ r: 4, fill: "#6D5BFF" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <CardTitle>Prediction History</CardTitle>
        <div className="mt-4 space-y-3">
          {customer.predictionHistory.map((prediction) => (
            <div key={`${prediction.date}-${prediction.probability}`} className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm md:grid-cols-[1fr_1fr_auto] dark:bg-white/5">
              <div>
                <p className="font-extrabold">{prediction.date}</p>
                <p className="text-xs text-muted">Model used: {prediction.model}</p>
              </div>
              <div>
                <p className="font-extrabold">{prediction.probability}% probability</p>
                <p className="text-xs text-muted">{prediction.confidence}% confidence</p>
              </div>
              <RiskBadge risk={prediction.riskLevel} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ShapPreviewTab() {
  const factors = [
    ["Contract Type", 34, "danger"],
    ["Monthly Charges", 21, "danger"],
    ["No Tech Support", 15, "danger"],
    ["Short Tenure", 12, "warning"],
    ["Online Security", -8, "success"]
  ];
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
      <Card>
        <CardTitle>Local SHAP Explanation Preview</CardTitle>
        <div className="mt-5 space-y-4">
          {factors.map(([label, value, tone]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold">{label}</span>
                <span className={cn("font-extrabold", tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-success")}>{Number(value) > 0 ? "+" : ""}{value}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className={cn("h-full rounded-full", tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-warning" : "bg-success")} style={{ width: `${Math.abs(Number(value)) * 2}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardTitle>Explainability Action</CardTitle>
        <p className="mt-3 text-sm leading-6 text-muted">Open the full SHAP page to inspect global feature importance, local waterfall impact and natural-language explanation.</p>
        <Button asChild className="mt-5 w-full"><Link to="/shap">Open Full SHAP Explanation</Link></Button>
      </Card>
    </div>
  );
}

function RetentionTab({ customer }: { customer: CustomerCrmRecord }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="bg-gradient-to-br from-white to-[#f8f7ff]">
        <CardTitle>Retention Simulator</CardTitle>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MiniStat label="Current Risk" value={`${customer.churnProbability}%`} />
          <MiniStat label="After Discount" value={`${Math.max(8, customer.churnProbability - 21)}%`} />
          <MiniStat label="Expected Revenue Saved" value={`$${customer.retentionHistory[0]?.expectedRevenueSaved ?? 240}`} />
          <MiniStat label="Retention Probability" value={`${customer.retentionProbability}%`} />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {customer.retentionHistory.map((action) => (
          <Card key={action.action}>
            <Badge tone={action.status === "Accepted" ? "success" : action.status === "Scheduled" ? "primary" : "warning"}>{action.status}</Badge>
            <h3 className="mt-4 font-extrabold">{action.action}</h3>
            <p className="mt-2 text-sm text-muted">Expected risk reduction: {action.riskReduction}%</p>
            <p className="mt-1 text-sm text-muted">Expected revenue saved: ${action.expectedRevenueSaved}</p>
          </Card>
        ))}
        {["Loyalty Program", "Upgrade Plan"].map((action) => (
          <Card key={action}>
            <Badge tone="primary">Recommended</Badge>
            <h3 className="mt-4 font-extrabold">{action}</h3>
            <p className="mt-2 text-sm text-muted">Prepared for next best action workflow.</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TimelineTab({ customer }: { customer: CustomerCrmRecord }) {
  return (
    <div className="space-y-4">
      {customer.timeline.map((event, index) => (
        <div key={`${event.title}-${event.date}`} className="relative flex gap-4 rounded-3xl bg-slate-50 p-4 dark:bg-white/5">
          {index < customer.timeline.length - 1 && <span className="absolute left-8 top-14 h-8 w-px bg-slate-200 dark:bg-white/10" />}
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#f2efff] text-xs font-extrabold text-primary">{index + 1}</div>
          <div>
            <Badge tone="primary">{event.type}</Badge>
            <p className="mt-2 font-extrabold">{event.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{event.description}</p>
            <p className="mt-1 text-xs font-bold text-muted">{event.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SegmentHeatmap() {
  const columns = ["low", "medium", "high", "critical"] as const;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Risk by Segment Heatmap</CardTitle>
          <CardDescription>Risk distribution by segment.</CardDescription>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-muted">Segment</th>
              {columns.map((column) => <th key={column} className="px-3 py-3 text-left capitalize text-muted">{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {segmentRiskHeatmap.map((row) => (
              <tr key={row.segment} className="border-t border-slate-100">
                <td className="px-3 py-3 font-extrabold">{row.segment}</td>
                {columns.map((column) => (
                  <td key={column} className="px-3 py-3">
                    <div className={cn("rounded-xl px-3 py-2 font-extrabold", heatClass(row[column]))}>{row[column]}%</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function InfoBlock({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <div className="mt-5 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <span className="text-xs font-extrabold uppercase text-muted">{label}</span>
            <span className="text-right text-sm font-bold">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CustomerAvatar({ customer, size = "md" }: { customer: CustomerCrmRecord; size?: "sm" | "md" | "lg" }) {
  const initials = customer.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#6D5BFF] via-[#8B5CF6] to-[#00D4FF] font-extrabold text-white shadow-sm",
        size === "sm" && "h-9 w-9 text-xs",
        size === "md" && "h-11 w-11 text-sm",
        size === "lg" && "h-24 w-24 rounded-3xl text-2xl"
      )}
    >
      {initials}
    </div>
  );
}

function SegmentBadge({ segment }: { segment: CustomerSegment }) {
  const meta = segmentMeta[segment];
  return (
    <span title={meta.description} className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold", meta.className)}>
      <meta.icon className="h-3.5 w-3.5" />
      {segment}
    </span>
  );
}

function RiskBadge({ risk }: { risk: CustomerRisk }) {
  const meta = riskMeta[risk];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold", meta.className)}>
      <meta.icon className="h-3.5 w-3.5" />
      {risk}
    </span>
  );
}

function ChurnProbability({ probability, risk }: { probability: number; risk: CustomerRisk }) {
  const meta = riskMeta[risk];
  return (
    <div className="min-w-40">
      <div className="flex items-center justify-between text-xs font-extrabold">
        <span>{probability}%</span>
        <span style={{ color: meta.color }}>{risk}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${probability}%` }}
          transition={{ duration: 0.55 }}
          className="h-full rounded-full"
          style={{ backgroundColor: meta.color }}
        />
      </div>
    </div>
  );
}

function HealthMiniGauge({ score }: { score: number }) {
  const color = healthColor(score);
  return (
    <div className="flex min-w-36 items-center gap-3" title={`Customer stability: ${healthLabel(score)}`}>
      <div className="relative h-11 w-11">
        <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(${color} 0 ${score}%, #EEF2FF ${score}% 100%)` }} />
        <div className="absolute inset-1 grid place-items-center rounded-full bg-white text-[10px] font-extrabold">{score}</div>
      </div>
      <div>
        <p className="text-sm font-extrabold">{healthLabel(score)}</p>
        <p className="text-xs text-muted">Health score</p>
      </div>
    </div>
  );
}

function LargeRiskGauge({ value, risk }: { value: number; risk: CustomerRisk }) {
  const color = riskMeta[risk].color;
  return (
    <div className="relative h-60 w-60">
      <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(${color} 0 ${value}%, #EEF2FF ${value}% 100%)` }} />
      <div className="absolute inset-6 grid place-items-center rounded-full bg-white dark:bg-slate-950">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase text-muted">Current Churn Risk</p>
          <p className="mt-2 text-5xl font-extrabold">{value}%</p>
          <p className="mt-2 text-sm font-extrabold uppercase" style={{ color }}>{risk}</p>
        </div>
      </div>
    </div>
  );
}

function CustomerRadar({ data }: { data: Array<{ subject: string; score: number }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid stroke="#EEF2FF" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#6B7280", fontSize: 12 }} />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <Radar dataKey="score" stroke="#6D5BFF" fill="#6D5BFF" fillOpacity={0.22} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 dark:border-white/10">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn("rounded-xl px-4 py-2 text-sm font-bold text-muted transition hover:bg-[#f6f4ff] hover:text-primary", active === tab && "bg-[#f2efff] text-primary")}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-[10px] font-extrabold uppercase text-muted">{label}</p>
      <p className="mt-1 text-sm font-extrabold">{value}</p>
    </div>
  );
}

function BrainIcon() {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
      <Sparkles className="h-5 w-5" />
    </div>
  );
}

function matchesRange(value: number, range: string) {
  if (range.startsWith("Any") || range === "All customers") return true;
  if (range.endsWith("+")) return value >= Number(range.replace("+", ""));
  const [min, max] = range.split("-").map(Number);
  return value >= min && value <= max;
}

function healthColor(score: number) {
  if (score >= 70) return "#22C55E";
  if (score >= 50) return "#F59E0B";
  if (score >= 30) return "#F97316";
  return "#EF4444";
}

function healthLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Moderate";
  if (score >= 30) return "Weak";
  return "Critical";
}

function segmentColor(segment: CustomerSegment) {
  const colors: Record<CustomerSegment, string> = {
    VIP: "#6D5BFF",
    Loyal: "#22C55E",
    "At Risk": "#EF4444",
    New: "#F59E0B",
    Dormant: "#F97316",
    "High Value": "#00D4FF"
  };
  return colors[segment];
}

function heatClass(value: number) {
  if (value >= 60) return "bg-red-50 text-red-600";
  if (value >= 35) return "bg-orange-50 text-orange-600";
  if (value >= 20) return "bg-amber-50 text-amber-600";
  return "bg-green-50 text-green-600";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
