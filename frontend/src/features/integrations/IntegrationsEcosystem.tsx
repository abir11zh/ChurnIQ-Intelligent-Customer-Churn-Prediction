import { Link, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Blocks,
  Building2,
  CheckCircle2,
  Cloud,
  Code2,
  Copy,
  Database,
  Download,
  FileSpreadsheet,
  Gauge,
  KeyRound,
  Mail,
  MessageSquare,
  Plug,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Slack,
  Sparkles,
  Table2,
  Terminal,
  Webhook,
  Workflow,
  Zap,
  type LucideIcon
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input, Select } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import {
  alertAutomations,
  apiEndpoints,
  apiMetrics,
  automationBlocks,
  codeSamples,
  communicationIntegrations,
  connectedApps,
  crmIntegrations,
  customerSyncStats,
  dataPipelineMetrics,
  dataPipelineTrend,
  dataPlatformIntegrations,
  ecosystemKpis,
  integrationAnalytics,
  integrationNotifications,
  marketplaceApps,
  marketplaceCategories,
  recentSyncs,
  syncHealthTrend,
  webhookEvents,
  webhooks,
  workflowExamples,
  type EcosystemMetric,
  type EcosystemTone,
  type IntegrationApp
} from "./integrationsData";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

const axisTick = { fill: "#64748B", fontSize: 11, fontWeight: 700 };
const gridStroke = "#EEF2FF";
const chartTooltip = {
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  boxShadow: "0 20px 45px rgba(17, 24, 39, 0.08)"
};

const ecosystemTabs = [
  { label: "Hub", href: "/integrations", icon: Plug },
  { label: "CRM", href: "/integrations/crm", icon: Building2 },
  { label: "Communication", href: "/integrations/communication", icon: MessageSquare },
  { label: "Data", href: "/integrations/data", icon: Database },
  { label: "Webhooks", href: "/integrations/webhooks", icon: Webhook },
  { label: "API", href: "/integrations/api", icon: Code2 },
  { label: "Marketplace", href: "/integrations/marketplace", icon: Blocks }
];

const metricIcons: Record<string, LucideIcon> = {
  "Connected Apps": Plug,
  "Available Integrations": Blocks,
  "Sync Health": ShieldCheck,
  "Recent Syncs": RefreshCw,
  "Active Automations": Workflow,
  "API Requests": Zap,
  "Imported Customers": Building2,
  "Updated Customers": RefreshCw,
  "New Customers": Sparkles,
  "Failed Imports": AlertTriangle,
  "Data Sources": Database,
  "Records Imported": Table2,
  "Pipeline Status": Activity,
  "Data Quality": ShieldCheck,
  "Sync Frequency": Gauge,
  "Response Time": Activity,
  "Success Rate": CheckCircle2,
  Errors: AlertTriangle,
  "Rate Limits": Gauge
};

const appIcons: Record<string, LucideIcon> = {
  Salesforce: Cloud,
  HubSpot: Sparkles,
  Slack,
  "Microsoft Teams": MessageSquare,
  Gmail: Mail,
  Outlook: Mail,
  "Google Sheets": FileSpreadsheet,
  Excel: FileSpreadsheet,
  Zapier: Zap,
  Notion: Blocks,
  "Power BI": BarChart3,
  Tableau: BarChart3,
  Snowflake: Cloud,
  BigQuery: Database,
  AWS: Cloud,
  Azure: Cloud,
  "Google Cloud": Cloud,
  PostgreSQL: Database,
  MySQL: Database,
  MongoDB: Database,
  S3: Server,
  "Azure Blob": Server,
  "Google Cloud Storage": Server
};

