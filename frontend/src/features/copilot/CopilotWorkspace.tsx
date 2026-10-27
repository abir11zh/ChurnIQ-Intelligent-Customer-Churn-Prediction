import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  History,
  Lightbulb,
  Mic,
  RefreshCw,
  Search,
  Send,
  Share2,
  Sparkles,
  User
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { EmptyState } from "../../components/common/States";
import { useToast } from "../../components/common/ToastProvider";
import { downloadCsv } from "../../lib/exportUtils";
import { cn } from "../../lib/utils";
import {
  churnTrendData,
  contextKpis,
  conversationGroups,
  copilotQuickActions,
  generateCopilotAnswer,
  highRiskCustomers,
  knowledgeSources,
  liveInsights,
  recommendedPrompts,
  reportTemplates,
  welcomePrompts,
  type CopilotAnswer,
  type CopilotVisual
} from "./copilotData";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

type CopilotMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  displayText?: string;
  timestamp: string;
  answer?: CopilotAnswer;
};

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

const storageKey = "churniq:copilot-messages";

const seedMessages: CopilotMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Welcome to CHURNIQ AI Copilot. Ask me about customers, predictions, SHAP explanations, revenue, retention, campaigns or reports.",
    displayText: "Welcome to CHURNIQ AI Copilot. Ask me about customers, predictions, SHAP explanations, revenue, retention, campaigns or reports.",
    timestamp: "Now"
  }
];

function exportConversationHistory() {
  return downloadCsv(
    "copilot_history",
    conversationGroups.flatMap((group) =>
      group.items.map((item) => ({
        period: group.label,
        title: item.title,
        preview: item.preview,
        time: item.time
      }))
    )
  );
}

export function CopilotWorkspacePage() {
  const [messages, setMessages] = useState<CopilotMessage[]>(() => readSavedMessages());
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-14)));
  }, [messages]);

  const hasUserMessages = messages.some((message) => message.role === "user");

  const submitPrompt = (prompt = input) => {
    const trimmed = prompt.trim();
    if (!trimmed || isThinking) return;

    const now = formatTime();
    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: now
    };
    const answer = generateCopilotAnswer(trimmed);
    const assistantId = `assistant-${Date.now() + 1}`;

    setInput("");
    setActivePrompt(trimmed);
    setIsThinking(true);
    setMessages((items) => [
      ...items,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        text: answer.answer,
        displayText: "",
        timestamp: now,
        answer
      }
    ]);

    const words = answer.answer.split(" ");
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setMessages((items) =>
        items.map((item) =>
          item.id === assistantId
            ? { ...item, displayText: words.slice(0, index).join(" ") }
            : item
        )
      );

      if (index >= words.length) {
        window.clearInterval(interval);
        setIsThinking(false);
      }
    }, 34);
  };

  const regenerateLast = () => {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (lastUser) submitPrompt(lastUser.text);
  };

  const clearConversation = () => {
    setMessages(seedMessages);
    setActivePrompt(null);
  };

  return (
    <CopilotPage
      eyebrow="AI Copilot"
      title="CHURNIQ AI Copilot"
      subtitle="Powered by Customer Intelligence. Ask business questions and get charts, customers, actions and reports inside the conversation."
      action={<StatusPill />}
    >
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_330px]">
        <ConversationSidebar onPrompt={submitPrompt} />

        <Card className="min-h-[760px] p-0">
          <CopilotHeader activePrompt={activePrompt} onClear={clearConversation} />
          <div className="flex h-[560px] flex-col gap-5 overflow-y-auto border-y border-slate-100 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/5">
            {!hasUserMessages && <WelcomeScreen onPrompt={submitPrompt} />}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} onRegenerate={regenerateLast} />
            ))}
            {isThinking && <TypingIndicator />}
          </div>
          <ChatComposer value={input} onChange={setInput} onSubmit={() => submitPrompt()} isThinking={isThinking} />
        </Card>

        <ContextPanel />
      </div>
    </CopilotPage>
  );
}

