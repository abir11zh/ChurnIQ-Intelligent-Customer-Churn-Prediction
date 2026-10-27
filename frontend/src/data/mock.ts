import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Blocks,
  Code2,
  CreditCard,
  Database,
  FileText,
  Gauge,
  Headphones,
  History,
  LayoutDashboard,
  LineChart,
  Megaphone,
  MessageSquare,
  Plug,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Users,
  Webhook
} from "lucide-react";

export const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Smart Home", href: "/smart-home", icon: Sparkles },
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Demo Mode", href: "/demo", icon: Sparkles },
      { label: "Investor Demo", href: "/investor-demo", icon: BarChart3 }
    ]
  },
  {
    label: "Customer Intelligence",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Segments", href: "/segments", icon: Search }
    ]
  },
  {
    label: "Prediction Center",
    items: [
      { label: "Single Prediction", href: "/predictions/single", icon: Gauge },
      { label: "Batch Prediction", href: "/predictions/batch", icon: Upload },
      { label: "Prediction History", href: "/predictions/history", icon: History },
      { label: "Prediction Insights", href: "/predictions/insights", icon: Sparkles }
    ]
  },
  {
    label: "Analytics",
    items: [
      { label: "Analytics Hub", href: "/analytics", icon: BarChart3 },
      { label: "Executive Analytics", href: "/executive", icon: Building2 },
      { label: "Revenue Intelligence", href: "/executive/revenue", icon: CreditCard },
      { label: "Churn Intelligence", href: "/executive/churn", icon: Activity },
      { label: "Cohorts", href: "/executive/cohorts", icon: History },
      { label: "Customer LTV", href: "/executive/customer-ltv", icon: Users },
      { label: "Forecasting", href: "/executive/forecasting", icon: LineChart },
      { label: "Journey Analytics", href: "/executive/journey", icon: Target },
      { label: "Model Performance", href: "/model-performance", icon: LineChart },
      { label: "Explainable AI Center", href: "/shap", icon: Activity },
      { label: "Global SHAP", href: "/shap/global", icon: BarChart3 },
      { label: "Local SHAP", href: "/shap/local", icon: Target },
      { label: "Customer Comparison", href: "/shap/comparison", icon: Users },
      { label: "Business Explanations", href: "/shap/business-insights", icon: BrainCircuit }
    ]
  },
  {
    label: "AI Operations",
    items: [
      { label: "AI Operations", href: "/mlops", icon: BrainCircuit },
      { label: "Models", href: "/mlops/models", icon: LineChart },
      { label: "Monitoring", href: "/mlops/monitoring", icon: Activity },
      { label: "Drift Center", href: "/mlops/drift", icon: AlertTriangle },
      { label: "Data Quality", href: "/mlops/data-quality", icon: ShieldCheck },
      { label: "Datasets", href: "/mlops/datasets", icon: Database },
      { label: "Retraining", href: "/mlops/retraining", icon: RefreshCw },
      { label: "Model Registry", href: "/mlops/registry", icon: FileText }
    ]
  },
  {
    label: "AI & Retention",
    items: [
      { label: "AI Insights", href: "/ai-insights", icon: BrainCircuit },
      { label: "AI Copilot", href: "/copilot", icon: Bot },
      { label: "Copilot History", href: "/copilot/history", icon: History },
      { label: "Copilot Insights", href: "/copilot/insights", icon: Sparkles },
      { label: "Copilot Reports", href: "/copilot/reports", icon: FileText },
      { label: "Retention Intelligence", href: "/retention", icon: CheckCircle2 },
      { label: "Retention Simulator", href: "/retention/simulator", icon: Gauge },
      { label: "Opportunities", href: "/retention/opportunities", icon: Target },
      { label: "Retention Campaigns", href: "/retention/campaigns", icon: Megaphone },
      { label: "Playbooks", href: "/retention/playbooks", icon: FileText },
      { label: "Campaigns", href: "/campaigns", icon: Megaphone }
    ]
  },
  {
    label: "Ecosystem",
    items: [
      { label: "Integrations Hub", href: "/integrations", icon: Plug },
      { label: "CRM Integrations", href: "/integrations/crm", icon: Building2 },
      { label: "Communication", href: "/integrations/communication", icon: MessageSquare },
      { label: "Data Platforms", href: "/integrations/data", icon: Database },
      { label: "Webhooks", href: "/integrations/webhooks", icon: Webhook },
      { label: "API Platform", href: "/integrations/api", icon: Code2 },
      { label: "Marketplace", href: "/integrations/marketplace", icon: Blocks }
    ]
  },
  {
    label: "Enterprise",
    items: [
      { label: "Organization", href: "/organization", icon: Building2 },
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Team", href: "/team", icon: ShieldCheck },
      { label: "Activity Center", href: "/activity", icon: Activity },
      { label: "Audit Logs", href: "/audit-logs", icon: History },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Billing", href: "/billing", icon: CreditCard },
      { label: "API Keys", href: "/settings/api-keys", icon: ShieldCheck },
      { label: "Security", href: "/security", icon: ShieldCheck },
      { label: "System Health", href: "/system-health", icon: Activity },
      { label: "Help Center", href: "/help", icon: Headphones },
      { label: "Support", href: "/support", icon: Headphones }
    ]
  }
];

