export type RetentionTone = "primary" | "success" | "warning" | "danger";

export type RetentionKpi = {
  label: string;
  value: string;
  delta: string;
  tone: RetentionTone;
};

export type RetentionOpportunity = {
  id: string;
  title: string;
  description: string;
  target: string;
  estimatedRiskReduction: number;
  estimatedRevenueSaved: number;
  expectedSuccessRate: number;
  affectedCustomers: number;
  implementationCost: number;
  roi: number;
  confidence: number;
  priority: "Critical" | "High" | "Medium";
};

export type RetentionCustomer = {
  id: string;
  name: string;
  email: string;
  segment: "VIP" | "Loyal" | "At Risk" | "New" | "Dormant" | "High Value";
  risk: number;
  revenueAtRisk: number;
  lifetimeValue: number;
  monthlyRevenue: number;
  contract: string;
  currentPlan: string;
  recommendedAction: string;
  expectedRiskReduction: number;
  expectedRevenueSaved: number;
  confidence: number;
  responseLikelihood: "Very High" | "High" | "Medium" | "Low";
};

export type RetentionAction = {
  id: string;
  label: string;
  description: string;
  effect: number;
  cost: number;
  revenueMultiplier: number;
  successRate: number;
};

export type RetentionCampaign = {
  id: string;
  name: string;
  type: "Discount Campaign" | "Upgrade Campaign" | "Support Campaign" | "Loyalty Campaign";
  status: "Active" | "Draft" | "Scheduled" | "Completed";
  customersTargeted: number;
  customersRetained: number;
  revenueSaved: number;
  roi: number;
  successRate: number;
  owner: string;
};

export type RetentionPlaybook = {
  id: string;
  title: string;
  audience: string;
  description: string;
  expectedResults: string;
  expectedRoi: string;
  successRate: number;
  recommendedActions: string[];
  bestFor: string[];
};

export type RetentionHistoryItem = {
  action: string;
  date: string;
  result: string;
  riskBefore: number;
  riskAfter: number;
  revenueImpact: number;
};

export const retentionKpis: RetentionKpi[] = [
  { label: "Customers At Risk", value: "421", delta: "+7.8%", tone: "danger" },
  { label: "Revenue At Risk", value: "$45,230", delta: "+4.2%", tone: "warning" },
  { label: "Retention Opportunities", value: "312", delta: "Ready", tone: "primary" },
  { label: "Potential Revenue Saved", value: "$31,500", delta: "+18.4%", tone: "success" },
  { label: "Active Campaigns", value: "8", delta: "3 critical", tone: "primary" },
  { label: "Retention Success Rate", value: "68%", delta: "+6.1%", tone: "success" },
  { label: "Average Risk Reduction", value: "24%", delta: "+3.4%", tone: "success" }
];

export const aiRetentionSummary = [
  "421 customers are currently at high risk.",
  "Potential revenue loss is estimated at $45,230.",
  "Applying retention actions could save $31,500 this cycle.",
  "Most effective strategy: Technical Support Upgrade.",
  "Highest ROI segment: high-value customers on month-to-month contracts."
];

