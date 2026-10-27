export type ExecutiveTone = "primary" | "success" | "warning" | "danger";

export type ExecutiveMetric = {
  label: string;
  value: string;
  delta: string;
  tone: ExecutiveTone;
};

export type ExecutiveReport = {
  title: string;
  description: string;
  sections: string[];
  exportTypes: string[];
};

export const executiveOverviewMetrics: ExecutiveMetric[] = [
  { label: "Revenue", value: "$1.2M", delta: "+9.8%", tone: "success" },
  { label: "Revenue At Risk", value: "$45,230", delta: "+6.0%", tone: "danger" },
  { label: "Revenue Saved", value: "$31,500", delta: "+18.4%", tone: "success" },
  { label: "Customer Growth", value: "+12.4%", delta: "+842 net", tone: "primary" },
  { label: "Retention Rate", value: "73.5%", delta: "+2.8%", tone: "success" },
  { label: "Churn Rate", value: "26.5%", delta: "-3.1%", tone: "warning" },
  { label: "Model ROC-AUC", value: "84.7%", delta: "CatBoost", tone: "primary" },
  { label: "Campaign ROI", value: "373%", delta: "+41 pts", tone: "success" }
];

export const executiveScorecard: ExecutiveMetric[] = [
  { label: "MRR", value: "$1.20M", delta: "+9.8%", tone: "success" },
  { label: "ARR", value: "$14.4M", delta: "+11.2%", tone: "success" },
  { label: "Customer Lifetime Value", value: "$4,820", delta: "+7.4%", tone: "primary" },
  { label: "Average Revenue Per Customer", value: "$170", delta: "+4.1%", tone: "primary" },
  { label: "Customer Acquisition Cost", value: "$312", delta: "-5.6%", tone: "success" },
  { label: "Retention Rate", value: "73.5%", delta: "+2.8%", tone: "success" },
  { label: "Revenue Recovery Rate", value: "69%", delta: "+6.3%", tone: "success" },
  { label: "Net Revenue Retention", value: "108%", delta: "+4.0%", tone: "primary" }
];

export const executiveInsights = [
  "Revenue risk increased by 6% because more high-value customers entered critical churn bands.",
  "VIP customers represent 42% of revenue and only 9% of churn.",
  "Month-to-month contracts drive 58% of churn and remain the largest controllable risk.",
  "Retention campaigns saved $21,400 this quarter, led by support and contract upgrade plays.",
  "Next quarter revenue can grow 12% if high-value critical customers are prioritized this month."
];

export const topRisks = [
  { label: "Month-to-month contract churn", value: "58% of churn", severity: "Critical" },
  { label: "High monthly charges", value: "$18.6K exposed", severity: "High" },
  { label: "No technical support", value: "312 accounts", severity: "High" },
  { label: "Early tenure customers", value: "689 customers", severity: "Medium" }
];

export const topOpportunities = [
  { label: "Technical support upgrade", value: "$11.2K saved", confidence: 91 },
  { label: "Annual contract migration", value: "$14.2K saved", confidence: 84 },
  { label: "VIP loyalty shield", value: "$6.3K saved", confidence: 86 },
  { label: "New customer onboarding", value: "$4.8K saved", confidence: 79 }
];

export const revenueTrend = [
  { month: "Jan", revenue: 1.02, atRisk: 0.034, recovered: 0.009, forecast: 1.06 },
  { month: "Feb", revenue: 1.07, atRisk: 0.037, recovered: 0.011, forecast: 1.1 },
  { month: "Mar", revenue: 1.11, atRisk: 0.041, recovered: 0.014, forecast: 1.15 },
  { month: "Apr", revenue: 1.15, atRisk: 0.039, recovered: 0.018, forecast: 1.19 },
  { month: "May", revenue: 1.18, atRisk: 0.043, recovered: 0.021, forecast: 1.24 },
  { month: "Jun", revenue: 1.2, atRisk: 0.045, recovered: 0.031, forecast: 1.28 }
];

export const revenueBySegment = [
  { name: "VIP", revenue: 420000, atRisk: 38000, recovered: 14200 },
  { name: "Loyal", revenue: 360000, atRisk: 18000, recovered: 6800 },
  { name: "Core", revenue: 250000, atRisk: 42000, recovered: 7200 },
  { name: "At Risk", revenue: 96000, atRisk: 45230, recovered: 31500 },
  { name: "New", revenue: 82000, atRisk: 21000, recovered: 4800 }
];

export const revenueByContract = [
  { name: "Month-to-month", stable: 326000, atRisk: 31800, recovered: 18100 },
  { name: "One year", stable: 286000, atRisk: 8700, recovered: 6200 },
  { name: "Two year", stable: 355000, atRisk: 4730, recovered: 7200 }
];

