import { Link, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Command,
  Copy,
  CreditCard,
  Database,
  Download,
  FileText,
  Gauge,
  HardDrive,
  Headphones,
  KeyRound,
  LifeBuoy,
  Lock,
  Mail,
  MessageSquare,
  Monitor,
  Palette,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Video,
  Zap,
  type LucideIcon
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input, Select } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import {
  apiKeys,
  auditLogs,
  commandActions,
  currentPlan,
  departments,
  enterpriseKpis,
  helpResources,
  integrations,
  invitations,
  loginHistory,
  notificationCategories,
  notificationSettings,
  organizationProfile,
  organizationSettingsTabs,
  passwordActivity,
  permissionModules,
  platformActivities,
  roleSummaries,
  scheduledReports,
  securitySessions,
  subscriptionPlans,
  supportTickets,
  systemHealth,
  teamMembers,
  usageAnalytics,
  workspaceSettings,
  invoices,
  type EnterpriseMetric,
  type EnterpriseTone
} from "./enterpriseData";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

const chartTooltip = {
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  boxShadow: "0 20px 45px rgba(17, 24, 39, 0.08)"
};

const axisTick = { fill: "#64748B", fontSize: 11, fontWeight: 700 };
const gridStroke = "#EEF2FF";

const enterpriseTabs = [
  { label: "Organization", href: "/organization", icon: Building2 },
  { label: "Team", href: "/team", icon: Users },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Audit Logs", href: "/audit-logs", icon: FileText },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "API Keys", href: "/settings/api-keys", icon: KeyRound },
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "Security", href: "/security", icon: ShieldCheck },
  { label: "System Health", href: "/system-health", icon: Server }
];

const metricIcons: Record<string, LucideIcon> = {
  "Workspace Status": CheckCircle2,
  "Team Members": Users,
  Departments: Building2,
  "Security Score": ShieldCheck,
  "API Requests": Zap,
  "Audit Coverage": FileText
};

const usageTrend = [
  { month: "Jan", predictions: 38, api: 82, reports: 24 },
  { month: "Feb", predictions: 46, api: 96, reports: 32 },
  { month: "Mar", predictions: 58, api: 118, reports: 46 },
  { month: "Apr", predictions: 62, api: 142, reports: 58 },
  { month: "May", predictions: 70, api: 161, reports: 72 },
  { month: "Jun", predictions: 74, api: 184, reports: 84 }
];

const healthTrend = [
  { time: "08:00", api: 99.98, model: 99.96, queue: 96.4 },
  { time: "10:00", api: 99.99, model: 99.97, queue: 97.1 },
  { time: "12:00", api: 99.99, model: 99.98, queue: 95.8 },
  { time: "14:00", api: 99.97, model: 99.98, queue: 96.9 },
  { time: "16:00", api: 99.99, model: 99.97, queue: 98.2 }
];