export const navItems = navGroups.flatMap((group) => group.items);

export const landingFeatures = [
  { title: "CatBoost prediction", icon: Gauge, text: "Score customers with the production CatBoost churn engine." },
  { title: "SHAP explainability", icon: Sparkles, text: "Understand drivers like contract type, tenure and charges." },
  { title: "Retention workflows", icon: Megaphone, text: "Turn risk cohorts into targeted save campaigns." },
  { title: "Executive reports", icon: FileText, text: "Export revenue, churn and AI insight reports." }
];

export const kpis = [
  { label: "Total Customers", value: "7,043", delta: "+12.4%", icon: Users, tone: "primary" },
  { label: "Churn Rate", value: "26.5%", delta: "-3.1%", icon: Activity, tone: "danger" },
  { label: "Monthly Revenue", value: "$16.2M", delta: "+9.8%", icon: CreditCard, tone: "success" },
  { label: "High Risk Customers", value: "1,234", delta: "+4.6%", icon: Bell, tone: "warning" }
];

export const revenueTrend = [
  { month: "Jan", revenue: 11.8, churn: 32, customers: 6000 },
  { month: "Feb", revenue: 12.6, churn: 29, customers: 6210 },
  { month: "Mar", revenue: 13.9, churn: 31, customers: 6480 },
  { month: "Apr", revenue: 13.4, churn: 27, customers: 6720 },
  { month: "May", revenue: 14.8, churn: 30, customers: 6960 },
  { month: "Jun", revenue: 16.2, churn: 26.5, customers: 7043 }
];

export const riskMix = [
  { name: "Low", value: 385, color: "#22C55E" },
  { name: "Medium", value: 370, color: "#F59E0B" },
  { name: "High", value: 245, color: "#EF4444" },
  { name: "Critical", value: 82, color: "#6D5BFF" }
];

export const customers = [
  { id: "CUST_03246", name: "Sarah Johnson", email: "sarah@email.com", contract: "Month-to-month", risk: "CRITICAL", probability: 82, revenue: "$1200.50", status: "At risk" },
  { id: "CUST_18467", name: "Michael Chen", email: "m.chen@email.com", contract: "One year", risk: "HIGH", probability: 67, revenue: "$930.00", status: "Monitor" },
  { id: "CUST_02158", name: "Emily Davis", email: "emily@email.com", contract: "Two year", risk: "MEDIUM", probability: 44, revenue: "$780.00", status: "Active" },
  { id: "CUST_35249", name: "David Wilson", email: "david@email.com", contract: "Month-to-month", risk: "LOW", probability: 23, revenue: "$620.00", status: "Active" },
  { id: "CUST_93440", name: "Jennifer Lee", email: "jennifer@email.com", contract: "One year", risk: "LOW", probability: 18, revenue: "$1080.00", status: "Active" },
  { id: "CUST_33041", name: "Robert Taylor", email: "robert@email.com", contract: "Month-to-month", risk: "MEDIUM", probability: 58, revenue: "$640.00", status: "Monitor" }
];