export const revenueByCustomerType = [
  { name: "Enterprise", value: 510000, color: "#6D5BFF" },
  { name: "Growth", value: 372000, color: "#00D4FF" },
  { name: "SMB", value: 238000, color: "#22C55E" },
  { name: "Trial", value: 80000, color: "#F59E0B" }
];

export const churnTrend = [
  { month: "Jan", churn: 31.8, forecast: 30.9, revenueLoss: 38400 },
  { month: "Feb", churn: 29.4, forecast: 29.1, revenueLoss: 36200 },
  { month: "Mar", churn: 30.7, forecast: 28.6, revenueLoss: 41100 },
  { month: "Apr", churn: 28.1, forecast: 27.4, revenueLoss: 39200 },
  { month: "May", churn: 27.3, forecast: 26.9, revenueLoss: 43000 },
  { month: "Jun", churn: 26.5, forecast: 25.8, revenueLoss: 45230 }
];

export const churnDrivers = [
  { name: "Contract Type", impact: 34, affected: 1240 },
  { name: "Monthly Charges", impact: 24, affected: 980 },
  { name: "No Tech Support", impact: 17, affected: 734 },
  { name: "Short Tenure", impact: 14, affected: 689 },
  { name: "Electronic Check", impact: 11, affected: 512 }
];

export const churnForecast = [
  { period: "Next Month", expectedChurn: "25.8%", expectedLoss: "$41,800", opportunities: "284" },
  { period: "Next Quarter", expectedChurn: "24.2%", expectedLoss: "$118,600", opportunities: "742" },
  { period: "Next Year", expectedChurn: "21.5%", expectedLoss: "$418,000", opportunities: "2,140" }
];

export const cohortHeatmap = [
  { cohort: "Jan 2026", values: [100, 94, 88, 82, 79, 75] },
  { cohort: "Feb 2026", values: [100, 93, 87, 83, 78, 0] },
  { cohort: "Mar 2026", values: [100, 91, 86, 80, 0, 0] },
  { cohort: "Apr 2026", values: [100, 92, 84, 0, 0, 0] },
  { cohort: "May 2026", values: [100, 89, 0, 0, 0, 0] },
  { cohort: "Jun 2026", values: [100, 0, 0, 0, 0, 0] }
];

export const quarterlyCohorts = [
  { cohort: "Q1 2025", customers: 1720, retention: 78, revenue: 286000 },
  { cohort: "Q2 2025", customers: 1840, retention: 81, revenue: 318000 },
  { cohort: "Q3 2025", customers: 1960, retention: 76, revenue: 342000 },
  { cohort: "Q4 2025", customers: 2120, retention: 83, revenue: 386000 },
  { cohort: "Q1 2026", customers: 2260, retention: 79, revenue: 421000 }
];

export const ltvBySegment = [
  { name: "VIP", clv: 8400, risk: 9, customers: 842 },
  { name: "Loyal", clv: 5900, risk: 6, customers: 2418 },
  { name: "High Value", clv: 7200, risk: 28, customers: 713 },
  { name: "Core", clv: 3200, risk: 22, customers: 1860 },
  { name: "New", clv: 1400, risk: 31, customers: 689 },
  { name: "At Risk", clv: 2600, risk: 58, customers: 1234 }
];

export const ltvScatter = [
  { name: "Sarah Johnson", value: 4820, risk: 82, priority: 91, segment: "At Risk" },
  { name: "Ahmed Benali", value: 3120, risk: 91, priority: 88, segment: "Dormant" },
  { name: "Michael Chen", value: 7820, risk: 73, priority: 96, segment: "High Value" },
  { name: "Emily Davis", value: 5900, risk: 18, priority: 42, segment: "Loyal" },
  { name: "David Wilson", value: 9100, risk: 22, priority: 55, segment: "VIP" },
  { name: "Maria Lopez", value: 1640, risk: 47, priority: 51, segment: "New" }
];

export const forecastDashboard = [
  { metric: "Revenue", current: "$1.20M", forecast: "$1.39M", confidence: "91%", growth: "+15.8%", riskFactors: ["High-value churn", "Support capacity"] },
  { metric: "Churn", current: "26.5%", forecast: "21.5%", confidence: "88%", growth: "-5.0 pts", riskFactors: ["Month-to-month", "Pricing pressure"] },
  { metric: "Retention", current: "73.5%", forecast: "78.5%", confidence: "86%", growth: "+5.0 pts", riskFactors: ["Campaign execution", "Support adoption"] },
  { metric: "Growth", current: "+12.4%", forecast: "+18.0%", confidence: "84%", growth: "+5.6 pts", riskFactors: ["Acquisition cost", "New customer onboarding"] }
];

