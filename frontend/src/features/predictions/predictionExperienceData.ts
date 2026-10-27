export type PredictionRisk = "Low" | "Medium" | "High" | "Critical";

export type PredictionHistoryRow = {
  id: string;
  customer: string;
  customerId: string;
  avatar: string;
  date: string;
  probability: number;
  risk: PredictionRisk;
  confidence: number;
  revenueRisk: number;
  outcome: string;
};

export const predictionHistoryRows: PredictionHistoryRow[] = [
  { id: "pred_001", customer: "Sarah Johnson", customerId: "CUST_03246", avatar: "SJ", date: "Jun 10, 2026", probability: 82, risk: "Critical", confidence: 94, revenueRisk: 1200, outcome: "Retention play opened" },
  { id: "pred_002", customer: "Ahmed Benali", customerId: "CUST_93440", avatar: "AB", date: "Jun 10, 2026", probability: 91, risk: "Critical", confidence: 96, revenueRisk: 1188, outcome: "Support call scheduled" },
  { id: "pred_003", customer: "Michael Chen", customerId: "CUST_18467", avatar: "MC", date: "Jun 10, 2026", probability: 73, risk: "High", confidence: 89, revenueRisk: 2136, outcome: "Discount recommended" },
  { id: "pred_004", customer: "Maria Lopez", customerId: "CUST_33041", avatar: "ML", date: "Jun 9, 2026", probability: 47, risk: "Medium", confidence: 84, revenueRisk: 576, outcome: "Onboarding campaign" },
  { id: "pred_005", customer: "Emily Davis", customerId: "CUST_02158", avatar: "ED", date: "Jun 9, 2026", probability: 18, risk: "Low", confidence: 92, revenueRisk: 732, outcome: "Healthy account" },
  { id: "pred_006", customer: "David Wilson", customerId: "CUST_35249", avatar: "DW", date: "Jun 8, 2026", probability: 22, risk: "Low", confidence: 91, revenueRisk: 876, outcome: "Renewal nurture" }
];

export const predictionLoadingSteps = [
  "Preparing Customer Profile",
  "Analyzing Customer Behaviour",
  "Running Logistic Regression Model",
  "Generating AI Explanation",
  "Building Recommendations",
  "Finalizing Prediction"
];

export const riskFactors = [
  { label: "Contract Type", detail: "Month-to-month contract", contribution: 34 },
  { label: "Monthly Charges", detail: "Above platform average", contribution: 21 },
  { label: "No Tech Support", detail: "Missing support subscription", contribution: 15 },
  { label: "Short Tenure", detail: "Only 12 months of history", contribution: 12 },
  { label: "Payment Method", detail: "Electronic check profile", contribution: 9 }
];

export const protectiveFactors = [
  { label: "Streaming Services", detail: "Entertainment services are active", contribution: -8 },
  { label: "Partner Status", detail: "Household relationship depth", contribution: -5 },
  { label: "Paperless Billing", detail: "Digital billing adoption", contribution: -3 },
  { label: "Phone Service", detail: "Core service attached", contribution: -2 }
];

export const retentionRecommendations = [
  { action: "Offer 15% Discount", reduction: 21, revenueSaved: 420, confidence: 91 },
  { action: "Provide Technical Support", reduction: 16, revenueSaved: 360, confidence: 88 },
  { action: "Upgrade Service Package", reduction: 12, revenueSaved: 300, confidence: 82 },
  { action: "Loyalty Program", reduction: 9, revenueSaved: 240, confidence: 79 },
  { action: "Personal Retention Call", reduction: 18, revenueSaved: 510, confidence: 93 }
];

export const customerComparison = [
  { label: "Monthly Charges", customer: 70, average: 64, note: "Above Average" },
  { label: "Risk", customer: 82, average: 27, note: "Higher Than 82% of Customers" },
  { label: "Tenure", customer: 12, average: 32, note: "Below Average" },
  { label: "Service Depth", customer: 55, average: 68, note: "Lower Than Average" }
];

export const similarCustomers = [
  { name: "Ahmed Benali", risk: 91, outcome: "At risk", retention: "Support call scheduled" },
  { name: "Michael Chen", risk: 73, outcome: "Saved", retention: "Discount accepted" },
  { name: "Lina Carter", risk: 78, outcome: "Saved", retention: "Annual plan upgrade" },
  { name: "Noah Martin", risk: 84, outcome: "Churned", retention: "No action taken" }
];

export const predictionTrend = [
  { month: "Jan", averageRisk: 34, highRisk: 212, volume: 820 },
  { month: "Feb", averageRisk: 37, highRisk: 245, volume: 940 },
  { month: "Mar", averageRisk: 41, highRisk: 284, volume: 1080 },
  { month: "Apr", averageRisk: 39, highRisk: 268, volume: 1170 },
  { month: "May", averageRisk: 44, highRisk: 328, volume: 1240 },
  { month: "Jun", averageRisk: 47, highRisk: 421, volume: 1253 }
];

export const riskDistribution = [
  { name: "Low", value: 3084, color: "#22C55E" },
  { name: "Medium", value: 2241, color: "#F59E0B" },
  { name: "High", value: 1297, color: "#F97316" },
  { name: "Critical", value: 421, color: "#EF4444" }
];

export const highRiskGroups = [
  { group: "Month-to-month + Fiber optic", customers: 984, risk: 72 },
  { group: "No tech support", customers: 1260, risk: 68 },
  { group: "Electronic check", customers: 1512, risk: 64 },
  { group: "Tenure under 12 months", customers: 842, risk: 59 },
  { group: "High monthly charges", customers: 734, risk: 57 }
];

export const batchPreviewRows = [
  { customerId: "CUST_03246", contract: "Month-to-month", monthly: 70, tenure: 12, status: "Ready" },
  { customerId: "CUST_18467", contract: "One year", monthly: 89, tenure: 28, status: "Ready" },
  { customerId: "CUST_93440", contract: "Month-to-month", monthly: 99, tenure: 7, status: "Ready" },
  { customerId: "CUST_33041", contract: "Month-to-month", monthly: 48, tenure: 4, status: "Ready" }
];

export const batchProcessingSteps = [
  "Reading Dataset",
  "Validating Data",
  "Cleaning Records",
  "Running Logistic Regression",
  "Generating Insights",
  "Building Report"
];

export const batchMetrics = [
  { label: "Total Customers", value: "1,000" },
  { label: "High Risk", value: "245" },
  { label: "Medium Risk", value: "370" },
  { label: "Low Risk", value: "385" },
  { label: "Revenue At Risk", value: "$184K" },
  { label: "Retention Opportunity", value: "312" }
];

export const batchDrivers = [
  { feature: "Month-to-month contract", impact: 78 },
  { feature: "No tech support", impact: 64 },
  { feature: "High monthly charges", impact: 58 },
  { feature: "Electronic check", impact: 46 },
  { feature: "Short tenure", impact: 42 }
];