export const shapFactors = [
  { feature: "Contract Type", value: 0.45, impact: "danger" },
  { feature: "Monthly Charges", value: 0.31, impact: "danger" },
  { feature: "No Tech Support", value: 0.15, impact: "danger" },
  { feature: "Tenure", value: -0.12, impact: "primary" },
  { feature: "Online Security", value: -0.08, impact: "primary" },
  { feature: "Has Dependents", value: -0.06, impact: "primary" }
];

export const insights = [
  { title: "High Risk Pattern Detected", text: "Customers with month-to-month contracts and high monthly charges are 2.8x more likely to churn.", icon: BrainCircuit, tag: "High impact" },
  { title: "Retention Opportunity", text: "Offering tech support to 245 customers could reduce churn by up to 14%.", icon: CheckCircle2, tag: "Medium impact" },
  { title: "Revenue Impact", text: "Preventing churn from high-value customers protects an estimated $2.4M ARR.", icon: CreditCard, tag: "High impact" },
  { title: "Best Performing Segment", text: "Two-year contract customers show the highest retention score at 92%.", icon: Building2, tag: "Positive" }
];

export const reports = [
  { name: "Customer Churn Report", text: "Detailed churn analysis, risk scoring and churn drivers.", icon: FileText },
  { name: "Model Performance Report", text: "CatBoost production metrics plus model comparison evidence.", icon: LineChart },
  { name: "Revenue Report", text: "Revenue at risk, protected MRR and leakage analysis.", icon: CreditCard },
  { name: "Retention Report", text: "Campaign opportunities, expected saves and play performance.", icon: CheckCircle2 },
  { name: "Executive Report", text: "Board-ready summary of churn, BI and AI recommendations.", icon: Building2 }
];

export const executiveSummary = [
  "124 customers became high-risk this week.",
  "Estimated revenue at risk: $12,450.",
  "Recommended retention campaign available."
];

export const commandCenterKpis = [
  { label: "Total Customers", value: "7,043", delta: "+12.4%", icon: Users, tone: "primary" },
  { label: "Churn Rate", value: "26.5%", delta: "-3.1%", icon: Activity, tone: "danger" },
  { label: "High Risk Customers", value: "1,234", delta: "+4.6%", icon: Bell, tone: "warning" },
  { label: "Revenue At Risk", value: "$12,450", delta: "+8.2%", icon: CreditCard, tone: "danger" },
  { label: "Retention Rate", value: "73.5%", delta: "+2.8%", icon: CheckCircle2, tone: "success" },
  { label: "CatBoost ROC-AUC", value: "84.7%", delta: "Technical", icon: Gauge, tone: "success" },
  { label: "LR Recall", value: "79.7%", delta: "Business", icon: LineChart, tone: "primary" },
  { label: "CatBoost Precision", value: "67.2%", delta: "Scoring", icon: Target, tone: "primary" },
  { label: "CatBoost Recall", value: "48.7%", delta: "Review", icon: Sparkles, tone: "warning" },
  { label: "LR F1 Score", value: "62.3%", delta: "Best F1", icon: ShieldCheck, tone: "success" }
];

