import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, Reorder } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Bot,
  CreditCard,
  FileText,
  GripVertical,
  Gauge,
  Megaphone,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Users,
  type LucideIcon
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { customers } from "../../data/mock";

type Tone = "primary" | "success" | "warning" | "danger" | "neutral";

type SmartWidget = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  content: ReactNode;
};

const presets: Record<string, string[]> = {
  Executive: ["briefing", "kpis", "predictions", "reports", "customers", "campaigns", "recommendations", "progress", "achievements", "workspace"],
  Analyst: ["kpis", "predictions", "customers", "reports", "briefing", "recommendations", "progress", "campaigns", "achievements", "workspace"],
  Retention: ["briefing", "campaigns", "customers", "predictions", "reports", "recommendations", "achievements", "progress", "kpis", "workspace"]
};

const allWidgetIds = Array.from(new Set(Object.values(presets).flat()));

function normalizeWidgetOrder(value: unknown) {
  const saved = Array.isArray(value) ? value.filter((id): id is string => typeof id === "string" && allWidgetIds.includes(id)) : [];
  return [...saved, ...allWidgetIds.filter((id) => !saved.includes(id))];
}

const quickActions = [
  { label: "Create Prediction", href: "/predictions/single", icon: Plus, detail: "Score a customer with CatBoost" },
  { label: "Open Copilot", href: "/copilot", icon: Bot, detail: "Ask business questions" },
  { label: "Generate Report", href: "/reports", icon: FileText, detail: "Create an executive summary" },
  { label: "Review High Risk", href: "/customers", icon: Target, detail: "Open critical customer list" },
  { label: "Launch Campaign", href: "/retention/campaigns", icon: Megaphone, detail: "Start a retention workflow" }
];

const achievements = [
  { title: "100 Predictions Completed", progress: 100, detail: "CatBoost scoring milestone reached.", tone: "success" as Tone, icon: Gauge },
  { title: "1000 Customers Analyzed", progress: 100, detail: "Customer intelligence workspace is active.", tone: "success" as Tone, icon: Users },
  { title: "First Retention Campaign", progress: 100, detail: "Campaign workflow launched.", tone: "primary" as Tone, icon: Megaphone },
  { title: "Revenue Saver", progress: 76, detail: "$31.5K potential savings identified.", tone: "warning" as Tone, icon: CreditCard },
  { title: "Insight Explorer", progress: 64, detail: "Keep exploring AI recommendations.", tone: "primary" as Tone, icon: Sparkles }
];

const usageProgress = [
  { label: "Analytics Usage", value: 82, icon: BarChart3 },
  { label: "Prediction Usage", value: 74, icon: Gauge },
  { label: "AI Copilot Usage", value: 61, icon: Bot },
  { label: "Retention Usage", value: 68, icon: Target }
];

const recommendations = [
  { title: "You frequently analyze churn trends.", action: "Open Analytics Hub?", href: "/analytics", icon: BarChart3 },
  { title: "You recently created campaigns.", action: "Review campaign performance?", href: "/retention/campaigns", icon: Megaphone },
  { title: "Critical customers increased today.", action: "Review high-risk customers?", href: "/customers", icon: Bell },
  { title: "CatBoost predictions are trending up.", action: "Open Prediction Insights?", href: "/predictions/insights", icon: Sparkles }
];

const myKpis = [
  { label: "My Predictions", value: "1,253", trend: "+18 today", icon: Gauge, tone: "primary" as Tone },
  { label: "My Reports", value: "18", trend: "3 ready", icon: FileText, tone: "success" as Tone },
  { label: "My Customers", value: "421", trend: "high risk", icon: Users, tone: "danger" as Tone },
  { label: "My Campaigns", value: "9", trend: "$31.5K saved", icon: Megaphone, tone: "warning" as Tone }
];