export function CopilotHistoryPage() {
  const [query, setQuery] = useState("");
  const { toast } = useToast();
  const handleExport = () => {
    const filename = exportConversationHistory();
    toast({ tone: "success", title: "Copilot history exported", description: filename });
  };
  const filteredGroups = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return conversationGroups;
    return conversationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => `${item.title} ${item.preview}`.toLowerCase().includes(term))
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <CopilotPage
      eyebrow="Conversation History"
      title="Every business question, saved."
      subtitle="Search previous Copilot sessions by topic, customer, revenue risk, SHAP driver or report."
      action={<Button variant="outline" onClick={handleExport}><Download className="h-4 w-4" /> Export History</Button>}
    >
      <Card>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Search conversations..." />
        </div>
      </Card>

      {filteredGroups.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredGroups.map((group) => (
            <Card key={group.label}>
              <CardHeader>
                <div>
                  <CardTitle>{group.label}</CardTitle>
                  <CardDescription>{group.items.length} saved conversations</CardDescription>
                </div>
              </CardHeader>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <Link key={item.title} to="/copilot" className="block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-extrabold">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted">{item.preview}</p>
                      </div>
                      <Badge tone="primary">{item.time}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={History} title="No conversations found" description="Try searching for churn, revenue, SHAP, retention or report." />
      )}
    </CopilotPage>
  );
}

