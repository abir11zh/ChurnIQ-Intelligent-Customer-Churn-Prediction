import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
  CheckCircle2,
  CreditCard,
  FileText,
  LogOut,
  Megaphone,
  Menu,
  Mic,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  UserCircle,
  X
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { globalSearchData, mockNotifications, mockWorkspace, notificationIcons } from "../data/foundation";
import { navGroups } from "../data/mock";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { useAuth, type Permission, type Role } from "../lib/auth";
import { useToast } from "./common/ToastProvider";

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "auto">("light");
  const [accentColor, setAccentColor] = useState("#6D5BFF");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    try {
      return localStorage.getItem("churniq_onboarding_done") !== "true";
    } catch {
      return true;
    }
  });
  const { user, setRole, signOut, canAny } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nextDarkMode = themeMode === "dark" || (themeMode === "auto" && prefersDark);
      setDarkMode(nextDarkMode);
      document.documentElement.classList.toggle("dark", nextDarkMode);
      document.documentElement.style.setProperty("--churniq-primary", accentColor);
    };
    applyTheme();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [themeMode, accentColor]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return globalSearchData.slice(0, 8);
    return globalSearchData
      .filter((item) => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query))
      .slice(0, 10);
  }, [searchQuery]);

  const visibleNavGroups = useMemo(
    () =>
      navGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => canAny(routePermissions[item.href] ?? ["dashboard:read"]))
        }))
        .filter((group) => group.items.length > 0),
    [canAny]
  );

  const openSearchResult = (href: string) => {
    navigate(href);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const completeOnboarding = () => {
    try {
      localStorage.setItem("churniq_onboarding_done", "true");
    } catch {
      // Local storage can be unavailable in locked-down browser contexts.
    }
    setOnboardingOpen(false);
  };

  const cycleTheme = () => {
    setThemeMode((mode) => (mode === "light" ? "dark" : mode === "dark" ? "auto" : "light"));
  };

  const logout = () => {
    if (!window.confirm("Sign out of your ChurnIQ AI workspace?")) return;
    signOut();
    toast({ tone: "success", title: "Logged out", description: "Your secure workspace session has ended." });
    navigate("/auth/login", { replace: true });
  };

  const renderNav = (collapsed = sidebarCollapsed) => (
    <nav className="mt-7 space-y-5">
      {visibleNavGroups.map((group) => (
        <div key={group.label}>
          {!collapsed && <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{group.label}</p>}
          <div className="space-y-1">
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/smart-home" || item.href === "/dashboard" || item.href === "/shap" || item.href === "/copilot" || item.href === "/retention" || item.href === "/executive" || item.href === "/mlops" || item.href === "/integrations" || item.href === "/settings" || item.href === "/organization"}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-[#f6f4ff] hover:text-primary dark:text-slate-300 dark:hover:bg-white/10",
                    collapsed && "justify-center px-2",
                    isActive && "bg-[#f2efff] text-primary shadow-sm dark:bg-primary/20 dark:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn("absolute left-0 top-2 h-6 w-1 rounded-r-full bg-primary opacity-0 transition", isActive && "opacity-100")} />
                    <span className={cn("grid h-8 w-8 place-items-center rounded-xl transition group-hover:bg-white dark:group-hover:bg-white/10", isActive ? "bg-white text-primary dark:bg-white/10" : "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300")}>
                      <item.icon className="h-4 w-4 shrink-0" />
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#fbfbff] text-ink dark:bg-slate-950 dark:text-white">
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden overflow-y-auto border-r border-slate-100 bg-white/86 p-5 backdrop-blur-xl transition-all dark:border-white/10 dark:bg-slate-950/92 lg:block", sidebarCollapsed ? "w-20" : "w-72")}>
        <div className="flex items-center justify-between gap-3">
          <Logo compact={sidebarCollapsed} />
          {!sidebarCollapsed && (
            <button className="rounded-xl p-2 text-muted transition hover:bg-slate-100 hover:text-primary dark:hover:bg-white/10" aria-label="Collapse sidebar" onClick={() => setSidebarCollapsed(true)}>
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
          {sidebarCollapsed && (
            <button className="rounded-xl p-2 text-muted transition hover:bg-slate-100 hover:text-primary dark:hover:bg-white/10" aria-label="Expand sidebar" onClick={() => setSidebarCollapsed(false)}>
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
        </div>
        {!sidebarCollapsed && <p className="mt-2 px-1 text-xs font-semibold text-muted">Customer Intelligence</p>}
        {renderNav()}
        {!sidebarCollapsed && (
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-primary to-secondary p-4 text-white shadow-soft">
            <p className="text-sm font-bold">Secure SaaS workspace</p>
            <p className="mt-1 text-xs text-white/80">Role-ready access, protected analytics and enterprise UX.</p>
          </div>
        )}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="h-full w-80 overflow-y-auto bg-white p-5 shadow-soft dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <Logo />
                <p className="mt-1 text-xs font-semibold text-muted">Customer Intelligence</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            {renderNav(false)}
          </aside>
        </div>
      )}

      <div className={cn("transition-all", sidebarCollapsed ? "lg:pl-20" : "lg:pl-72")}>
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-100 bg-white/86 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/86 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <button
              onClick={() => setSearchOpen(true)}
              className="relative hidden h-11 w-[min(420px,35vw)] rounded-xl border border-slate-200 bg-white px-10 text-left text-sm text-muted shadow-sm transition hover:border-primary/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 md:block"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              Search customers, predictions, reports, users, settings...
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-muted dark:bg-white/10">Ctrl K</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <SelectWorkspace />
            <Button className="hidden sm:inline-flex" onClick={() => navigate("/predictions/single")}><Plus className="h-4 w-4" /> New Prediction</Button>
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)} className="md:hidden"><Search className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" aria-label={`Theme mode: ${themeMode}`} onClick={cycleTheme}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <div className="relative">
              <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => { setNotificationsOpen((value) => !value); setUserMenuOpen(false); }}>
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
              </Button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-[min(420px,calc(100vw-32px))] rounded-2xl border border-slate-100 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-slate-900">
                  <div className="flex items-center justify-between px-2 pb-2">
                    <p className="text-sm font-extrabold">Notification Center</p>
                    <Badge tone="primary">{mockNotifications.filter((item) => !item.read).length} unread</Badge>
                  </div>
                  <div className="max-h-[420px] space-y-2 overflow-y-auto">
                    {mockNotifications.map((item) => {
                      const Icon = notificationIcons[item.type];
                      return (
                        <button key={item.id} onClick={() => item.href && navigate(item.href)} className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-[#f6f4ff] dark:hover:bg-white/10">
                          <div className="flex gap-3">
                            <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", item.read ? "bg-slate-50 text-muted dark:bg-white/5" : "bg-[#f2efff] text-primary")}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-extrabold">{item.title}</p>
                                {!item.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                              </div>
                              <p className="mt-1 text-xs leading-5 text-muted">{item.description}</p>
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold text-muted">{item.time}</span>
                                {item.actionLabel && <span className="text-xs font-extrabold text-primary">{item.actionLabel}</span>}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen((value) => !value); setNotificationsOpen(false); }}
                className="ml-1 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm transition hover:border-primary/20 dark:border-white/10 dark:bg-white/5"
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-primary text-xs font-extrabold text-white">
                  {(user?.fullName ?? "Guest").split(" ").map((part) => part[0]).join("").slice(0, 2)}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-bold">{user?.fullName ?? "Guest"}</p>
                  <p className="text-xs font-semibold text-muted">{user?.role ?? "Viewer"}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-14 w-72 rounded-2xl border border-slate-100 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-slate-900">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="font-extrabold">{user?.fullName}</p>
                    <p className="mt-1 text-xs font-semibold text-muted">{user?.email}</p>
                    <select
                      value={user?.role ?? "Viewer"}
                      onChange={(event) => setRole(event.target.value as Role)}
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-muted outline-none dark:border-white/10 dark:bg-slate-950"
                      aria-label="Role"
                    >
                      {["Owner", "Admin", "Manager", "Analyst", "Viewer"].map((role) => <option key={role}>{role}</option>)}
                    </select>
                    <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                      <select
                        value={themeMode}
                        onChange={(event) => setThemeMode(event.target.value as "light" | "dark" | "auto")}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-muted outline-none dark:border-white/10 dark:bg-slate-950"
                        aria-label="Theme mode"
                      >
                        <option value="light">Light mode</option>
                        <option value="dark">Dark mode</option>
                        <option value="auto">Auto mode</option>
                      </select>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(event) => setAccentColor(event.target.value)}
                        className="h-9 w-11 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-slate-950"
                        aria-label="Accent color"
                      />
                    </div>
                  </div>
                  {[
                    { label: "Profile", icon: UserCircle, href: "/profile" },
                    { label: "Workspace Settings", icon: Settings, href: "/settings" },
                    { label: "Billing", icon: CreditCard, href: "/billing" }
                  ].map((item) => (
                    <button key={item.label} onClick={() => { navigate(item.href); setUserMenuOpen(false); }} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-muted transition hover:bg-[#f6f4ff] hover:text-primary dark:hover:bg-white/10">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                  <button onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-danger transition hover:bg-red-50 dark:hover:bg-red-950/30">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {onboardingOpen && <OnboardingBanner onClose={completeOnboarding} onNavigate={(href) => navigate(href)} />}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-50 grid place-items-start bg-ink/40 px-4 pt-24" onClick={() => setSearchOpen(false)}>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-10" placeholder="Search customers, predictions, reports, users, settings..." />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-muted dark:bg-white/10">Ctrl K</span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {commandQuickActions.map((action) => (
                <button key={action.label} onClick={() => openSearchResult(action.href)} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-[#f6f4ff] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                  <action.icon className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-xs font-extrabold">{action.label}</p>
                  <p className="mt-1 text-[11px] leading-4 text-muted">{action.description}</p>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-bold text-muted dark:border-white/10 dark:bg-white/5">
              <Mic className="h-4 w-4 text-primary" />
              Voice assistant ready: future voice commands can attach here.
              <span className="ml-auto flex h-5 items-center gap-1">
                <span className="h-2 w-1 rounded-full bg-primary" />
                <span className="h-4 w-1 rounded-full bg-accent" />
                <span className="h-3 w-1 rounded-full bg-secondary" />
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {filteredResults.length ? filteredResults.map((item) => (
                <button key={`${item.category}-${item.id}`} onClick={() => openSearchResult(item.href)} className="flex items-start justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#f6f4ff] dark:hover:bg-white/10">
                  <div>
                    <p className="text-sm font-extrabold">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{item.description}</p>
                  </div>
                  <Badge tone="primary">{item.category}</Badge>
                </button>
              )) : (
                <div className="rounded-xl bg-slate-50 p-6 text-center text-sm font-semibold text-muted dark:bg-white/5">No search results found.</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const commandQuickActions = [
  { label: "Open Copilot", description: "Ask AI about churn, revenue and retention.", href: "/copilot", icon: Bot },
  { label: "Smart Home", description: "Open your personalized daily briefing.", href: "/smart-home", icon: Sparkles },
  { label: "Create Prediction", description: "Run the governed customer risk score.", href: "/predictions/single", icon: Plus },
  { label: "Generate Report", description: "Open executive reports and exports.", href: "/reports", icon: FileText },
  { label: "Create Campaign", description: "Launch retention playbooks.", href: "/retention/campaigns", icon: Megaphone },
  { label: "Investor Demo", description: "Show commercial value and ROI.", href: "/investor-demo", icon: BarChart3 },
  { label: "Demo Mode", description: "Open presentation-safe data.", href: "/demo", icon: Sparkles }
];

const onboardingSteps = [
  { title: "Welcome to CHURNIQ AI", detail: "Your AI workspace is ready for a guided product walkthrough." },
  { title: "Import Customers", detail: "Connect CRM data or use demo customers for a clean presentation." },
  { title: "Run Prediction", detail: "Score churn risk with the governed scoring artifact." },
  { title: "Analyze Risk", detail: "Use dashboards, SHAP and Copilot to explain the drivers." },
  { title: "Launch Retention Strategy", detail: "Turn high-risk cohorts into campaigns and revenue saves." }
];

function OnboardingBanner({ onClose, onNavigate }: { onClose: () => void; onNavigate: (href: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 rounded-[2rem] border border-primary/15 bg-white/92 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Badge tone="primary"><Sparkles className="h-3.5 w-3.5" /> Guided onboarding</Badge>
          <h2 className="mt-3 text-xl font-extrabold text-ink dark:text-white">Make the first demo feel effortless.</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">Follow the product path from customer import to governed prediction, explainability, Copilot and retention action.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => onNavigate("/demo")}><Sparkles className="h-4 w-4" /> Demo Mode</Button>
          <Button variant="outline" onClick={() => onNavigate("/investor-demo")}><BarChart3 className="h-4 w-4" /> Investor View</Button>
          <Button onClick={onClose}><CheckCircle2 className="h-4 w-4" /> Mark Ready</Button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {onboardingSteps.map((step, index) => (
          <button key={step.title} onClick={() => onNavigate(index === 1 ? "/customers" : index === 2 ? "/predictions/single" : index === 3 ? "/shap" : index === 4 ? "/retention" : "/dashboard")} className="rounded-2xl bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:bg-[#f6f4ff] dark:bg-white/5 dark:hover:bg-white/10">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-[#f2efff] text-xs font-extrabold text-primary">{index + 1}</span>
            <p className="mt-3 text-sm font-extrabold">{step.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{step.detail}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

const routePermissions: Record<string, Permission[]> = {
  "/dashboard": ["dashboard:read"],
  "/smart-home": ["dashboard:read"],
  "/demo": ["dashboard:read"],
  "/investor-demo": ["dashboard:read"],
  "/organization": ["organization:read"],
  "/customers": ["customers:read"],
  "/segments": ["segments:read"],
  "/predictions/single": ["predictions:read", "predictions:write"],
  "/predictions/result": ["predictions:read"],
  "/predictions/batch": ["predictions:read", "predictions:write"],
  "/predictions/history": ["predictions:read"],
  "/predictions/insights": ["predictions:read"],
  "/analytics": ["analytics:read"],
  "/executive": ["analytics:read"],
  "/executive/revenue": ["analytics:read"],
  "/executive/churn": ["analytics:read"],
  "/executive/cohorts": ["analytics:read"],
  "/executive/customer-ltv": ["analytics:read"],
  "/executive/forecasting": ["analytics:read"],
  "/executive/journey": ["analytics:read"],
  "/model-performance": ["models:read"],
  "/mlops": ["mlops:read"],
  "/mlops/models": ["mlops:read"],
  "/mlops/monitoring": ["mlops:read"],
  "/mlops/drift": ["mlops:read"],
  "/mlops/data-quality": ["mlops:read"],
  "/mlops/datasets": ["mlops:read"],
  "/mlops/retraining": ["mlops:read"],
  "/mlops/registry": ["mlops:read"],
  "/shap": ["shap:read"],
  "/shap/global": ["shap:read"],
  "/shap/local": ["shap:read"],
  "/shap/comparison": ["shap:read"],
  "/shap/business-insights": ["shap:read"],
  "/ai-insights": ["ai:read"],
  "/copilot": ["ai:read"],
  "/copilot/history": ["ai:read"],
  "/copilot/insights": ["ai:read"],
  "/copilot/reports": ["ai:read"],
  "/retention": ["retention:read"],
  "/retention/simulator": ["retention:read"],
  "/retention/opportunities": ["retention:read"],
  "/retention/campaigns": ["retention:read"],
  "/retention/playbooks": ["retention:read"],
  "/campaigns": ["campaigns:read"],
  "/reports": ["reports:read"],
  "/notifications": ["notifications:read"],
  "/team": ["team:read"],
  "/activity": ["activity:read"],
  "/audit-logs": ["audit:read"],
  "/billing": ["billing:read"],
  "/settings/api-keys": ["api_keys:read"],
  "/integrations": ["integrations:read"],
  "/integrations/crm": ["integrations:read"],
  "/integrations/communication": ["integrations:read"],
  "/integrations/data": ["integrations:read"],
  "/integrations/webhooks": ["integrations:read"],
  "/integrations/api": ["integrations:read"],
  "/integrations/marketplace": ["integrations:read"],
  "/system-health": ["system:read"],
  "/security": ["security:read"],
  "/settings": ["settings:read"],
  "/help": ["support:read"],
  "/support": ["support:read"]
};

function SelectWorkspace() {
  return (
    <button className="hidden items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm font-bold shadow-sm transition hover:border-primary/20 dark:border-white/10 dark:bg-white/5 xl:flex">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f2efff] text-xs font-extrabold text-primary">CI</span>
      <span className="max-w-44 truncate">{mockWorkspace.name}</span>
      <ChevronDown className="h-4 w-4 text-muted" />
    </button>
  );
}