export const distributionCards = [
  { title: "Customer Distribution by Gender", rows: [["Female", 50.5], ["Male", 49.5]] },
  { title: "Customer Distribution by Contract", rows: [["Month-to-month", 55], ["One year", 21], ["Two year", 24]] },
  { title: "Customer Distribution by Payment Method", rows: [["Electronic check", 34], ["Auto pay", 42], ["Mailed check", 24]] },
  { title: "Customer Distribution by Internet Service", rows: [["Fiber optic", 44], ["DSL", 34], ["No internet", 22]] },
  { title: "Customer Distribution by Tenure", rows: [["0-12 months", 29], ["13-36 months", 38], ["37+ months", 33]] },
  { title: "Customer Distribution by Monthly Charges", rows: [["Low", 31], ["Medium", 37], ["High", 32]] },
  { title: "Customer Distribution by Churn", rows: [["Stayed", 73.5], ["Churned", 26.5]] },
  { title: "Customer Distribution by Senior Citizen", rows: [["No", 84], ["Yes", 16]] },
  { title: "Customer Distribution by Support Service", rows: [["With support", 37], ["No support", 63]] }
];

export const churnAnalytics = [
  { title: "Churn by Contract Type", value: "Month-to-month drives 67% of churn", level: 82 },
  { title: "Churn by Tenure", value: "First 12 months are the riskiest window", level: 71 },
  { title: "Churn by Charges", value: "High monthly charges raise churn pressure", level: 64 },
  { title: "Churn by Internet Service", value: "Fiber optic customers need proactive care", level: 58 },
  { title: "Churn by Payment Method", value: "Electronic check is overrepresented", level: 62 },
  { title: "Churn by Customer Segment", value: "At Risk and New segments need action", level: 76 }
];

export const catBoostMetrics = [
  ["Accuracy", "80.1%"],
  ["Precision", "67.2%"],
  ["Recall", "48.7%"],
  ["F1", "56.4%"],
  ["ROC-AUC", "84.7%"]
];

export const activity = [
  "Sarah Johnson moved to critical risk",
  "245 customers added to Win-Back campaign",
  "Monthly benchmark report generated",
  "Model drift monitor checked source data",
  "Revenue risk alert sent to retention team"
];

export const dashboardExecutiveInsights = [
  {
    title: "High-risk acceleration",
    value: "124",
    text: "customers became high-risk this week.",
    delta: "+8.7%",
    tone: "danger",
    icon: AlertTriangle
  },
  {
    title: "Revenue exposure",
    value: "$45.2K",
    text: "revenue currently exposed to churn risk.",
    delta: "+4.2%",
    tone: "warning",
    icon: CreditCard
  },
  {
    title: "Primary churn driver",
    value: "62%",
    text: "of churn cases are month-to-month contracts.",
    delta: "Driver",
    tone: "primary",
    icon: BrainCircuit
  },
  {
    title: "Retention opportunity",
    value: "68",
    text: "customers match the recommended save play.",
    delta: "Ready",
    tone: "success",
    icon: CheckCircle2
  }
];

export const dashboardKpiCards = [
  { label: "Total Customers", value: "7,043", trend: "+12.4%", direction: "up", icon: Users, tone: "primary" },
  { label: "Churn Rate", value: "26.5%", trend: "-3.1%", direction: "down", icon: Activity, tone: "danger" },
  { label: "High Risk Customers", value: "421", trend: "+7.8%", direction: "up", icon: AlertTriangle, tone: "danger" },
  { label: "Revenue At Risk", value: "$45,230", trend: "+4.2%", direction: "up", icon: CreditCard, tone: "warning" },
  { label: "Monthly Revenue", value: "$1.2M", trend: "+9.8%", direction: "up", icon: BarChart3, tone: "success" },
  { label: "Retention Rate", value: "73%", trend: "+2.6%", direction: "up", icon: CheckCircle2, tone: "success" },
  { label: "ROC-AUC", value: "84.7%", trend: "CatBoost", direction: "up", icon: Gauge, tone: "primary" },
  { label: "Active Predictions", value: "1,253", trend: "+18.5%", direction: "up", icon: Sparkles, tone: "primary" }
];

export const dashboardFilterOptions = {
  dateRanges: ["Last 7 days", "Last 30 days", "Last 90 days", "This quarter", "Year to date"],
  segments: ["All segments", "VIP", "Loyal", "At Risk", "New"],
  riskLevels: ["All risks", "Low", "Medium", "High", "Critical"],
  contractTypes: ["All contracts", "Month-to-month", "One year", "Two year"],
  internetServices: ["All services", "Fiber optic", "DSL", "No internet service"]
};