export const forecastSeries = [
  { month: "Jul", revenue: 1.22, low: 1.16, high: 1.28, churn: 25.8, retention: 74.2 },
  { month: "Aug", revenue: 1.25, low: 1.18, high: 1.34, churn: 24.9, retention: 75.1 },
  { month: "Sep", revenue: 1.28, low: 1.2, high: 1.39, churn: 24.2, retention: 75.8 },
  { month: "Oct", revenue: 1.32, low: 1.23, high: 1.45, churn: 23.4, retention: 76.6 },
  { month: "Nov", revenue: 1.35, low: 1.25, high: 1.51, churn: 22.6, retention: 77.4 },
  { month: "Dec", revenue: 1.39, low: 1.28, high: 1.58, churn: 21.5, retention: 78.5 }
];

export const journeyStages = [
  { stage: "Acquisition", customers: 7043, conversion: 100, risk: 12 },
  { stage: "Activation", customers: 6280, conversion: 89, risk: 18 },
  { stage: "Engagement", customers: 5410, conversion: 77, risk: 26 },
  { stage: "Retention", customers: 4630, conversion: 66, risk: 34 },
  { stage: "Loyalty", customers: 3260, conversion: 46, risk: 9 },
  { stage: "Churn", customers: 1867, conversion: 26.5, risk: 100 }
];

export const journeyFlows = [
  { from: "Acquisition", to: "Activation", value: 6280, type: "healthy" },
  { from: "Activation", to: "Engagement", value: 5410, type: "healthy" },
  { from: "Engagement", to: "Retention", value: 4630, type: "warning" },
  { from: "Retention", to: "Loyalty", value: 3260, type: "healthy" },
  { from: "Engagement", to: "Churn", value: 780, type: "risk" },
  { from: "Retention", to: "Churn", value: 1087, type: "risk" }
];

export const customerValueMatrix = [
  { quadrant: "High Value Low Risk", customers: 1180, revenue: "$6.8M", action: "Expand and protect" },
  { quadrant: "High Value High Risk", customers: 312, revenue: "$2.4M", action: "Immediate executive save play" },
  { quadrant: "Low Value Low Risk", customers: 2610, revenue: "$2.1M", action: "Automated nurture" },
  { quadrant: "Low Value High Risk", customers: 624, revenue: "$640K", action: "Low-cost retention automation" }
];

export const priorityCustomers = [
  { customer: "Michael Chen", revenue: 2136, risk: 73, retentionProbability: 64, strategicImportance: 94, score: 96 },
  { customer: "Sarah Johnson", revenue: 1200, risk: 82, retentionProbability: 58, strategicImportance: 88, score: 91 },
  { customer: "Ahmed Benali", revenue: 1188, risk: 91, retentionProbability: 62, strategicImportance: 84, score: 88 },
  { customer: "David Wilson", revenue: 4672, risk: 22, retentionProbability: 91, strategicImportance: 79, score: 75 },
  { customer: "Maria Lopez", revenue: 576, risk: 47, retentionProbability: 69, strategicImportance: 55, score: 51 }
];

export const executiveReports: ExecutiveReport[] = [
  {
    title: "CEO Report",
    description: "One-page executive summary covering growth, revenue, churn, risk and priority actions.",
    sections: ["What happened", "Why it happened", "Forecast", "Board actions"],
    exportTypes: ["PDF", "PowerPoint", "Excel"]
  },
  {
    title: "Revenue Report",
    description: "Revenue overview, recovered revenue, forecasted revenue and segment contribution.",
    sections: ["MRR", "ARR", "Revenue at risk", "Recovered revenue"],
    exportTypes: ["PDF", "Excel", "CSV"]
  },
  {
    title: "Risk Report",
    description: "Top churn drivers, customer value at risk and priority customer ranking.",
    sections: ["Top risks", "Driver impact", "High-value risk", "Customer queue"],
    exportTypes: ["PDF", "Excel"]
  },
  {
    title: "Retention Report",
    description: "Campaign ROI, saved revenue, retention opportunities and recommended playbooks.",
    sections: ["Campaign ROI", "Revenue saved", "Playbooks", "Next actions"],
    exportTypes: ["PDF", "PowerPoint"]
  },
  {
    title: "Forecast Report",
    description: "Revenue, churn, retention and growth projections with confidence intervals.",
    sections: ["Forecast", "Confidence interval", "Risk factors", "Scenario planning"],
    exportTypes: ["PDF", "Excel", "CSV"]
  }
];