export const retentionOpportunities: RetentionOpportunity[] = [
  {
    id: "discount",
    title: "Offer Discount",
    description: "Target price-sensitive customers with 10% to 15% temporary plan incentives.",
    target: "Month-to-month, high monthly charges",
    estimatedRiskReduction: 21,
    estimatedRevenueSaved: 8200,
    expectedSuccessRate: 64,
    affectedCustomers: 186,
    implementationCost: 1850,
    roi: 343,
    confidence: 88,
    priority: "High"
  },
  {
    id: "support",
    title: "Technical Support Upgrade",
    description: "Add proactive technical support for customers missing support coverage.",
    target: "No tech support, fiber optic",
    estimatedRiskReduction: 18,
    estimatedRevenueSaved: 11200,
    expectedSuccessRate: 72,
    affectedCustomers: 245,
    implementationCost: 2400,
    roi: 367,
    confidence: 91,
    priority: "Critical"
  },
  {
    id: "loyalty",
    title: "Loyalty Program",
    description: "Reward long-tenure customers with loyalty credits and renewal benefits.",
    target: "VIP and Loyal customers",
    estimatedRiskReduction: 14,
    estimatedRevenueSaved: 6300,
    expectedSuccessRate: 69,
    affectedCustomers: 132,
    implementationCost: 1200,
    roi: 425,
    confidence: 86,
    priority: "Medium"
  },
  {
    id: "contract",
    title: "Contract Upgrade",
    description: "Move risky customers from month-to-month to annual plans with support bundles.",
    target: "Contract risk customers",
    estimatedRiskReduction: 28,
    estimatedRevenueSaved: 14200,
    expectedSuccessRate: 58,
    affectedCustomers: 118,
    implementationCost: 3100,
    roi: 358,
    confidence: 84,
    priority: "Critical"
  },
  {
    id: "call",
    title: "Personal Retention Call",
    description: "Route critical customers to a human save desk with a personalized action plan.",
    target: "Critical risk, high value",
    estimatedRiskReduction: 24,
    estimatedRevenueSaved: 9700,
    expectedSuccessRate: 76,
    affectedCustomers: 82,
    implementationCost: 2600,
    roi: 273,
    confidence: 93,
    priority: "Critical"
  },
  {
    id: "bundle",
    title: "Bundle Services",
    description: "Bundle streaming, security and support to increase perceived value and service depth.",
    target: "Low service adoption",
    estimatedRiskReduction: 16,
    estimatedRevenueSaved: 7400,
    expectedSuccessRate: 61,
    affectedCustomers: 164,
    implementationCost: 1750,
    roi: 323,
    confidence: 87,
    priority: "High"
  }
];

export const retentionCustomers: RetentionCustomer[] = [
  {
    id: "CUST_03246",
    name: "Sarah Johnson",
    email: "sarah@email.com",
    segment: "At Risk",
    risk: 82,
    revenueAtRisk: 1200,
    lifetimeValue: 4820,
    monthlyRevenue: 70,
    contract: "Month-to-month",
    currentPlan: "Fiber Plus",
    recommendedAction: "Technical Support Upgrade",
    expectedRiskReduction: 18,
    expectedRevenueSaved: 430,
    confidence: 91,
    responseLikelihood: "High"
  },
  {
    id: "CUST_93440",
    name: "Ahmed Benali",
    email: "ahmed.benali@email.com",
    segment: "Dormant",
    risk: 91,
    revenueAtRisk: 1188,
    lifetimeValue: 3120,
    monthlyRevenue: 99,
    contract: "Month-to-month",
    currentPlan: "Fiber Max",
    recommendedAction: "Personal Retention Call",
    expectedRiskReduction: 24,
    expectedRevenueSaved: 510,
    confidence: 93,
    responseLikelihood: "Very High"
  },
  {
    id: "CUST_18467",
    name: "Michael Chen",
    email: "m.chen@email.com",
    segment: "High Value",
    risk: 73,
    revenueAtRisk: 2136,
    lifetimeValue: 7820,
    monthlyRevenue: 89,
    contract: "One year",
    currentPlan: "Premium Internet",
    recommendedAction: "Contract Upgrade",
    expectedRiskReduction: 22,
    expectedRevenueSaved: 760,
    confidence: 89,
    responseLikelihood: "High"
  },
  {
    id: "CUST_33041",
    name: "Maria Lopez",
    email: "maria.lopez@email.com",
    segment: "New",
    risk: 47,
    revenueAtRisk: 576,
    lifetimeValue: 1640,
    monthlyRevenue: 48,
    contract: "Month-to-month",
    currentPlan: "Starter",
    recommendedAction: "Bundle Services",
    expectedRiskReduction: 14,
    expectedRevenueSaved: 210,
    confidence: 84,
    responseLikelihood: "Medium"
  }
];