export const distributionHub = [
  { title: "Customer Distribution by Gender", chart: "donut", data: [{ name: "Female", value: 3556, color: "#6D5BFF" }, { name: "Male", value: 3487, color: "#00D4FF" }] },
  { title: "Customer Distribution by Contract", chart: "bar", data: [{ name: "Month-to-month", value: 3875, color: "#EF4444" }, { name: "One year", value: 1479, color: "#F59E0B" }, { name: "Two year", value: 1689, color: "#22C55E" }] },
  { title: "Customer Distribution by Payment Method", chart: "bar", data: [{ name: "Electronic check", value: 2365, color: "#EF4444" }, { name: "Bank transfer", value: 1544, color: "#6D5BFF" }, { name: "Credit card", value: 1522, color: "#00D4FF" }, { name: "Mailed check", value: 1612, color: "#F59E0B" }] },
  { title: "Customer Distribution by Internet Service", chart: "donut", data: [{ name: "Fiber optic", value: 3096, color: "#6D5BFF" }, { name: "DSL", value: 2421, color: "#00D4FF" }, { name: "No service", value: 1526, color: "#CBD5E1" }] },
  { title: "Customer Distribution by Senior Citizen", chart: "pie", data: [{ name: "No", value: 5901, color: "#6D5BFF" }, { name: "Yes", value: 1142, color: "#F59E0B" }] },
  { title: "Customer Distribution by Partner Status", chart: "donut", data: [{ name: "Partner", value: 3402, color: "#22C55E" }, { name: "No partner", value: 3641, color: "#8B5CF6" }] },
  { title: "Customer Distribution by Dependents", chart: "pie", data: [{ name: "No dependents", value: 4933, color: "#EF4444" }, { name: "Dependents", value: 2110, color: "#22C55E" }] },
  { title: "Customer Distribution by Tenure Group", chart: "bar", data: [{ name: "0-12m", value: 2042, color: "#EF4444" }, { name: "13-36m", value: 2677, color: "#F59E0B" }, { name: "37-60m", value: 1546, color: "#6D5BFF" }, { name: "60m+", value: 778, color: "#22C55E" }] },
  { title: "Customer Distribution by Monthly Charges", chart: "bar", data: [{ name: "Low", value: 2182, color: "#22C55E" }, { name: "Medium", value: 2606, color: "#6D5BFF" }, { name: "High", value: 2255, color: "#EF4444" }] },
  { title: "Customer Distribution by Total Charges", chart: "bar", data: [{ name: "$0-500", value: 1686, color: "#F59E0B" }, { name: "$500-2K", value: 2441, color: "#6D5BFF" }, { name: "$2K-5K", value: 2044, color: "#00D4FF" }, { name: "$5K+", value: 872, color: "#22C55E" }] }
];

export const churnByContract = [
  { name: "Month-to-month", churn: 42, retained: 58 },
  { name: "One year", churn: 18, retained: 82 },
  { name: "Two year", churn: 7, retained: 93 }
];

export const churnByPayment = [
  { name: "Electronic check", churn: 45 },
  { name: "Mailed check", churn: 19 },
  { name: "Bank transfer", churn: 16 },
  { name: "Credit card", churn: 15 }
];

export const churnByInternet = [
  { name: "Fiber optic", churn: 41, retained: 59 },
  { name: "DSL", churn: 19, retained: 81 },
  { name: "No service", churn: 8, retained: 92 }
];

export const churnByTenure = [
  { name: "0-6m", churn: 48 },
  { name: "7-12m", churn: 39 },
  { name: "13-24m", churn: 28 },
  { name: "25-36m", churn: 22 },
  { name: "37-60m", churn: 14 },
  { name: "60m+", churn: 8 }
];