export function SmartHomeDashboard() {
  const displayName = "Zakaria";
  const [savedPreset, setSavedPreset] = useState("Executive");
  const [layoutStatus, setLayoutStatus] = useState("Auto-saved");
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("churniq_smart_home_layout");
      return saved ? normalizeWidgetOrder(JSON.parse(saved)) : presets.Executive;
    } catch {
      return presets.Executive;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("churniq_smart_home_layout", JSON.stringify(widgetOrder));
    } catch {
      // Layout persistence is optional in restricted browser contexts.
    }
  }, [widgetOrder]);

  const widgets = useMemo<Record<string, SmartWidget>>(() => ({
    briefing: {
      id: "briefing",
      title: "Daily AI Briefing",
      description: "Today's churn intelligence, generated for your workspace.",
      icon: Sparkles,
      content: <DailyBriefing />
    },
    kpis: {
      id: "kpis",
      title: "My KPIs",
      description: "Personal operational scorecard.",
      icon: BarChart3,
      content: <MyKpis />
    },
    predictions: {
      id: "predictions",
      title: "My Predictions",
      description: "Recent CatBoost prediction activity.",
      icon: Gauge,
      content: <PredictionSnapshot />
    },
    customers: {
      id: "customers",
      title: "My Customers",
      description: "Customers that need your attention.",
      icon: Users,
      content: <CustomerSnapshot />
    },
    campaigns: {
      id: "campaigns",
      title: "My Campaigns",
      description: "Retention work currently in motion.",
      icon: Megaphone,
      content: <CampaignSnapshot />
    },
    reports: {
      id: "reports",
      title: "My Reports",
      description: "Executive reports and intelligence exports prepared for you.",
      icon: FileText,
      content: <ReportsSnapshot />
    },
    recommendations: {
      id: "recommendations",
      title: "Smart Recommendations",
      description: "Suggested next steps based on your behavior.",
      icon: Bot,
      content: <SmartRecommendations />
    },
    achievements: {
      id: "achievements",
      title: "Achievements",
      description: "Progress milestones that make the workspace feel alive.",
      icon: Award,
      content: <Achievements />
    },
    progress: {
      id: "progress",
      title: "Progress Tracking",
      description: "Your usage across intelligence workflows.",
      icon: Activity,
      content: <ProgressTracking />
    },
    workspace: {
      id: "workspace",
      title: "Smart Workspace",
      description: "Drag widgets, choose presets and save your layout.",
      icon: GripVertical,
      content: <WorkspaceControls preset={savedPreset} onPreset={setSavedPreset} onApply={(name) => setWidgetOrder(presets[name])} />
    }
  }), [savedPreset]);

  const orderedWidgets = widgetOrder.filter((id) => widgets[id]);

  const applyPreset = (name: string) => {
    setSavedPreset(name);
    setWidgetOrder(presets[name]);
    setLayoutStatus(`${name} preset applied`);
  };

  const saveLayout = () => {
    try {
      localStorage.setItem("churniq_smart_home_layout", JSON.stringify(widgetOrder));
      setLayoutStatus("Layout saved just now");
    } catch {
      setLayoutStatus("Layout saved for this session");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-gradient-to-br from-primary via-secondary to-accent p-6 text-white">
            <Badge className="bg-white/20 text-white" tone="primary"><Sparkles className="h-3.5 w-3.5" /> Smart Home</Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight">Good Morning {displayName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/82">Today's Churn Intelligence is ready. Your workspace has new high-risk customers, fresh revenue signals and recommended actions.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Daily Summary", "AI Recommendations", "Saved Layout"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/16 p-4 text-sm font-extrabold backdrop-blur">{item}</div>
              ))}
            </div>
          </div>
          <div className="premium-surface p-6 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-ink dark:text-white">Personalized Quick Actions</p>
                <p className="mt-1 text-sm text-muted">Jump into your most useful workflows.</p>
              </div>
              <Badge tone="success">Live workspace</Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.href} className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f6f4ff] dark:bg-white/5 dark:hover:bg-white/10">
                  <action.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-extrabold">{action.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{action.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/88 p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap gap-2">
          {Object.keys(presets).map((name) => (
            <Button key={name} variant={savedPreset === name ? "default" : "outline"} size="sm" onClick={() => applyPreset(name)}>
              {name} preset
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted">{layoutStatus}</span>
          <Button variant="secondary" size="sm" onClick={saveLayout}><RefreshCw className="h-4 w-4" /> Save Layout</Button>
        </div>
      </div>

      <Reorder.Group axis="y" values={orderedWidgets} onReorder={setWidgetOrder} className="grid gap-5 xl:grid-cols-2">
        {orderedWidgets.map((id) => {
          const widget = widgets[id];
          return (
            <Reorder.Item key={id} value={id} className={cn(id === "briefing" || id === "kpis" ? "xl:col-span-2" : "")}>
              <WidgetCard widget={widget} />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </motion.div>
  );
}

function WidgetCard({ widget }: { widget: SmartWidget }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
            <widget.icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{widget.title}</CardTitle>
            <CardDescription>{widget.description}</CardDescription>
          </div>
        </div>
        <GripVertical className="h-5 w-5 text-slate-300" />
      </CardHeader>
      {widget.content}
    </Card>
  );
}

function DailyBriefing() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {[
        ["Daily Summary", "124 customers became high-risk this week.", "warning"],
        ["New High Risk Customers", "18 customers crossed critical risk today.", "danger"],
        ["Revenue Risk Changes", "$12.4K additional revenue is now exposed.", "warning"],
        ["Campaign Performance", "Win-back campaign is trending 14% above baseline.", "success"],
        ["AI Recommendations", "Prioritize support upgrades for 68 customers before Friday.", "primary"]
      ].map(([title, detail, tone]) => (
        <div key={title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
          <Badge tone={tone as Tone}>{title}</Badge>
          <p className="mt-4 text-sm leading-6 text-muted">{detail}</p>
        </div>
      ))}
    </div>
  );
}

function MyKpis() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {myKpis.map((kpi) => (
        <div key={kpi.label} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
          <kpi.icon className="h-5 w-5 text-primary" />
          <p className="mt-4 text-sm font-bold text-muted">{kpi.label}</p>
          <p className="mt-2 text-3xl font-extrabold">{kpi.value}</p>
          <Badge className="mt-3" tone={kpi.tone}>{kpi.trend}</Badge>
        </div>
      ))}
    </div>
  );
}

function PredictionSnapshot() {
  return (
    <div className="space-y-3">
      {["Sarah Johnson - 82% critical", "Michael Chen - 67% high", "Emily Davis - 44% medium"].map((item) => (
        <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
          <span className="font-bold">{item}</span>
          <Badge tone="primary">CatBoost</Badge>
        </div>
      ))}
      <Button asChild variant="outline" className="w-full"><Link to="/predictions/history">Open prediction history <ArrowRight className="h-4 w-4" /></Link></Button>
    </div>
  );
}

function CustomerSnapshot() {
  return (
    <div className="space-y-3">
      {customers.slice(0, 4).map((customer) => (
        <Link key={customer.id} to={`/customers/${customer.id}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 transition hover:bg-[#f6f4ff] dark:bg-white/5 dark:hover:bg-white/10">
          <span>
            <span className="block font-extrabold">{customer.name}</span>
            <span className="text-sm text-muted">{customer.contract} - {customer.revenue}</span>
          </span>
          <Badge tone={customer.risk === "CRITICAL" || customer.risk === "HIGH" ? "danger" : customer.risk === "MEDIUM" ? "warning" : "success"}>{customer.probability}%</Badge>
        </Link>
      ))}
    </div>
  );
}

function CampaignSnapshot() {
  return (
    <div className="grid gap-3">
      {[
        ["VIP Loyalty Shield", "Active", "$18.4K expected saved"],
        ["Technical Support Upgrade", "Draft", "$9.2K expected saved"],
        ["Month-to-month Save Play", "Review", "$31.5K opportunity"]
      ].map(([name, status, value]) => (
        <div key={name} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-extrabold">{name}</p>
            <Badge tone={status === "Active" ? "success" : "warning"}>{status}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ReportsSnapshot() {
  return (
    <div className="grid gap-3">
      {[
        ["Executive Churn Brief", "Ready", "Daily summary for leadership"],
        ["Revenue Risk Report", "Scheduled", "Next export at 09:00"],
        ["Retention ROI Report", "Draft", "Waiting for campaign results"]
      ].map(([name, status, detail]) => (
        <Link key={name} to="/reports" className="rounded-2xl bg-slate-50 p-4 transition hover:bg-[#f6f4ff] dark:bg-white/5 dark:hover:bg-white/10">
          <div className="flex items-center justify-between gap-3">
            <p className="font-extrabold">{name}</p>
            <Badge tone={status === "Ready" ? "success" : status === "Scheduled" ? "primary" : "warning"}>{status}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">{detail}</p>
        </Link>
      ))}
    </div>
  );
}

function SmartRecommendations() {
  return (
    <div className="grid gap-3">
      {recommendations.map((item) => (
        <Link key={item.title} to={item.href} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 transition hover:bg-[#f6f4ff] dark:bg-white/5 dark:hover:bg-white/10">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm dark:bg-slate-900">
            <item.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">{item.title}</p>
            <p className="mt-1 text-sm text-primary">{item.action}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Achievements() {
  return (
    <div className="grid gap-3">
      {achievements.map((achievement) => (
        <div key={achievement.title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
          <div className="flex items-start gap-3">
            <achievement.icon className="mt-1 h-5 w-5 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-extrabold">{achievement.title}</p>
                <Badge tone={achievement.tone}>{achievement.progress}%</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">{achievement.detail}</p>
              <ProgressBar value={achievement.progress} tone={achievement.tone} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressTracking() {
  return (
    <div className="space-y-4">
      {usageProgress.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2 font-extrabold"><item.icon className="h-4 w-4 text-primary" /> {item.label}</span>
            <span className="font-bold text-muted">{item.value}%</span>
          </div>
          <ProgressBar value={item.value} tone={item.value > 75 ? "success" : "primary"} />
        </div>
      ))}
    </div>
  );
}

function WorkspaceControls({ preset, onPreset, onApply }: { preset: string; onPreset: (name: string) => void; onApply: (name: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
        <p className="font-extrabold">Current preset: {preset}</p>
        <p className="mt-1 text-sm text-muted">Drag widgets vertically to rearrange the workspace. Layouts save automatically in this browser.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {Object.keys(presets).map((name) => (
          <Button key={name} variant={preset === name ? "default" : "outline"} onClick={() => { onPreset(name); onApply(name); }}>{name}</Button>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ value, tone }: { value: number; tone: Tone }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <span className={cn("block h-full rounded-full", tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : tone === "danger" ? "bg-danger" : "bg-primary")} style={{ width: `${value}%` }} />
    </div>
  );
}