export function EcosystemIntegrationsHubPage() {
  return (
    <EcosystemPage
      eyebrow="Integrations & Ecosystem"
      title="Connect CHURNIQ AI to the enterprise stack."
      subtitle="A connected ecosystem for CRM, communication, data warehouses, cloud platforms, BI tools, APIs, webhooks and no-code automations."
      action={<Button asChild><Link to="/integrations/marketplace"><Blocks className="h-4 w-4" /> Browse Marketplace</Link></Button>}
    >
      <EcosystemHero />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ecosystemKpis.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title="Sync Health" description="Success rate, failures and latency across enterprise connectors.">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={syncHealthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Area type="monotone" dataKey="success" stroke="#22C55E" fill="#22C55E" fillOpacity={0.18} name="Success %" />
              <Line type="monotone" dataKey="latency" stroke="#6D5BFF" strokeWidth={3} name="Latency ms" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <NotificationCenter />
      </div>

      <SectionHeader title="Connected Apps" description="Live services currently powering customer syncs, alerts, BI exports and data pipelines." action={<Button variant="outline" asChild><Link to="/integrations/marketplace">View all <ArrowRight className="h-4 w-4" /></Link></Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {connectedApps.map((app) => <IntegrationCard key={app.name} app={app} compact />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <AutomationBuilder />
        <RecentSyncsTable />
      </div>
    </EcosystemPage>
  );
}

export function CrmIntegrationsPage() {
  const syncChartData = customerSyncStats.map((metric) => ({
    ...metric,
    amount: Number(metric.value.replace(/[^0-9]/g, "")) || 0
  }));

  return (
    <EcosystemPage
      eyebrow="CRM Integrations"
      title="Bring churn intelligence into customer systems."
      subtitle="Connect Salesforce, HubSpot, Zoho CRM and Microsoft Dynamics with customer profiles, health scores, churn risk and retention actions."
      action={<Button><RefreshCw className="h-4 w-4" /> Sync CRM Records</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {customerSyncStats.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {crmIntegrations.map((app) => <IntegrationCard key={app.name} app={app} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <ChartCard title="CRM Sync Dashboard" description="Connection status, records synced, sync errors and health status.">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={syncChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="label" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="amount" fill="#6D5BFF" radius={[10, 10, 0, 0]} name="Records" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <RecentSyncsTable title="CRM Sync Activity" filter="CRM" />
      </div>
    </EcosystemPage>
  );
}

export function CommunicationIntegrationsPage() {
  return (
    <EcosystemPage
      eyebrow="Communication Integrations"
      title="Turn customer risk into instant action."
      subtitle="Send Slack alerts, Teams updates, email reports, churn warnings and WhatsApp-ready customer outreach workflows."
      action={<Button><MessageSquare className="h-4 w-4" /> Create Alert Rule</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {communicationIntegrations.map((app) => <IntegrationCard key={app.name} app={app} />)}
      </div>

      <SectionHeader title="Alert Automation" description="Operational templates that route churn signals to the right team at the right moment." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {alertAutomations.map((automation) => (
          <Card key={automation.action} className="transition hover:-translate-y-1 hover:border-primary/30">
            <Badge tone={badgeTone(automation.tone)}>{automation.usage}</Badge>
            <h3 className="mt-4 text-lg font-extrabold">{automation.action}</h3>
            <p className="mt-2 text-sm text-muted">{automation.trigger}</p>
            <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-bold dark:bg-white/5">{automation.target}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <AutomationBuilder />
        <WorkflowExamples />
      </div>
    </EcosystemPage>
  );
}

export function DataIntegrationsPage() {
  return (
    <EcosystemPage
      eyebrow="Data Platform Integrations"
      title="Connect warehouses, databases and cloud storage."
      subtitle="Ingest telecom churn data from Snowflake, BigQuery, PostgreSQL, MySQL, MongoDB, S3, Azure Blob and Google Cloud Storage."
      action={<Button><Database className="h-4 w-4" /> Add Data Source</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {dataPipelineMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dataPlatformIntegrations.map((app) => <IntegrationCard key={app.name} app={app} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Data Pipeline Dashboard" description="Records imported and prediction readiness by data source.">
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={dataPipelineTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="source" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="records" fill="#6D5BFF" radius={[10, 10, 0, 0]} name="Records imported" />
              <Line type="monotone" dataKey="quality" stroke="#22C55E" strokeWidth={3} name="Quality %" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <SyncMonitoringPanel />
      </div>
    </EcosystemPage>
  );
}

export function WebhookCenterPage() {
  return (
    <EcosystemPage
      eyebrow="Webhook Center"
      title="Event-driven integrations for enterprise workflows."
      subtitle="Trigger downstream systems when customers are created, predictions complete, churn risk changes, reports generate or model drift is detected."
      action={<Button><Webhook className="h-4 w-4" /> Create Webhook</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Webhook Management</CardTitle>
              <CardDescription>Webhook URL, status, events, last trigger and failures.</CardDescription>
            </div>
          </CardHeader>
          <ResponsiveTable
            headers={["Webhook URL", "Status", "Events", "Last Trigger", "Failures", "Health"]}
            rows={webhooks.map((hook) => [
              <code key={`${hook.url}-url`} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold dark:bg-white/10">{hook.url}</code>,
              <StatusBadge key={`${hook.url}-status`} value={hook.status} />,
              hook.events,
              hook.lastTrigger,
              hook.failures,
              <StatusBadge key={`${hook.url}-health`} value={hook.health} />
            ])}
          />
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Supported Events</CardTitle>
              <CardDescription>Production events available for webhook delivery.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            {webhookEvents.map((event) => (
              <div key={event} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <span className="font-bold">{event}</span>
                <Badge tone="primary">Event</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Delivery Health</CardTitle>
              <CardDescription>Recent webhook failures and retries.</CardDescription>
            </div>
          </CardHeader>
          <NotificationCenter compact />
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sample Payload</CardTitle>
              <CardDescription>Example customer high-risk webhook payload.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" aria-label="Copy webhook payload"><Copy className="h-4 w-4" /></Button>
          </CardHeader>
          <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{`{
  "event": "customer.high_risk",
  "customerId": "CUST_03442",
  "riskLevel": "Critical",
  "churnProbability": 0.82,
  "recommendedAction": "Technical Support Upgrade"
}`}</pre>
        </Card>
      </div>
    </EcosystemPage>
  );
}

export function ApiPlatformPage() {
  const [activeSample, setActiveSample] = useState(codeSamples[0]);

  return (
    <EcosystemPage
      eyebrow="API Platform"
      title="Developer center for CHURNIQ AI."
      subtitle="Expose predictions, customers, reports and analytics through secure APIs, documentation, examples, SDKs and an interactive playground."
      action={<Button><KeyRound className="h-4 w-4" /> Manage API Keys</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {apiMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Authentication, endpoints, examples and SDK-ready contracts.</CardDescription>
            </div>
            <Button variant="outline"><Download className="h-4 w-4" /> Open Docs</Button>
          </CardHeader>
          <ResponsiveTable
            headers={["Method", "Endpoint", "Description", "Usage"]}
            rows={apiEndpoints.map((endpoint) => [
              <Badge key={`${endpoint.path}-method`} tone={endpoint.method === "POST" ? "primary" : "success"}>{endpoint.method}</Badge>,
              <code key={`${endpoint.path}-code`} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold dark:bg-white/10">{endpoint.path}</code>,
              endpoint.description,
              endpoint.usage
            ])}
          />
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Code Samples</CardTitle>
              <CardDescription>Ready for SDKs and developer onboarding.</CardDescription>
            </div>
          </CardHeader>
          <Select value={activeSample.language} onChange={(event) => setActiveSample(codeSamples.find((sample) => sample.language === event.target.value) ?? codeSamples[0])}>
            {codeSamples.map((sample) => <option key={sample.language}>{sample.language}</option>)}
          </Select>
          <pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{activeSample.code}</pre>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <ApiPlayground />
        <ChartCard title="API Reliability" description="Success rate and response time for production API traffic.">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={syncHealthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Line type="monotone" dataKey="success" stroke="#22C55E" strokeWidth={3} name="Success rate" />
              <Line type="monotone" dataKey="latency" stroke="#6D5BFF" strokeWidth={3} name="Response time" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </EcosystemPage>
  );
}

export function MarketplacePage() {
  return (
    <EcosystemPage
      eyebrow="Integration Marketplace"
      title="A partner ecosystem for every enterprise workflow."
      subtitle="Discover certified, recommended and popular integrations across CRM, marketing, analytics, communication, storage and AI."
      action={<Button><Search className="h-4 w-4" /> Search Marketplace</Button>}
    >
      <Card>
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input className="pl-10" placeholder="Search Salesforce, Slack, Snowflake, Zapier, Power BI..." />
          </div>
          <Select defaultValue="All categories">
            <option>All categories</option>
            {marketplaceCategories.map((category) => <option key={category.category}>{category.category}</option>)}
          </Select>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {marketplaceCategories.map((category) => (
          <Card key={category.category} className="transition hover:-translate-y-1 hover:border-primary/30">
            <Badge tone="primary">{category.apps} apps</Badge>
            <h3 className="mt-4 text-lg font-extrabold">{category.category}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{category.description}</p>
          </Card>
        ))}
      </div>

      <SectionHeader title="Certified Integrations" description="Popular, recommended and enterprise-ready connectors." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {marketplaceApps.map((app) => <IntegrationCard key={app.name} app={app} />)}
      </div>
    </EcosystemPage>
  );
}

function EcosystemPage({ eyebrow, title, subtitle, action, children }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode; children: ReactNode }) {
  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-white/88 p-5 shadow-soft dark:border-white/10 dark:bg-white/5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Badge tone="primary">{eyebrow}</Badge>
          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold tracking-tight text-ink dark:text-white md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{subtitle}</p>
        </div>
        {action}
      </div>
      <EcosystemRouteTabs />
      {children}
    </motion.div>
  );
}

function EcosystemRouteTabs() {
  const location = useLocation();
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-soft dark:border-white/10 dark:bg-white/5">
      <div className="flex min-w-max gap-2">
        {ecosystemTabs.map((tab) => {
          const active = location.pathname === tab.href || (tab.href !== "/integrations" && location.pathname.startsWith(`${tab.href}/`));
          const Icon = tab.icon;
          return (
            <Link key={tab.href} to={tab.href} className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition", active ? "bg-primary text-white shadow-soft" : "text-muted hover:bg-[#f6f4ff] hover:text-primary dark:hover:bg-white/10")}>
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function EcosystemHero() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-gradient-to-br from-primary via-secondary to-[#00D4FF] p-7 text-white">
          <Badge className="bg-white/20 text-white" tone="primary">Connected Enterprise Ecosystem</Badge>
          <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">Connect data, teams and workflows around churn intelligence.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/82">CHURNIQ AI can receive data from CRM and warehouses, send alerts to communication tools, publish BI datasets, expose secure APIs and automate retention workflows.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["CRM Systems", "Data Warehouses", "No-code Automation"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/16 p-4 backdrop-blur">
                <p className="text-sm font-extrabold">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid place-items-center bg-[radial-gradient(circle_at_top,#f2efff,transparent_45%),linear-gradient(135deg,#ffffff,#f8fbff)] p-7 dark:bg-white/5">
          <div className="relative h-72 w-full max-w-md">
            <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem] bg-white text-primary shadow-soft">
              <Plug className="h-10 w-10" />
            </div>
            {[
              ["Salesforce", "left-2 top-6"],
              ["Slack", "right-3 top-9"],
              ["Snowflake", "left-6 bottom-8"],
              ["Power BI", "right-8 bottom-8"],
              ["API", "left-1/2 top-1 -translate-x-1/2"]
            ].map(([label, pos]) => (
              <div key={label} className={cn("absolute rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm font-extrabold text-ink shadow-soft", pos)}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function MetricCard({ metric }: { metric: EcosystemMetric }) {
  const Icon = metricIcons[metric.label] ?? Activity;
  return (
    <Card className="transition hover:-translate-y-1 hover:border-primary/30">
      <div className={cn("grid h-12 w-12 place-items-center rounded-2xl", toneSurface(metric.tone), toneText(metric.tone))}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-sm font-bold text-muted">{metric.label}</p>
      <p className="mt-2 text-3xl font-extrabold">{metric.value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{metric.detail}</p>
    </Card>
  );
}

function IntegrationCard({ app, compact = false }: { app: IntegrationApp; compact?: boolean }) {
  const Icon = appIcons[app.name] ?? Plug;
  return (
    <Card className="transition hover:-translate-y-1 hover:border-primary/30">
      <div className="flex items-start justify-between gap-4">
        <div className={cn("grid h-12 w-12 place-items-center rounded-2xl", toneSurface(app.tone), toneText(app.tone))}>
          <Icon className="h-5 w-5" />
        </div>
        <StatusBadge value={app.status} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-extrabold">{app.name}</h3>
        {app.certified ? <Badge tone="success">Certified</Badge> : null}
        {app.popular ? <Badge tone="primary">Popular</Badge> : null}
      </div>
      <p className="mt-1 text-sm font-bold text-muted">{app.category}</p>
      {!compact ? <p className="mt-3 text-sm leading-6 text-muted">{app.description}</p> : null}
      <div className="mt-4 grid gap-2 text-sm">
        <InlineStat label="Health" value={app.health} />
        <InlineStat label="Last sync" value={app.lastSync} />
        <InlineStat label="Records" value={app.recordsSynced} />
      </div>
      {app.syncHealth > 0 ? (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted">
            <span>Sync health</span>
            <span>{app.syncHealth}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <span className={cn("block h-full rounded-full", app.syncHealth >= 95 ? "bg-success" : app.syncHealth >= 85 ? "bg-warning" : "bg-danger")} style={{ width: `${app.syncHealth}%` }} />
          </div>
        </div>
      ) : null}
      <Button className="mt-5 w-full" variant={app.status === "Connected" ? "secondary" : "outline"}>{app.status === "Connected" ? "Manage" : "Connect"}</Button>
    </Card>
  );
}

function AutomationBuilder() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>No-code Automation Center</CardTitle>
          <CardDescription>Visual workflow blocks for trigger, condition and action.</CardDescription>
        </div>
        <Button variant="outline"><Workflow className="h-4 w-4" /> New Flow</Button>
      </CardHeader>
      <div className="grid gap-4">
        {automationBlocks.map((block, index) => (
          <div key={block.label} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <Badge tone={index === 0 ? "primary" : index === 1 ? "warning" : "success"}>{block.label}</Badge>
            <p className="mt-3 text-lg font-extrabold">{block.value}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{block.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WorkflowExamples() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Workflow Examples</CardTitle>
          <CardDescription>Automation templates ready for enterprise operations.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-3">
        {workflowExamples.map((workflow) => (
          <div key={workflow.name} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-extrabold">{workflow.name}</p>
              <Badge tone={badgeTone(workflow.tone)}>{workflow.impact}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted">{workflow.trigger}{" -> "}{workflow.condition}{" -> "}{workflow.action}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecentSyncsTable({ title = "Recent Syncs", filter }: { title?: string; filter?: string }) {
  const rows = filter === "CRM" ? recentSyncs.filter((sync) => sync.service === "Salesforce") : recentSyncs;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Recent syncs, delivery jobs and integration logs.</CardDescription>
        </div>
      </CardHeader>
      <ResponsiveTable
        headers={["Service", "Type", "Status", "Records", "Time", "Detail"]}
        rows={rows.map((sync) => [
          sync.service,
          sync.type,
          <StatusBadge key={`${sync.service}-status`} value={sync.status} />,
          sync.records,
          sync.time,
          sync.detail
        ])}
      />
    </Card>
  );
}

function SyncMonitoringPanel() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Sync Monitoring</CardTitle>
          <CardDescription>Connection status, health, latency, history and errors.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-4">
        {integrationAnalytics.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="font-extrabold">{item.label}</span>
              <span className="font-bold text-muted">{item.display}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ApiPlayground() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>API Playground</CardTitle>
          <CardDescription>Test predictions, customers, reports and analytics endpoints.</CardDescription>
        </div>
        <Button><Terminal className="h-4 w-4" /> Run Test</Button>
      </CardHeader>
      <div className="grid gap-3">
        <Select defaultValue="POST /api/predict">
          {apiEndpoints.map((endpoint) => <option key={endpoint.path}>{endpoint.method} {endpoint.path}</option>)}
        </Select>
        <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{`{
  "gender": "Female",
  "contract": "Month-to-month",
  "tenure": 12,
  "monthlyCharges": 89.4
}`}</pre>
        <div className="rounded-2xl bg-[#f2efff] p-4 text-sm">
          <p className="font-extrabold text-primary">Response preview</p>
          <p className="mt-2 text-muted">CatBoost probability 82%, risk level Critical, confidence 94%.</p>
        </div>
      </div>
    </Card>
  );
}

function NotificationCenter({ compact = false }: { compact?: boolean }) {
  return (
    <Card className={compact ? "p-0 shadow-none" : undefined}>
      {!compact ? (
        <CardHeader>
          <div>
            <CardTitle>Integration Notifications</CardTitle>
            <CardDescription>Errors, sync failures, API warnings and connection issues.</CardDescription>
          </div>
        </CardHeader>
      ) : null}
      <div className="space-y-3">
        {integrationNotifications.map((item) => (
          <div key={`${item.title}-${item.time}`} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", toneSurface(item.tone), toneText(item.tone))}>
              {item.tone === "warning" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-extrabold">{item.title}</p>
                <Badge tone={badgeTone(item.tone)}>{item.type}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">{item.detail}</p>
              <p className="mt-1 text-xs font-bold text-muted">{item.time}</p>
            </div>
          </div>
        ))}
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
      </CardHeader>
      {children}
    </Card>
  );
}

function SectionHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-extrabold text-ink dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

function ResponsiveTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="text-muted">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-slate-100 dark:border-white/10">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-4 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-bold text-muted">{label}</span>
      <span className="text-right font-extrabold">{value}</span>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone: BadgeTone = normalized.includes("connected") || normalized.includes("success") || normalized.includes("active") || normalized.includes("healthy") || normalized.includes("operational")
    ? "success"
    : normalized.includes("attention") || normalized.includes("warning") || normalized.includes("review") || normalized.includes("paused") || normalized.includes("beta")
      ? "warning"
      : normalized.includes("failed") || normalized.includes("error")
        ? "danger"
        : "primary";
  return <Badge tone={tone}>{value}</Badge>;
}

function toneSurface(tone: EcosystemTone) {
  return {
    primary: "bg-[#f2efff]",
    success: "bg-green-50",
    warning: "bg-amber-50",
    danger: "bg-red-50",
    neutral: "bg-slate-100"
  }[tone];
}

function toneText(tone: EcosystemTone) {
  return {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    neutral: "text-slate-500"
  }[tone];
}

function badgeTone(tone: EcosystemTone): BadgeTone {
  return tone === "success" ? "success" : tone === "warning" ? "warning" : tone === "danger" ? "danger" : tone === "primary" ? "primary" : "neutral";
}