export const churnByMonthlyCharges = [
  { name: "$20-40", churn: 12, volume: 1180 },
  { name: "$40-60", churn: 18, volume: 1690 },
  { name: "$60-80", churn: 29, volume: 2030 },
  { name: "$80-100", churn: 39, volume: 1430 },
  { name: "$100+", churn: 44, volume: 713 }
];

export const churnBySeniorCitizen = [
  { name: "Senior", churn: 42, color: "#EF4444" },
  { name: "Non-senior", churn: 24, color: "#6D5BFF" }
];

export const churnBySegment = [
  { name: "VIP", churn: 9 },
  { name: "Loyal", churn: 6 },
  { name: "Core", churn: 22 },
  { name: "New", churn: 31 },
  { name: "At Risk", churn: 58 }
];

export const churnTrendOverTime = [
  { month: "Jan", churn: 31.8, highRisk: 356 },
  { month: "Feb", churn: 29.4, highRisk: 338 },
  { month: "Mar", churn: 30.7, highRisk: 371 },
  { month: "Apr", churn: 28.1, highRisk: 402 },
  { month: "May", churn: 27.3, highRisk: 414 },
  { month: "Jun", churn: 26.5, highRisk: 421 }
];

export const revenueBySegment = [
  { name: "VIP", revenue: 420000, risk: 38000 },
  { name: "Loyal", revenue: 360000, risk: 18000 },
  { name: "Core", revenue: 250000, risk: 42000 },
  { name: "New", revenue: 82000, risk: 21000 },
  { name: "At Risk", revenue: 96000, risk: 45230 }
];

export const revenueByContract = [
  { name: "Month-to-month", revenue: 545000, loss: 31800 },
  { name: "One year", revenue: 295000, loss: 8700 },
  { name: "Two year", revenue: 360000, loss: 4730 }
];

export const revenueByService = [
  { name: "Fiber optic", revenue: 612000 },
  { name: "DSL", revenue: 384000 },
  { name: "No internet", revenue: 204000 },
  { name: "Streaming", revenue: 438000 },
  { name: "Tech support", revenue: 326000 }
];

export const revenueByRisk = [
  { name: "Low", revenue: 510000, color: "#22C55E" },
  { name: "Medium", revenue: 318000, color: "#F59E0B" },
  { name: "High", revenue: 246000, color: "#EF4444" },
  { name: "Critical", revenue: 126000, color: "#6D5BFF" }
];

export const revenueForecast = [
  { month: "Jul", forecast: 1.22, best: 1.28, loss: 0.08 },
  { month: "Aug", forecast: 1.25, best: 1.34, loss: 0.1 },
  { month: "Sep", forecast: 1.28, best: 1.39, loss: 0.12 },
  { month: "Oct", forecast: 1.32, best: 1.45, loss: 0.14 },
  { month: "Nov", forecast: 1.35, best: 1.51, loss: 0.17 },
  { month: "Dec", forecast: 1.39, best: 1.58, loss: 0.19 }
];

export const revenueLossForecast = [
  { month: "Jul", loss: 45230 },
  { month: "Aug", loss: 51100 },
  { month: "Sep", loss: 57400 },
  { month: "Oct", loss: 64100 },
  { month: "Nov", loss: 70200 },
  { month: "Dec", loss: 78900 }
];

export const customerLifetimeValue = [
  { name: "VIP", clv: 8400 },
  { name: "Loyal", clv: 5900 },
  { name: "Core", clv: 3200 },
  { name: "New", clv: 1400 },
  { name: "At Risk", clv: 2600 }
];

export const monthlyRevenueTrend = [
  { month: "Jan", revenue: 1.02, protected: 0.08 },
  { month: "Feb", revenue: 1.07, protected: 0.09 },
  { month: "Mar", revenue: 1.11, protected: 0.1 },
  { month: "Apr", revenue: 1.15, protected: 0.12 },
  { month: "May", revenue: 1.18, protected: 0.13 },
  { month: "Jun", revenue: 1.2, protected: 0.16 }
];