export function CopilotInsightsPage() {
  return (
    <CopilotPage
      eyebrow="Copilot Insights"
      title="Live AI insight cards."
      subtitle="A continuously updated layer of business intelligence from customers, predictions, SHAP explanations and revenue metrics."
      action={<Button asChild><Link to="/copilot"><Sparkles className="h-4 w-4" /> Ask Copilot</Link></Button>}
    >
      <div className="grid gap-5 lg:grid-cols-4">
        {liveInsights.map((insight) => (
          <Card key={insight.title} className="transition hover:-translate-y-1 hover:shadow-soft">
            <Badge tone={insight.tone}>{insight.title}</Badge>
            <p className="mt-4 text-sm font-bold leading-6">{insight.text}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>AI-generated dashboard</CardTitle>
              <CardDescription>Churn trends and revenue risk generated as a smart visual response.</CardDescription>
            </div>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={churnTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
                <XAxis dataKey="label" tick={{ fill: "#6B7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="churn" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="revenue" stroke="#6D5BFF" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recommended prompts</CardTitle>
              <CardDescription>Questions designed for managers, analysts and executives.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            {recommendedPrompts.map((prompt) => (
              <Link key={prompt} to="/copilot" className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-bold transition hover:border-primary/30 hover:bg-[#f6f4ff] hover:text-primary dark:border-white/10 dark:bg-white/5">
                {prompt}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <KnowledgeSourceGrid />
    </CopilotPage>
  );
}

export function CopilotReportsPage() {
  return (
    <CopilotPage
      eyebrow="AI Report Generator"
      title="Generate executive-ready reports from conversation."
      subtitle="Turn Copilot answers into exportable business documents with summary, revenue analysis, risk analysis and actions."
      action={<Button><Download className="h-4 w-4" /> Download PDF</Button>}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {reportTemplates.map((template) => (
          <Card key={template.title} className="transition hover:-translate-y-1 hover:shadow-soft">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2efff] text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-extrabold">{template.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{template.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {template.sections.map((section) => (
                <Badge key={section} tone="primary">{section}</Badge>
              ))}
            </div>
            <Button className="mt-6 w-full">Generate Report</Button>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Executive report preview</CardTitle>
            <CardDescription>Generated from current churn intelligence, predictions, SHAP and retention opportunities.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Share2 className="h-4 w-4" /> Share</Button>
            <Button variant="outline"><Download className="h-4 w-4" /> Export</Button>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Summary", "Churn is concentrated in month-to-month customers with price pressure and missing support."],
            ["Revenue Analysis", "$45,230 is at risk, with $18,400 potential savings from targeted plays."],
            ["Risk Analysis", "421 customers are high risk and 82 are critical."],
            ["Customer Analysis", "VIP and High Value segments deserve immediate account-manager outreach."],
            ["Recommended Actions", "Launch annual incentive, support bundle and retention call campaigns."],
            ["Next Steps", "Create campaign, export report, monitor prediction movement weekly."]
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
              <p className="font-extrabold">{title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </Card>
    </CopilotPage>
  );
}

function CopilotPage({
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
        {[
          { label: "Copilot", href: "/copilot", icon: BrainCircuit },
          { label: "History", href: "/copilot/history", icon: History },
          { label: "Insights", href: "/copilot/insights", icon: Lightbulb },
          { label: "Reports", href: "/copilot/reports", icon: FileText }
        ].map((item) => (
          <Button key={item.href} asChild variant="outline" size="sm">
            <Link to={item.href}><item.icon className="h-4 w-4" /> {item.label}</Link>
          </Button>
        ))}
      </div>
      {children}
    </motion.div>
  );
}

function CopilotHeader({ activePrompt, onClear }: { activePrompt: string | null; onClear: () => void }) {
  return (
    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-soft">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-extrabold">CHURNIQ AI Copilot</p>
          <p className="text-sm text-muted">Powered by Customer Intelligence</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill />
        {activePrompt && <Badge tone="primary">Analyzing Data</Badge>}
        <Button variant="outline" size="sm" onClick={onClear}><RefreshCw className="h-4 w-4" /> New chat</Button>
      </div>
    </div>
  );
}

function StatusPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-extrabold text-success">
      <span className="h-2 w-2 rounded-full bg-success" />
      Online - Ready
    </div>
  );
}

function WelcomeScreen({ onPrompt }: { onPrompt: (prompt: string) => void }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-extrabold">What do you want to understand?</p>
          <p className="mt-1 text-sm leading-6 text-muted">Ask about customers, predictions, analytics, SHAP, revenue, retention, segments or campaigns.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {welcomePrompts.map((prompt) => (
          <button key={prompt} onClick={() => onPrompt(prompt)} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-[#f6f4ff] hover:text-primary dark:border-white/10 dark:bg-white/5">
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatMessage({ message, onRegenerate }: { message: CopilotMessage; onRegenerate: () => void }) {
  const isUser = message.role === "user";
  const visibleText = message.displayText ?? message.text;

  return (
    <div className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#f2efff] text-primary">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={cn("max-w-[88%] rounded-3xl p-4 shadow-sm", isUser ? "bg-primary text-white" : "bg-white text-ink dark:bg-slate-900 dark:text-white")}>
        <div className="mb-2 flex items-center gap-2 text-xs opacity-75">
          {isUser ? <User className="h-3.5 w-3.5" /> : <BrainCircuit className="h-3.5 w-3.5" />}
          <span>{isUser ? "You" : "CHURNIQ AI"}</span>
          <span>{message.timestamp}</span>
        </div>
        {message.answer?.title && <p className="mb-2 font-extrabold">{message.answer.title}</p>}
        <p className="text-sm leading-7">{visibleText}</p>
        {message.answer && visibleText === message.text && (
          <>
            <div className="mt-4 grid gap-2">
              {message.answer.bullets.map((bullet) => (
                <div key={bullet} className="flex gap-2 text-sm leading-6">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
            <SmartVisual visual={message.answer.visual} />
            <div className="mt-4 flex flex-wrap gap-2">
              {message.answer.actions.map((action) => <ActionButton key={action.label} action={action} />)}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-muted dark:border-white/10">
              <span>Sources: {message.answer.sources.join(", ")}</span>
              <div className="flex gap-2">
                <button onClick={() => copyText(message.text)} className="inline-flex items-center gap-1 font-bold text-primary"><Copy className="h-3.5 w-3.5" /> Copy</button>
                <button onClick={onRegenerate} className="inline-flex items-center gap-1 font-bold text-primary"><RefreshCw className="h-3.5 w-3.5" /> Regenerate</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f2efff] text-primary">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900">
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: `${dot * 120}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatComposer({ value, onChange, onSubmit, isThinking }: { value: string; onChange: (value: string) => void; onSubmit: () => void; isThinking: boolean }) {
  return (
    <div className="p-5">
      <div className="flex gap-3 rounded-3xl border border-slate-100 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
        <Button variant="ghost" size="icon" aria-label="Voice assistant placeholder" title="Voice assistant ready">
          <Mic className="h-4 w-4" />
        </Button>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) onSubmit();
          }}
          className="border-0 bg-transparent shadow-none focus:ring-0"
          placeholder="Ask about customers, predictions, SHAP, revenue, retention..."
        />
        <Button onClick={onSubmit} disabled={isThinking || !value.trim()}><Send className="h-4 w-4" /> Send</Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {recommendedPrompts.slice(0, 4).map((prompt) => (
          <button key={prompt} onClick={() => onChange(prompt)} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-muted transition hover:bg-[#f2efff] hover:text-primary dark:bg-white/5">
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConversationSidebar({ onPrompt }: { onPrompt: (prompt: string) => void }) {
  return (
    <Card className="h-fit xl:sticky xl:top-24">
      <CardHeader>
        <div>
          <CardTitle>Conversation History</CardTitle>
          <CardDescription>Saved sessions by time period.</CardDescription>
        </div>
      </CardHeader>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input className="pl-10" placeholder="Search history..." />
      </div>
      <div className="mt-5 space-y-5">
        {conversationGroups.slice(0, 3).map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-xs font-extrabold uppercase text-muted">{group.label}</p>
            <div className="space-y-2">
              {group.items.map((item) => (
                <button key={item.title} onClick={() => onPrompt(item.preview)} className="w-full rounded-2xl bg-slate-50 p-3 text-left transition hover:bg-[#f6f4ff] dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-extrabold">{item.title}</p>
                    <span className="text-xs font-bold text-muted">{item.time}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{item.preview}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button asChild variant="outline" className="mt-5 w-full"><Link to="/copilot/history">View all history</Link></Button>
    </Card>
  );
}

function ContextPanel() {
  return (
    <div className="space-y-5 xl:sticky xl:top-24 xl:h-fit">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Context & Insights</CardTitle>
            <CardDescription>Current platform intelligence.</CardDescription>
          </div>
          <Badge tone="success">Live</Badge>
        </CardHeader>
        <div className="grid gap-3">
          {contextKpis.map((kpi) => (
            <div key={kpi.label} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-muted">{kpi.label}</p>
                  <p className="mt-1 text-xl font-extrabold">{kpi.value}</p>
                </div>
                <Badge tone={kpi.tone}>{kpi.tone}</Badge>
              </div>
              <p className="mt-2 text-xs font-semibold text-muted">{kpi.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>AI Recommendations</CardTitle>
        <div className="mt-4 space-y-3">
          {liveInsights.slice(0, 3).map((insight) => (
            <div key={insight.title} className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-extrabold">{insight.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{insight.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>AI Actions</CardTitle>
        <div className="mt-4 grid gap-2">
          {copilotQuickActions.map((action) => (
            <Button key={action.label} asChild variant="outline" className="justify-start">
              <Link to={action.href}><action.icon className="h-4 w-4" /> {action.label}</Link>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SmartVisual({ visual }: { visual?: CopilotVisual }) {
  if (!visual) return null;

  if (visual.type === "metrics") {
    return (
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="mb-3 font-extrabold">{visual.title}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {visual.metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900">
              <p className="text-xs font-bold uppercase text-muted">{metric.label}</p>
              <p className="mt-1 text-xl font-extrabold">{metric.value}</p>
              <Badge className="mt-2" tone={metric.tone}>{metric.tone}</Badge>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.type === "chart") {
    return (
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="mb-3 font-extrabold">{visual.title}</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visual.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="churn" stroke="#EF4444" strokeWidth={3} />
              <Line type="monotone" dataKey="revenue" stroke="#6D5BFF" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (visual.type === "customers") {
    return (
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="mb-3 font-extrabold">{visual.title}</p>
        <div className="space-y-3">
          {visual.customers.map((customer) => (
            <div key={customer.id} className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold">{customer.name}</p>
                  <p className="text-xs text-muted">{customer.id} - {customer.segment} - {customer.revenue}</p>
                </div>
                <Badge tone={customer.risk >= 80 ? "danger" : "warning"}>{customer.risk}%</Badge>
              </div>
              <p className="mt-2 text-xs font-semibold text-muted">{customer.action}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.type === "table") {
    return (
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-white/5">
        <p className="p-4 font-extrabold">{visual.title}</p>
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50 text-muted dark:bg-white/5">
            <tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Action</th></tr>
          </thead>
          <tbody>
            {visual.rows.map((row) => (
              <tr key={row.label} className="border-t border-slate-100 dark:border-white/10">
                <td className="px-4 py-3 font-extrabold">{row.label}</td>
                <td className="px-4 py-3">{row.value}</td>
                <td className="px-4 py-3 text-primary">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="mb-3 font-extrabold">{visual.title}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {visual.sections.map((section) => (
          <div key={section.title} className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900">
            <p className="font-extrabold">{section.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnowledgeSourceGrid() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>AI Knowledge Sources</CardTitle>
          <CardDescription>The Copilot understands the core CHURNIQ AI workspace areas.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-3">
        {knowledgeSources.map((source) => (
          <div key={source.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2efff] text-primary">
                <source.icon className="h-4 w-4" />
              </div>
              <Badge tone="success">{source.status}</Badge>
            </div>
            <p className="mt-4 font-extrabold">{source.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActionButton({ action }: { action: NonNullable<CopilotAnswer["actions"]>[number] }) {
  if (action.tone === "primary") {
    return <Button asChild size="sm"><Link to={action.href}>{action.label} <ArrowRight className="h-4 w-4" /></Link></Button>;
  }

  return (
    <Button asChild size="sm" variant={action.tone ?? "outline"}>
      <Link to={action.href}>{action.label} <ArrowRight className="h-4 w-4" /></Link>
    </Button>
  );
}

function readSavedMessages() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return seedMessages;
    const parsed = JSON.parse(saved) as CopilotMessage[];
    return Array.isArray(parsed) && parsed.length ? parsed : seedMessages;
  } catch {
    return seedMessages;
  }
}

function copyText(text: string) {
  if (navigator.clipboard) {
    void navigator.clipboard.writeText(text);
  }
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