export function OrganizationPage() {
  const [activeTab, setActiveTab] = useState("General");

  return (
    <EnterprisePage
      eyebrow="Organization Management"
      title="Enterprise workspace command center."
      subtitle="Manage organization profile, workspace governance, security posture, billing, integrations and notifications."
      action={<Button><Upload className="h-4 w-4" /> Upload Logo</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-primary via-secondary to-[#00D4FF] p-6 text-white">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white/20 text-2xl font-extrabold shadow-soft backdrop-blur">{organizationProfile.logo}</div>
                <div>
                  <Badge className="bg-white/20 text-white" tone="primary">{organizationProfile.plan}</Badge>
                  <h2 className="mt-3 text-3xl font-extrabold">{organizationProfile.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-white/78">{organizationProfile.industry} - {organizationProfile.country}</p>
                </div>
              </div>
              <Badge className="bg-white text-primary" tone="primary">{organizationProfile.status}</Badge>
            </div>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-3">
            {[
              ["Website", organizationProfile.website],
              ["Workspace ID", organizationProfile.workspaceId],
              ["Data Region", organizationProfile.dataRegion],
              ["Seats", organizationProfile.seats],
              ["Renewal", organizationProfile.renewalDate],
              ["Legal Name", organizationProfile.legalName]
            ].map(([label, value]) => (
              <InfoTile key={label} label={label} value={value} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Enterprise Readiness</CardTitle>
              <CardDescription>Workspace controls expected by real companies.</CardDescription>
            </div>
            <ShieldCheck className="h-6 w-6 text-primary" />
          </CardHeader>
          <div className="grid gap-3">
            {organizationProfile.compliance.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <span className="font-bold">{item}</span>
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {enterpriseKpis.map((metric) => <EnterpriseMetricCard key={metric.label} metric={metric} />)}
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {organizationSettingsTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-extrabold transition",
                activeTab === tab ? "bg-primary text-white shadow-soft" : "bg-slate-50 text-muted hover:bg-[#f2efff] hover:text-primary dark:bg-white/5"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-extrabold text-primary">{activeTab} Settings</p>
            <h3 className="mt-2 text-2xl font-extrabold">Database-ready workspace configuration</h3>
            <p className="mt-3 text-sm leading-6 text-muted">This section is structured like a real admin console and can be connected to organization, billing, security and notification APIs later.</p>
            <Button className="mt-5" variant="outline">Save {activeTab}</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Organization Name", organizationProfile.name],
              ["Industry", organizationProfile.industry],
              ["Country", organizationProfile.country],
              ["Subscription Plan", organizationProfile.plan],
              ["Workspace Status", organizationProfile.status],
              ["Workspace Region", organizationProfile.dataRegion]
            ].map(([label, value]) => (
              <InfoTile key={label} label={label} value={value} />
            ))}
          </div>
        </div>
      </Card>

      <CommandCenter />
    </EnterprisePage>
  );
}

export function EnterpriseTeamPage() {
  return (
    <EnterprisePage
      eyebrow="Team Management"
      title="People, departments, roles and permissions."
      subtitle="Manage users, invitations, departments, enterprise roles and permission coverage from one workspace."
      action={<Button><UserPlus className="h-4 w-4" /> Invite User</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {roleSummaries.map((role) => (
          <Card key={role.role}>
            <Badge tone={badgeTone(role.tone)}>{role.role}</Badge>
            <p className="mt-4 text-3xl font-extrabold">{role.users}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{role.description}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Modern member profile table with department, status and activity.</CardDescription>
          </div>
          <Button variant="outline"><Download className="h-4 w-4" /> Export</Button>
        </CardHeader>
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input className="pl-10" placeholder="Search users by name, email, role or department..." />
          </div>
          <Select><option>All departments</option><option>Analytics</option><option>Retention</option><option>Revenue</option></Select>
          <Select><option>All statuses</option><option>Active</option><option>Invited</option><option>Suspended</option></Select>
        </div>
        <EnterpriseTable
          headers={["Member", "Department", "Role", "Status", "Last Activity", "Created", "Actions"]}
          rows={teamMembers.map((member) => [
            <UserCell key={`${member.email}-user`} initials={member.initials} name={member.name} email={member.email} />,
            member.department,
            <Badge key={`${member.email}-role`} tone={member.role === "Owner" ? "primary" : member.role === "Admin" ? "success" : "neutral"}>{member.role}</Badge>,
            <StatusBadge key={`${member.email}-status`} value={member.status} />,
            member.lastActivity,
            member.createdAt,
            <Button key={`${member.email}-action`} variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
          ])}
        />
      </Card>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Operational ownership by business unit.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            {departments.map((department) => (
              <div key={department.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{department.name}</p>
                    <p className="mt-1 text-sm text-muted">{department.members} members - Owner: {department.owner}</p>
                  </div>
                  <Badge tone={department.activity === "High" ? "success" : department.activity === "Medium" ? "warning" : "neutral"}>{department.activity}</Badge>
                </div>
                <p className="mt-3 text-sm font-bold text-muted">Budget exposure: {department.budget}</p>
              </div>
            ))}
          </div>
        </Card>
        <PermissionMatrix />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>User Invitations</CardTitle>
            <CardDescription>Pending, accepted, rejected and expired invitations.</CardDescription>
          </div>
          <Button variant="secondary"><Mail className="h-4 w-4" /> Send Invite</Button>
        </CardHeader>
        <EnterpriseTable
          headers={["Email", "Role", "Invited By", "Status", "Sent"]}
          rows={invitations.map((invite) => [
            invite.email,
            invite.role,
            invite.invitedBy,
            <StatusBadge key={invite.email} value={invite.status} />,
            invite.sentAt
          ])}
        />
      </Card>
    </EnterprisePage>
  );
}

export function ActivityCenterPage() {
  return (
    <EnterprisePage
      eyebrow="Activity Center"
      title="A live timeline of every important platform event."
      subtitle="Track user logins, predictions, report exports, campaigns, customer updates and model events."
      action={<Button variant="outline"><RefreshCw className="h-4 w-4" /> Refresh</Button>}
    >
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {["User Login", "Prediction Generated", "Report Exported", "Campaign Created", "Customer Updated", "Model Updated"].map((label, index) => (
          <Card key={label}>
            <Activity className="h-5 w-5 text-primary" />
            <p className="mt-4 text-xl font-extrabold">{index === 0 ? 48 : index === 1 ? 132 : index === 2 ? 24 : index === 3 ? 8 : index === 4 ? 91 : 3}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Activity Volume</CardTitle>
              <CardDescription>Workspace actions by month.</CardDescription>
            </div>
          </CardHeader>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={usageTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Area type="monotone" dataKey="api" stroke="#6D5BFF" fill="#6D5BFF" fillOpacity={0.18} name="API requests" />
              <Area type="monotone" dataKey="predictions" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.14} name="Predictions" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <ActivityTimeline />
      </div>
    </EnterprisePage>
  );
}

export function AuditLogsPage() {
  return (
    <EnterprisePage
      eyebrow="Audit Logs"
      title="Enterprise-grade auditability for sensitive actions."
      subtitle="Every access decision and workspace change can be reviewed by timestamp, user, resource, IP and result."
      action={<Button><Download className="h-4 w-4" /> Export Logs</Button>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Events", "12,840", "Last 30 days"],
          ["Denied Events", "18", "Permission policy enforced"],
          ["Admin Actions", "284", "Settings, users and billing"],
          ["Retention", "365 days", "Audit retention policy"]
        ].map(([label, value, detail], index) => (
          <Card key={label}>
            <Badge tone={index === 1 ? "danger" : "primary"}>{detail}</Badge>
            <p className="mt-4 text-3xl font-extrabold">{value}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Audit Log Explorer</CardTitle>
            <CardDescription>Search by user, action, resource, IP or result.</CardDescription>
          </div>
          <Button variant="outline"><FileText className="h-4 w-4" /> CSV</Button>
        </CardHeader>
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <Input placeholder="Search audit events..." />
          <Select><option>All results</option><option>Allowed</option><option>Denied</option></Select>
          <Select><option>Last 24 hours</option><option>7 days</option><option>30 days</option></Select>
        </div>
        <EnterpriseTable
          headers={["Timestamp", "User", "Action", "Resource", "IP Address", "Result"]}
          rows={auditLogs.map((log) => [
            log.timestamp,
            log.user,
            log.action,
            log.resource,
            log.ip,
            <StatusBadge key={`${log.timestamp}-${log.action}`} value={log.result} />
          ])}
        />
      </Card>
    </EnterprisePage>
  );
}

export function EnterpriseNotificationsPage() {
  return (
    <EnterprisePage
      eyebrow="Notification Center"
      title="Enterprise notification control plane."
      subtitle="Manage prediction, customer, campaign, report, AI insight, system and security notifications."
      action={<Button variant="outline"><Bell className="h-4 w-4" /> Mark All Read</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {notificationCategories.map((item) => (
          <Card key={item.category} className="transition hover:-translate-y-1 hover:border-primary/30">
            <div className="flex items-start justify-between gap-3">
              <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", toneSurface(item.tone), toneText(item.tone))}>
                <Bell className="h-5 w-5" />
              </div>
              <Badge tone={badgeTone(item.tone)}>{item.unread} unread</Badge>
            </div>
            <p className="mt-5 text-xl font-extrabold">{item.category}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{item.count} notifications</p>
            <p className="mt-3 text-sm leading-6 text-muted">{item.detail}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <NotificationSettings />
        <ActivityTimeline compact />
      </div>
    </EnterprisePage>
  );
}

export function WorkspaceSettingsPage() {
  return (
    <EnterprisePage
      eyebrow="Workspace Settings"
      title="Configure workspace identity, localization and branding."
      subtitle="Set workspace name, timezone, currency, language, logo, theme and custom welcome experience."
      action={<Button>Save Settings</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Workspace Configuration</CardTitle>
              <CardDescription>Database-ready settings structure.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <Input defaultValue={workspaceSettings.name} aria-label="Workspace name" />
            <Select defaultValue={workspaceSettings.timezone} aria-label="Timezone"><option>Europe/Paris</option><option>UTC</option><option>America/New_York</option></Select>
            <Select defaultValue={workspaceSettings.currency} aria-label="Currency"><option>USD</option><option>EUR</option><option>MAD</option></Select>
            <Select defaultValue={workspaceSettings.language} aria-label="Language"><option>English</option><option>French</option><option>Arabic</option></Select>
            <Input defaultValue={workspaceSettings.welcomeMessage} className="md:col-span-2" aria-label="Welcome message" />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Custom Branding</CardTitle>
              <CardDescription>Logo, primary color, secondary color and theme.</CardDescription>
            </div>
            <Palette className="h-6 w-6 text-primary" />
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <div className="grid place-items-center rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-center text-white">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white/20 text-2xl font-extrabold">{workspaceSettings.logo}</div>
              <Button className="mt-5 bg-white text-primary hover:bg-white" variant="outline"><Upload className="h-4 w-4" /> Upload</Button>
            </div>
            <div className="grid gap-4">
              <ColorRow label="Primary Color" value={workspaceSettings.primaryColor} />
              <ColorRow label="Secondary Color" value={workspaceSettings.secondaryColor} />
              <InfoTile label="Theme" value={workspaceSettings.theme} />
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-bold uppercase text-muted">Preview</p>
                <p className="mt-2 font-extrabold">{workspaceSettings.welcomeMessage}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <NotificationSettings />
    </EnterprisePage>
  );
}

export function EnterpriseBillingPage() {
  return (
    <EnterprisePage
      eyebrow="Billing"
      title="Subscription, invoices and usage analytics."
      subtitle="Control current plan, renewal, invoices, limits, reports generated, storage and API requests."
      action={<Button><CreditCard className="h-4 w-4" /> Manage Subscription</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-gradient-to-br from-primary to-secondary text-white">
          <Badge className="bg-white/20 text-white" tone="primary">{currentPlan.status}</Badge>
          <h2 className="mt-5 text-4xl font-extrabold">{currentPlan.name}</h2>
          <p className="mt-2 text-lg font-bold text-white/78">{currentPlan.price}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MiniStat label="Renewal" value={currentPlan.renewalDate} inverted />
            <MiniStat label="Seats" value={currentPlan.seats} inverted />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {currentPlan.benefits.map((benefit) => <Badge key={benefit} className="bg-white/20 text-white" tone="primary">{benefit}</Badge>)}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>Predictions, reports, customers, storage and API consumption.</CardDescription>
            </div>
            <Gauge className="h-6 w-6 text-primary" />
          </CardHeader>
          <div className="space-y-4">
            {usageAnalytics.map((usage) => (
              <div key={usage.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-extrabold">{usage.label}</span>
                  <span className="font-bold text-muted">{usage.display}</span>
                </div>
                <ProgressBar value={Math.round((usage.value / usage.max) * 100)} tone={usage.value / usage.max > 0.8 ? "warning" : "primary"} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.name} className={cn(plan.recommended && "border-primary/30 ring-4 ring-primary/10")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone={plan.recommended ? "primary" : "neutral"}>{plan.recommended ? "Recommended" : "Plan"}</Badge>
                <h3 className="mt-4 text-2xl font-extrabold">{plan.name}</h3>
                <p className="mt-1 text-xl font-bold text-primary">{plan.price}</p>
              </div>
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-3 text-sm font-semibold text-muted">{plan.limit}</p>
            <div className="mt-5 space-y-2">
              {plan.features.map((feature) => (
                <p key={feature} className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="h-4 w-4 text-success" /> {feature}</p>
              ))}
            </div>
            <Button className="mt-6 w-full" variant={plan.name === currentPlan.name ? "secondary" : "outline"}>{plan.name === currentPlan.name ? "Current Plan" : "Upgrade"}</Button>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Usage Trend</CardTitle>
              <CardDescription>Monthly platform usage growth.</CardDescription>
            </div>
          </CardHeader>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={usageTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="predictions" fill="#6D5BFF" radius={[10, 10, 0, 0]} name="Predictions" />
              <Bar dataKey="reports" fill="#00D4FF" radius={[10, 10, 0, 0]} name="Reports" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Recent billing documents.</CardDescription>
            </div>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Download</Button>
          </CardHeader>
          <EnterpriseTable
            headers={["Invoice", "Date", "Amount", "Status"]}
            rows={invoices.map((invoice) => [
              invoice.id,
              invoice.date,
              invoice.amount,
              <StatusBadge key={invoice.id} value={invoice.status} />
            ])}
          />
        </Card>
      </div>
    </EnterprisePage>
  );
}

export function ApiKeysPage() {
  return (
    <EnterprisePage
      eyebrow="API Key Management"
      title="Secure API access for enterprise integrations."
      subtitle="Generate, revoke, regenerate and copy keys for production, analytics and connector workflows."
      action={<Button><Plus className="h-4 w-4" /> Generate Key</Button>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Active Keys", "2", "Production-ready"],
          ["Revoked Keys", "1", "Disabled"],
          ["Last Used", "8 min", "Production API"],
          ["Security Scope", "Least privilege", "Role-based"]
        ].map(([label, value, detail], index) => (
          <Card key={label}>
            <Badge tone={index === 1 ? "danger" : "primary"}>{detail}</Badge>
            <p className="mt-4 text-3xl font-extrabold">{value}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Keys are shown as safe prefixes only.</CardDescription>
          </div>
          <Button variant="outline"><ShieldCheck className="h-4 w-4" /> Rotate Policy</Button>
        </CardHeader>
        <EnterpriseTable
          headers={["Name", "Key Prefix", "Created", "Last Used", "Scope", "Status", "Actions"]}
          rows={apiKeys.map((key) => [
            key.name,
            <code key={`${key.name}-prefix`} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold dark:bg-white/10">{key.prefix}...</code>,
            key.created,
            key.lastUsed,
            key.scope,
            <StatusBadge key={`${key.name}-status`} value={key.status} />,
            <div key={`${key.name}-actions`} className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Copy key"><Copy className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Regenerate key"><RefreshCw className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Revoke key"><Trash2 className="h-4 w-4 text-danger" /></Button>
            </div>
          ])}
        />
      </Card>
    </EnterprisePage>
  );
}

export function IntegrationsHubPage() {
  return (
    <EnterprisePage
      eyebrow="Integrations Hub"
      title="Connect CHURNIQ AI with the enterprise stack."
      subtitle="Salesforce, HubSpot, Slack, Google Sheets, Microsoft Excel, Zapier, Gmail and Outlook."
      action={<Button><Plug className="h-4 w-4" /> Browse Marketplace</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {integrations.map((integration) => (
          <Card key={integration.name} className="transition hover:-translate-y-1 hover:border-primary/30">
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                <Plug className="h-5 w-5" />
              </div>
              <StatusBadge value={integration.status} />
            </div>
            <h3 className="mt-5 text-xl font-extrabold">{integration.name}</h3>
            <p className="mt-1 text-sm font-bold text-muted">{integration.category}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="font-bold">Last sync:</span> {integration.lastSync}</p>
              <p><span className="font-bold">Records:</span> {integration.recordsSynced}</p>
              <p className="text-muted">{integration.logs}</p>
            </div>
            <Button className="mt-5 w-full" variant={integration.status === "Connected" ? "secondary" : "outline"}>{integration.status === "Connected" ? "Manage" : "Connect"}</Button>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Sync Logs</CardTitle>
            <CardDescription>Recent integration activity and scheduled jobs.</CardDescription>
          </div>
        </CardHeader>
        <ActivityTimeline compact />
      </Card>
    </EnterprisePage>
  );
}

export function SystemHealthPage() {
  return (
    <EnterprisePage
      eyebrow="System Health"
      title="Operational status for the enterprise platform."
      subtitle="Monitor API, database, CatBoost model, storage and queue status."
      action={<Button variant="outline"><RefreshCw className="h-4 w-4" /> Run Check</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {systemHealth.map((service) => (
          <Card key={service.service}>
            <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", toneSurface(service.tone), toneText(service.tone))}>
              {service.service.includes("API") ? <Server className="h-5 w-5" /> : service.service.includes("Database") ? <Database className="h-5 w-5" /> : service.service.includes("Storage") ? <HardDrive className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
            </div>
            <p className="mt-5 text-sm font-bold text-muted">{service.service}</p>
            <p className="mt-2 text-xl font-extrabold">{service.value}</p>
            <Badge className="mt-3" tone={badgeTone(service.tone)}>{service.uptime}</Badge>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Service Availability</CardTitle>
              <CardDescription>API, model and queue status trend.</CardDescription>
            </div>
          </CardHeader>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={healthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="time" tick={axisTick} />
              <YAxis domain={[94, 100]} tick={axisTick} />
              <Tooltip contentStyle={chartTooltip} />
              <Line type="monotone" dataKey="api" stroke="#22C55E" strokeWidth={3} name="API" />
              <Line type="monotone" dataKey="model" stroke="#6D5BFF" strokeWidth={3} name="Model" />
              <Line type="monotone" dataKey="queue" stroke="#F59E0B" strokeWidth={3} name="Queue" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Operational Notes</CardTitle>
              <CardDescription>Current platform state.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {[
              ["CatBoost model is online", "Real predictions remain available."],
              ["Queue has 14 pending jobs", "Batch predictions are processing normally."],
              ["Storage usage is healthy", "68 GB used across exports and datasets."],
              ["No critical incidents", "All enterprise services are available."]
            ].map(([title, detail]) => (
              <div key={title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="font-extrabold">{title}</p>
                <p className="mt-1 text-sm text-muted">{detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </EnterprisePage>
  );
}

export function SecurityCenterPage() {
  return (
    <EnterprisePage
      eyebrow="Security Center"
      title="Sessions, devices, login history and password activity."
      subtitle="Monitor account security, failed logins, MFA coverage and device trust."
      action={<Button><Lock className="h-4 w-4" /> Enforce MFA</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {passwordActivity.map((item) => (
          <Card key={item.label}>
            <ShieldCheck className="h-6 w-6 text-primary" />
            <p className="mt-4 text-2xl font-extrabold">{item.value}</p>
            <p className="mt-1 text-sm font-bold text-muted">{item.label}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{item.detail}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sessions & Devices</CardTitle>
              <CardDescription>Current trusted and untrusted devices.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            {securitySessions.map((session) => (
              <div key={`${session.device}-${session.ip}`} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-primary shadow-sm dark:bg-slate-900">
                  {session.device.includes("iPhone") ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-extrabold">{session.device}</p>
                    <Badge tone={session.trusted ? "success" : "warning"}>{session.trusted ? "Trusted" : "Review"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{session.location} - {session.ip}</p>
                  <p className="mt-1 text-xs font-bold text-muted">{session.lastSeen}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Login History</CardTitle>
              <CardDescription>Successful and failed login events.</CardDescription>
            </div>
          </CardHeader>
          <EnterpriseTable
            headers={["User", "Time", "Location", "Result"]}
            rows={loginHistory.map((item) => [
              item.user,
              item.time,
              item.location,
              <StatusBadge key={`${item.user}-${item.time}`} value={item.result} />
            ])}
          />
        </Card>
      </div>
    </EnterprisePage>
  );
}

export function EnterpriseHelpCenterPage() {
  return (
    <EnterprisePage
      eyebrow="Help Center"
      title="Documentation, tutorials, FAQs, release notes and support tickets."
      subtitle="A complete self-service hub for enterprise users and administrators."
      action={<Button variant="outline"><BookOpen className="h-4 w-4" /> Open Docs</Button>}
    >
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-10" placeholder="Search documentation, tutorials, FAQs and release notes..." />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {helpResources.map((resource, index) => {
          const icons = [BookOpen, Video, MessageSquare, Zap, LifeBuoy];
          const Icon = icons[index] ?? BookOpen;
          return (
            <Card key={resource.title} className="transition hover:-translate-y-1 hover:border-primary/30">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-extrabold">{resource.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{resource.detail}</p>
              <Button className="mt-5 w-full" variant="outline">Open</Button>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Release Notes</CardTitle>
            <CardDescription>Enterprise platform updates.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-3">
          {["Phase 9 enterprise admin suite added.", "Executive analytics routes stabilized.", "CatBoost production guardrails remain active."].map((note, index) => (
            <div key={note} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <Badge tone="primary">v9.{index}</Badge>
              <p className="font-bold">{note}</p>
            </div>
          ))}
        </div>
      </Card>
    </EnterprisePage>
  );
}

export function EnterpriseSupportCenterPage() {
  return (
    <EnterprisePage
      eyebrow="Support Center"
      title="Live chat, support tickets, knowledge base and contact form."
      subtitle="Enterprise support experience for operational teams and administrators."
      action={<Button><MessageSquare className="h-4 w-4" /> Start Live Chat</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>Premium support conversation preview.</CardDescription>
            </div>
            <Badge tone="success">Online</Badge>
          </CardHeader>
          <div className="space-y-3">
            <ChatBubble sender="ChurnIQ Support" text="Welcome. I can help with integrations, reports, billing or prediction workflows." />
            <ChatBubble sender="You" text="I need help scheduling the CEO report every Monday." self />
            <ChatBubble sender="ChurnIQ Support" text="Open Reports, choose CEO Revenue Protection Summary and set cadence to Weekly." />
          </div>
          <div className="mt-5 flex gap-2">
            <Input placeholder="Type a message..." />
            <Button size="icon" aria-label="Send support message"><Mail className="h-4 w-4" /></Button>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Priority, SLA and ownership tracking.</CardDescription>
            </div>
            <Button variant="outline"><Plus className="h-4 w-4" /> New Ticket</Button>
          </CardHeader>
          <EnterpriseTable
            headers={["Ticket", "Subject", "Priority", "Status", "Owner"]}
            rows={supportTickets.map((ticket) => [
              ticket.id,
              ticket.subject,
              <StatusBadge key={`${ticket.id}-priority`} value={ticket.priority} />,
              <StatusBadge key={`${ticket.id}-status`} value={ticket.status} />,
              ticket.owner
            ])}
          />
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Contact Options</CardTitle>
              <CardDescription>Enterprise support channels.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            {[
              { title: "Email Support", detail: "support@churniq.com", icon: Mail },
              { title: "Priority Phone", detail: "+1 (555) 010-2042", icon: Headphones },
              { title: "Knowledge Base", detail: "Browse 120 articles", icon: BookOpen }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-primary shadow-sm dark:bg-slate-900">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-extrabold">{item.title}</p>
                    <p className="text-sm text-muted">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Contact Form</CardTitle>
              <CardDescription>Send detailed context to the support team.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Name" />
            <Input placeholder="Email" type="email" />
            <Input className="md:col-span-2" placeholder="Subject" />
            <textarea className="min-h-32 rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 md:col-span-2" placeholder="Describe the issue..." />
          </div>
          <Button className="mt-5 w-full"><Mail className="h-4 w-4" /> Send Message</Button>
        </Card>
      </div>
    </EnterprisePage>
  );
}

function EnterprisePage({
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
      <div className="overflow-hidden rounded-[30px] border border-white/80 bg-gradient-to-br from-white via-[#f8f6ff] to-[#eefcff] p-6 shadow-soft dark:border-white/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Badge tone="primary">{eyebrow}</Badge>
            <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight tracking-normal text-ink dark:text-white md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted md:text-base">{subtitle}</p>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link to="/security"><ShieldCheck className="h-4 w-4" /> Security</Link></Button>
            {action}
          </div>
        </div>
        <EnterpriseRouteTabs />
      </div>
      {children}
    </div>
  );
}

function EnterpriseRouteTabs() {
  const location = useLocation();

  return (
    <div className="mt-6 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {enterpriseTabs.map((tab) => {
          const active = location.pathname === tab.href || (tab.href !== "/organization" && tab.href !== "/settings" && location.pathname.startsWith(`${tab.href}/`));
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

function EnterpriseMetricCard({ metric }: { metric: EnterpriseMetric }) {
  const Icon = metricIcons[metric.label] ?? BarChart3;
  return (
    <Card className="transition hover:-translate-y-1 hover:border-primary/30">
      <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", toneSurface(metric.tone), toneText(metric.tone))}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-sm font-semibold text-muted">{metric.label}</p>
      <p className="mt-2 text-2xl font-extrabold">{metric.value}</p>
      <p className="mt-2 text-xs font-bold leading-5 text-muted">{metric.detail}</p>
    </Card>
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

function ColorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div>
        <p className="text-xs font-bold uppercase text-muted">{label}</p>
        <p className="mt-1 font-extrabold">{value}</p>
      </div>
      <span className="h-10 w-10 rounded-2xl border border-white shadow-sm" style={{ backgroundColor: value }} />
    </div>
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

function UserCell({ initials, name, email }: { initials: string; name: string; email: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#00D4FF] text-xs font-extrabold text-white">{initials}</div>
      <div>
        <p className="font-extrabold">{name}</p>
        <p className="text-xs font-semibold text-muted">{email}</p>
      </div>
    </div>
  );
}

function PermissionMatrix() {
  const permissions = ["View", "Create", "Edit", "Delete", "Export", "Manage"] as const;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>Visual access coverage by module and action.</CardDescription>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[160px_repeat(6,1fr)] gap-2 text-xs font-extrabold uppercase text-muted">
            <span>Module</span>
            {permissions.map((permission) => <span key={permission} className="text-center">{permission}</span>)}
          </div>
          <div className="mt-3 grid gap-2">
            {permissionModules.map((module) => (
              <div key={module.module} className="grid grid-cols-[160px_repeat(6,1fr)] gap-2">
                <span className="flex items-center rounded-xl bg-slate-50 px-3 text-sm font-extrabold dark:bg-white/5">{module.module}</span>
                {permissions.map((permission) => (
                  <div key={`${module.module}-${permission}`} className="grid h-11 place-items-center rounded-xl bg-slate-50 dark:bg-white/5">
                    {module.permissions[permission] ? <Check className="h-4 w-4 text-success" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Email, in-app, digests, summaries and risk alerts.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-3">
        {notificationSettings.map((setting) => (
          <div key={setting.label} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div>
              <p className="font-extrabold">{setting.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{setting.description}</p>
            </div>
            <button
              className={cn("relative h-7 w-12 rounded-full transition", setting.enabled ? "bg-primary" : "bg-slate-300")}
              aria-label={`Toggle ${setting.label}`}
            >
              <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition", setting.enabled ? "left-6" : "left-1")} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActivityTimeline({ compact = false }: { compact?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{compact ? "Recent Events" : "Platform Activity"}</CardTitle>
          <CardDescription>Operational activity across the workspace.</CardDescription>
        </div>
        <Clock className="h-6 w-6 text-primary" />
      </CardHeader>
      <div className="space-y-3">
        {platformActivities.slice(0, compact ? 4 : platformActivities.length).map((event, index) => (
          <div key={`${event.event}-${event.time}`} className="flex gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", index === 0 ? "bg-[#f2efff] text-primary" : "bg-white text-slate-500 shadow-sm dark:bg-slate-900")}>
              <Activity className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-extrabold">{event.event}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{event.detail}</p>
                </div>
                <Badge tone={event.result === "Success" ? "success" : "danger"}>{event.result}</Badge>
              </div>
              <p className="mt-2 text-xs font-bold text-muted">{event.user} - {event.time} - {event.category}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CommandCenter() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Command Center</CardTitle>
          <CardDescription>Ctrl + K actions prepared for enterprise navigation.</CardDescription>
        </div>
        <Command className="h-6 w-6 text-primary" />
      </CardHeader>
      <div className="grid gap-3 md:grid-cols-5">
        {commandActions.map((action) => (
          <Link key={action.label} to={action.href} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-primary/30 hover:bg-[#f6f4ff] dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-extrabold uppercase text-primary">{action.category}</p>
            <p className="mt-2 font-extrabold">{action.label}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function EnterpriseTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="text-muted">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-100 dark:border-white/10">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-4 align-middle font-semibold text-ink dark:text-white">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone: BadgeTone =
    normalized.includes("high") ||
    normalized.includes("denied") ||
    normalized.includes("failed") ||
    normalized.includes("revoked") ||
    normalized.includes("rejected") ||
    normalized.includes("expired") ||
    normalized.includes("suspended") ? "danger" :
    normalized.includes("active") ||
    normalized.includes("success") ||
    normalized.includes("allowed") ||
    normalized.includes("paid") ||
    normalized.includes("connected") ||
    normalized.includes("open") ? "success" :
      normalized.includes("pending") ||
      normalized.includes("progress") ||
      normalized.includes("available") ||
      normalized.includes("medium") ||
      normalized.includes("processing") ? "warning" :
        "neutral";

  return <Badge tone={tone}>{value}</Badge>;
}

function ProgressBar({ value, tone = "primary" }: { value: number; tone?: EnterpriseTone }) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <span className={cn("block h-full rounded-full", toneFill(tone))} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function ChatBubble({ sender, text, self = false }: { sender: string; text: string; self?: boolean }) {
  return (
    <div className={cn("flex", self ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[82%] rounded-2xl p-4", self ? "bg-primary text-white" : "bg-slate-50 dark:bg-white/5")}>
        <p className={cn("text-xs font-extrabold uppercase", self ? "text-white/70" : "text-primary")}>{sender}</p>
        <p className="mt-2 text-sm font-semibold leading-6">{text}</p>
      </div>
    </div>
  );
}

function badgeTone(tone: EnterpriseTone): BadgeTone {
  if (tone === "success") return "success";
  if (tone === "warning") return "warning";
  if (tone === "danger") return "danger";
  if (tone === "primary") return "primary";
  return "neutral";
}

function toneSurface(tone: EnterpriseTone) {
  return tone === "success" ? "bg-green-50 dark:bg-green-950/30" :
    tone === "warning" ? "bg-amber-50 dark:bg-amber-950/30" :
      tone === "danger" ? "bg-red-50 dark:bg-red-950/30" :
        tone === "primary" ? "bg-[#f2efff] dark:bg-primary/20" : "bg-slate-100 dark:bg-white/10";
}

function toneText(tone: EnterpriseTone) {
  return tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning" :
      tone === "danger" ? "text-danger" :
        tone === "primary" ? "text-primary" : "text-muted";
}

function toneFill(tone: EnterpriseTone) {
  return tone === "success" ? "bg-success" :
    tone === "warning" ? "bg-warning" :
      tone === "danger" ? "bg-danger" :
        tone === "primary" ? "bg-primary" : "bg-slate-400";
}