export const customerSegments = [
  { name: "VIP Customers", customers: 842, revenue: "$420K", churnRate: "9%", growth: "+6.4%", tone: "primary" },
  { name: "Loyal Customers", customers: 2418, revenue: "$360K", churnRate: "6%", growth: "+3.8%", tone: "success" },
  { name: "At Risk Customers", customers: 1234, revenue: "$96K", churnRate: "58%", growth: "+8.7%", tone: "danger" },
  { name: "New Customers", customers: 689, revenue: "$82K", churnRate: "31%", growth: "+14.2%", tone: "warning" }
];

export const segmentScatter = [
  { segment: "VIP", tenure: 58, revenue: 420, risk: 9 },
  { segment: "Loyal", tenure: 49, revenue: 360, risk: 6 },
  { segment: "Core", tenure: 31, revenue: 250, risk: 22 },
  { segment: "New", tenure: 7, revenue: 82, risk: 31 },
  { segment: "At Risk", tenure: 14, revenue: 96, risk: 58 }
];

export const segmentInsights = [
  "VIP customers carry the highest revenue concentration and lowest churn.",
  "At Risk customers create outsized revenue exposure despite smaller volume.",
  "New customers need onboarding intervention before month 12.",
  "Loyal customers are the strongest candidates for expansion campaigns."
];

export const catBoostPerformanceCenter = {
  model: "CatBoost + Logistic Regression Review",
  status: "Model Governance",
  confidence: 85,
  health: 92,
  predictionVolume: "18,420",
  lastRetrained: "June 2, 2026",
  metrics: [
    { label: "Technical Champion", value: "CatBoost", tone: "primary" },
    { label: "ROC-AUC", value: "84.74%", tone: "success" },
    { label: "Business Champion", value: "Logistic Regression", tone: "warning" },
    { label: "Recall", value: "79.68%", tone: "success" },
    { label: "CatBoost Recall", value: "48.66%", tone: "danger" }
  ],
  features: [
    { name: "Contract Type", importance: 92 },
    { name: "Tenure", importance: 84 },
    { name: "Monthly Charges", importance: 77 },
    { name: "Tech Support", importance: 69 },
    { name: "Internet Service", importance: 61 }
  ]
};

export const aiBusinessInsights = [
  { title: "Technical support gap", text: "Customers without technical support churn 2.4x more often.", badge: "Retention", tone: "danger" },
  { title: "Contract pressure", text: "Month-to-month contracts represent 62% of churn cases.", badge: "Driver", tone: "warning" },
  { title: "Revenue compounding", text: "Long-term customers generate 4x more revenue than new cohorts.", badge: "Growth", tone: "success" },
  { title: "Risk concentration", text: "Revenue loss risk is concentrated in At Risk, New and Fiber segments.", badge: "Revenue", tone: "primary" }
];

export const recentActivityCenter = [
  { type: "Prediction", title: "421 customers rescored by CatBoost", time: "4 min ago", status: "Completed" },
  { type: "Alert", title: "Critical risk increased in month-to-month cohort", time: "12 min ago", status: "High priority" },
  { type: "Report", title: "Executive churn report generated", time: "28 min ago", status: "Ready" },
  { type: "Customer", title: "Sarah Johnson moved to critical risk", time: "41 min ago", status: "Needs action" },
  { type: "Campaign", title: "Retention offer prepared for 68 customers", time: "1 hour ago", status: "Draft" }
];

export const uploadStats = [
  { label: "Total processed", value: "1,000" },
  { label: "High risk", value: "245" },
  { label: "Medium risk", value: "370" },
  { label: "Low risk", value: "385" }
];

export const helpTopics = [
  { title: "Getting started", icon: Search },
  { title: "Model training", icon: BrainCircuit },
  { title: "Managing predictions", icon: Gauge },
  { title: "Understanding SHAP", icon: BarChart3 },
  { title: "Best practices", icon: CheckCircle2 },
  { title: "Batch uploads", icon: Upload }
];