export const simulatorActions: RetentionAction[] = [
  { id: "discount10", label: "Apply 10% Discount", description: "Temporary price relief for price-sensitive customers.", effect: 9, cost: 55, revenueMultiplier: 0.36, successRate: 61 },
  { id: "discount15", label: "Apply 15% Discount", description: "High-impact save offer for critical-risk customers.", effect: 13, cost: 84, revenueMultiplier: 0.48, successRate: 67 },
  { id: "support", label: "Add Technical Support", description: "Proactive support bundle to reduce service frustration.", effect: 18, cost: 96, revenueMultiplier: 0.62, successRate: 72 },
  { id: "contract", label: "Upgrade Contract", description: "Annual plan migration with value incentive.", effect: 16, cost: 120, revenueMultiplier: 0.58, successRate: 58 },
  { id: "loyalty", label: "Add Loyalty Benefits", description: "Retention credits and loyalty rewards.", effect: 11, cost: 70, revenueMultiplier: 0.4, successRate: 69 },
  { id: "bundle", label: "Bundle Services", description: "Security, backup and streaming bundle.", effect: 12, cost: 88, revenueMultiplier: 0.44, successRate: 63 }
];

export const retentionCampaigns: RetentionCampaign[] = [
  { id: "camp_support", name: "Support-Led Save Desk", type: "Support Campaign", status: "Active", customersTargeted: 245, customersRetained: 168, revenueSaved: 11200, roi: 367, successRate: 69, owner: "Retention Team" },
  { id: "camp_discount", name: "Critical Risk Discount", type: "Discount Campaign", status: "Scheduled", customersTargeted: 186, customersRetained: 119, revenueSaved: 8200, roi: 343, successRate: 64, owner: "Revenue Ops" },
  { id: "camp_upgrade", name: "Annual Contract Migration", type: "Upgrade Campaign", status: "Draft", customersTargeted: 118, customersRetained: 68, revenueSaved: 14200, roi: 358, successRate: 58, owner: "CS Leadership" },
  { id: "camp_loyalty", name: "VIP Loyalty Shield", type: "Loyalty Campaign", status: "Completed", customersTargeted: 132, customersRetained: 91, revenueSaved: 6300, roi: 425, successRate: 69, owner: "Account Managers" }
];

export const retentionPlaybooks: RetentionPlaybook[] = [
  {
    id: "high-risk",
    title: "High Risk Customers",
    audience: "Customers with risk above 70%",
    description: "Immediate save motion with offer, support and human follow-up.",
    expectedResults: "Reduce critical churn risk within 7 days.",
    expectedRoi: "3.4x",
    successRate: 71,
    recommendedActions: ["Run CatBoost rescore", "Send save offer", "Schedule support call", "Add to follow-up campaign"],
    bestFor: ["Critical risk", "No support", "Month-to-month"]
  },
  {
    id: "vip",
    title: "VIP Customers",
    audience: "High-value revenue accounts",
    description: "Premium retention care with account-manager outreach and loyalty benefits.",
    expectedResults: "Protect high-value revenue and improve executive retention confidence.",
    expectedRoi: "4.2x",
    successRate: 76,
    recommendedActions: ["Assign account owner", "Offer loyalty credit", "Review plan value", "Send executive check-in"],
    bestFor: ["VIP", "High Value", "Revenue critical"]
  },
  {
    id: "contract-risk",
    title: "Contract Risk Customers",
    audience: "Month-to-month customers",
    description: "Contract migration play that increases commitment while improving perceived value.",
    expectedResults: "Move customers into annual plans and reduce flexible-contract churn.",
    expectedRoi: "3.6x",
    successRate: 58,
    recommendedActions: ["Annual incentive", "Bundle support", "Plan comparison", "Renewal reminder"],
    bestFor: ["Contract risk", "Price pressure", "Fiber customers"]
  },
  {
    id: "revenue-risk",
    title: "Revenue Risk Customers",
    audience: "High monthly revenue at risk",
    description: "ROI-first retention actions prioritized by revenue exposure and response likelihood.",
    expectedResults: "Maximize saved revenue per retention dollar.",
    expectedRoi: "4.8x",
    successRate: 68,
    recommendedActions: ["Rank by revenue at risk", "Prioritize support upgrade", "Offer custom save package", "Track risk after action"],
    bestFor: ["Revenue critical", "High monthly charges", "High LTV"]
  },
  {
    id: "new-customers",
    title: "New Customers",
    audience: "Customers in first 12 months",
    description: "Onboarding-focused retention plan to prevent early cancellation.",
    expectedResults: "Improve activation and reduce first-year churn.",
    expectedRoi: "2.9x",
    successRate: 63,
    recommendedActions: ["Onboarding nurture", "First bill check", "Usage education", "Support introduction"],
    bestFor: ["New", "Short tenure", "Low engagement"]
  }
];

export const retentionHistory: RetentionHistoryItem[] = [
  { action: "15% discount offered", date: "June 2, 2026", result: "Accepted", riskBefore: 82, riskAfter: 61, revenueImpact: 420 },
  { action: "Technical support call", date: "May 24, 2026", result: "Completed", riskBefore: 76, riskAfter: 64, revenueImpact: 240 },
  { action: "Contract upgrade proposal", date: "May 10, 2026", result: "Pending", riskBefore: 69, riskAfter: 66, revenueImpact: 120 }
];

export const riskValueHeatmap = [
  { risk: "Critical", value: "High Value", customers: 82, priority: 98 },
  { risk: "Critical", value: "Mid Value", customers: 104, priority: 86 },
  { risk: "Critical", value: "Low Value", customers: 43, priority: 68 },
  { risk: "High", value: "High Value", customers: 118, priority: 91 },
  { risk: "High", value: "Mid Value", customers: 136, priority: 74 },
  { risk: "High", value: "Low Value", customers: 67, priority: 58 },
  { risk: "Medium", value: "High Value", customers: 122, priority: 61 },
  { risk: "Medium", value: "Mid Value", customers: 248, priority: 46 },
  { risk: "Medium", value: "Low Value", customers: 144, priority: 32 }
];

export const retentionTrend = [
  { month: "Jan", saved: 8400, risk: 38, campaigns: 4 },
  { month: "Feb", saved: 11200, risk: 35, campaigns: 5 },
  { month: "Mar", saved: 9800, risk: 34, campaigns: 5 },
  { month: "Apr", saved: 14200, risk: 31, campaigns: 6 },
  { month: "May", saved: 18600, risk: 29, campaigns: 7 },
  { month: "Jun", saved: 31500, risk: 24, campaigns: 8 }
];

export const campaignPerformance = [
  { name: "Support", saved: 11200, roi: 367, success: 69 },
  { name: "Discount", saved: 8200, roi: 343, success: 64 },
  { name: "Upgrade", saved: 14200, roi: 358, success: 58 },
  { name: "Loyalty", saved: 6300, roi: 425, success: 69 }
];

export const retentionSegments = [
  { name: "Most Likely To Respond", customers: 312, value: "$31.5K", rate: 72 },
  { name: "Unlikely To Respond", customers: 96, value: "$8.1K", rate: 28 },
  { name: "Revenue Critical", customers: 118, value: "$22.4K", rate: 68 },
  { name: "High Value Customers", customers: 713, value: "$2.4M ARR", rate: 76 }
];

export const executiveRetentionReport = [
  { title: "Revenue At Risk", text: "$45,230 is currently exposed across critical and high-risk customers." },
  { title: "Revenue Saved", text: "$31,500 can be protected through targeted support, contract and save plays." },
  { title: "Top Strategies", text: "Technical Support Upgrade and Contract Upgrade provide the strongest combined impact." },
  { title: "Campaign Performance", text: "Support-led campaigns show 69% success with 367% ROI." },
  { title: "Recommendations", text: "Prioritize high-value critical customers, then month-to-month customers without support." }
];
