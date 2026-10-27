export type CustomerSegment = "VIP" | "Loyal" | "At Risk" | "New" | "Dormant" | "High Value";
export type CustomerRisk = "Low" | "Medium" | "High" | "Critical";

export type CustomerService = {
  label: string;
  value: string;
  active: boolean;
  risk?: boolean;
};

export type PredictionHistoryItem = {
  date: string;
  model: "CatBoost";
  probability: number;
  riskLevel: CustomerRisk;
  confidence: number;
  result: "Churn" | "Retain";
};

export type RetentionAction = {
  action: string;
  status: "Recommended" | "Sent" | "Accepted" | "Scheduled";
  riskReduction: number;
  expectedRevenueSaved: number;
};

export type CustomerTimelineEvent = {
  type: string;
  title: string;
  date: string;
  description: string;
};

export type CustomerCrmRecord = {
  id: string;
  customerId: string;
  name: string;
  email: string;
  gender: "Female" | "Male";
  seniorCitizen: boolean;
  partner: boolean;
  dependents: boolean;
  contract: "Month-to-month" | "One year" | "Two year";
  customerSince: string;
  tenure: number;
  monthlyCharges: number;
  totalCharges: number;
  paymentMethod: string;
  paperlessBilling: boolean;
  internetService: "Fiber optic" | "DSL" | "No internet service";
  techSupport: boolean;
  onlineSecurity: boolean;
  segment: CustomerSegment;
  healthScore: number;
  churnProbability: number;
  riskLevel: CustomerRisk;
  lastPrediction: string;
  lifetimeValue: number;
  revenueContribution: number;
  retentionProbability: number;
  previousRisk: number;
  riskChange: number;
  confidence: number;
  services: CustomerService[];
  predictionHistory: PredictionHistoryItem[];
  retentionHistory: RetentionAction[];
  timeline: CustomerTimelineEvent[];
  radar: Array<{ subject: string; score: number }>;
  aiSummary: string;
  aiInsights: {
    riskyBecause: string;
    bestAction: string;
    revenueImpact: string;
    similarBehavior: string;
  };
};

export const customerCrmRecords: CustomerCrmRecord[] = [
  {
    id: "db_cus_001",
    customerId: "CUST_03246",
    name: "Sarah Johnson",
    email: "sarah@email.com",
    gender: "Female",
    seniorCitizen: false,
    partner: true,
    dependents: true,
    contract: "Month-to-month",
    customerSince: "2025-06-12",
    tenure: 12,
    monthlyCharges: 70,
    totalCharges: 840,
    paymentMethod: "Electronic check",
    paperlessBilling: true,
    internetService: "Fiber optic",
    techSupport: false,
    onlineSecurity: false,
    segment: "At Risk",
    healthScore: 18,
    churnProbability: 82,
    riskLevel: "Critical",
    lastPrediction: "June 10, 2026",
    lifetimeValue: 4820,
    revenueContribution: 1200.5,
    retentionProbability: 31,
    previousRisk: 76,
    riskChange: 6,
    confidence: 92,
    services: [
      { label: "Phone Service", value: "Yes", active: true },
      { label: "Multiple Lines", value: "No", active: false },
      { label: "Internet Service", value: "Fiber optic", active: true, risk: true },
      { label: "Online Security", value: "No", active: false, risk: true },
      { label: "Online Backup", value: "No", active: false },
      { label: "Device Protection", value: "No", active: false },
      { label: "Tech Support", value: "No", active: false, risk: true },
      { label: "Streaming TV", value: "Yes", active: true },
      { label: "Streaming Movies", value: "Yes", active: true }
    ],
    predictionHistory: [
      { date: "Jun 10", model: "CatBoost", probability: 82, riskLevel: "Critical", confidence: 92, result: "Churn" },
      { date: "Jun 02", model: "CatBoost", probability: 76, riskLevel: "High", confidence: 89, result: "Churn" },
      { date: "May 20", model: "CatBoost", probability: 68, riskLevel: "High", confidence: 85, result: "Churn" },
      { date: "May 04", model: "CatBoost", probability: 59, riskLevel: "Medium", confidence: 81, result: "Churn" }
    ],
    retentionHistory: [
      { action: "Offer Discount", status: "Recommended", riskReduction: 21, expectedRevenueSaved: 420 },
      { action: "Technical Support Call", status: "Scheduled", riskReduction: 14, expectedRevenueSaved: 290 },
      { action: "Upgrade Plan", status: "Recommended", riskReduction: 11, expectedRevenueSaved: 260 }
    ],
    timeline: [
      { type: "Customer Created", title: "Customer created", date: "Jun 12, 2025", description: "Joined on a month-to-month fiber optic plan." },
      { type: "Contract Updated", title: "Monthly charges increased", date: "Mar 18, 2026", description: "Billing moved into the high-charge band." },
      { type: "Prediction Made", title: "CatBoost prediction made", date: "Jun 02, 2026", description: "Customer scored as high risk." },
      { type: "Risk Increased", title: "Risk increased to critical", date: "Jun 10, 2026", description: "Probability reached 82% after service and billing changes." },
      { type: "Campaign Sent", title: "Retention campaign prepared", date: "Jun 10, 2026", description: "Discount and support bundle recommended." }
    ],
    radar: [
      { subject: "Engagement", score: 42 },
      { subject: "Revenue", score: 78 },
      { subject: "Loyalty", score: 28 },
      { subject: "Risk", score: 82 },
      { subject: "Services", score: 46 },
      { subject: "Support", score: 18 }
    ],
    aiSummary: "This customer is currently at critical churn risk due to a month-to-month contract, high monthly charges, fiber optic service pressure and lack of technical support.",
    aiInsights: {
      riskyBecause: "Contract flexibility, missing support services and rising charges align with historically churn-heavy profiles.",
      bestAction: "Offer a 15% discount with a technical support onboarding call this week.",
      revenueImpact: "Retaining this customer protects about $420 in near-term revenue and $4,820 in lifetime value.",
      similarBehavior: "Similar customers accepted support bundles 38% more often than discount-only offers."
    }
  },
  {
    id: "db_cus_002",
    customerId: "CUST_18467",
    name: "Michael Chen",
    email: "m.chen@email.com",
    gender: "Male",
    seniorCitizen: false,
    partner: true,
    dependents: false,
    contract: "One year",
    customerSince: "2024-02-08",
    tenure: 28,
    monthlyCharges: 89,
    totalCharges: 2492,
    paymentMethod: "Bank transfer",
    paperlessBilling: true,
    internetService: "Fiber optic",
    techSupport: true,
    onlineSecurity: false,
    segment: "High Value",
    healthScore: 42,
    churnProbability: 73,
    riskLevel: "High",
    lastPrediction: "June 10, 2026",
    lifetimeValue: 7210,
    revenueContribution: 2136,
    retentionProbability: 48,
    previousRisk: 67,
    riskChange: 6,
    confidence: 88,
    services: [
      { label: "Phone Service", value: "Yes", active: true },
      { label: "Multiple Lines", value: "Yes", active: true },
      { label: "Internet Service", value: "Fiber optic", active: true, risk: true },
      { label: "Online Security", value: "No", active: false, risk: true },
      { label: "Online Backup", value: "Yes", active: true },
      { label: "Device Protection", value: "Yes", active: true },
      { label: "Tech Support", value: "Yes", active: true },
      { label: "Streaming TV", value: "Yes", active: true },
      { label: "Streaming Movies", value: "Yes", active: true }
    ],
    predictionHistory: [
      { date: "Jun 10", model: "CatBoost", probability: 73, riskLevel: "High", confidence: 88, result: "Churn" },
      { date: "Jun 01", model: "CatBoost", probability: 67, riskLevel: "High", confidence: 86, result: "Churn" },
      { date: "May 15", model: "CatBoost", probability: 61, riskLevel: "High", confidence: 84, result: "Churn" },
      { date: "Apr 29", model: "CatBoost", probability: 52, riskLevel: "Medium", confidence: 80, result: "Retain" }
    ],
    retentionHistory: [
      { action: "Upgrade Plan", status: "Recommended", riskReduction: 15, expectedRevenueSaved: 510 },
      { action: "Loyalty Program", status: "Sent", riskReduction: 9, expectedRevenueSaved: 220 }
    ],
    timeline: [
      { type: "Customer Created", title: "Customer created", date: "Feb 8, 2024", description: "High-value account activated." },
      { type: "Prediction Made", title: "CatBoost score increased", date: "Jun 1, 2026", description: "Moved from medium to high risk." },
      { type: "Campaign Sent", title: "Loyalty offer sent", date: "Jun 8, 2026", description: "Premium plan incentive delivered." }
    ],
    radar: [
      { subject: "Engagement", score: 62 },
      { subject: "Revenue", score: 92 },
      { subject: "Loyalty", score: 58 },
      { subject: "Risk", score: 73 },
      { subject: "Services", score: 76 },
      { subject: "Support", score: 70 }
    ],
    aiSummary: "High-value customer with elevated churn risk from high monthly charges and missing online security despite healthy service adoption.",
    aiInsights: {
      riskyBecause: "Large service bundle and high charges create value sensitivity.",
      bestAction: "Move the customer to an annual premium bundle with online security included.",
      revenueImpact: "Retention protects about $510 in expected near-term revenue.",
      similarBehavior: "High-value fiber customers respond best to bundle upgrades."
    }
  },
  {
    id: "db_cus_003",
    customerId: "CUST_02158",
    name: "Emily Davis",
    email: "emily@email.com",
    gender: "Female",
    seniorCitizen: false,
    partner: false,
    dependents: true,
    contract: "Two year",
    customerSince: "2021-12-14",
    tenure: 52,
    monthlyCharges: 61,
    totalCharges: 3172,
    paymentMethod: "Credit card",
    paperlessBilling: false,
    internetService: "DSL",
    techSupport: true,
    onlineSecurity: true,
    segment: "Loyal",
    healthScore: 86,
    churnProbability: 18,
    riskLevel: "Low",
    lastPrediction: "June 9, 2026",
    lifetimeValue: 6360,
    revenueContribution: 732,
    retentionProbability: 91,
    previousRisk: 21,
    riskChange: -3,
    confidence: 94,
    services: [
      { label: "Phone Service", value: "Yes", active: true },
      { label: "Multiple Lines", value: "No", active: false },
      { label: "Internet Service", value: "DSL", active: true },
      { label: "Online Security", value: "Yes", active: true },
      { label: "Online Backup", value: "Yes", active: true },
      { label: "Device Protection", value: "Yes", active: true },
      { label: "Tech Support", value: "Yes", active: true },
      { label: "Streaming TV", value: "No", active: false },
      { label: "Streaming Movies", value: "No", active: false }
    ],
    predictionHistory: [
      { date: "Jun 09", model: "CatBoost", probability: 18, riskLevel: "Low", confidence: 94, result: "Retain" },
      { date: "May 22", model: "CatBoost", probability: 21, riskLevel: "Low", confidence: 91, result: "Retain" },
      { date: "Apr 30", model: "CatBoost", probability: 24, riskLevel: "Low", confidence: 90, result: "Retain" }
    ],
    retentionHistory: [
      { action: "Loyalty Program", status: "Accepted", riskReduction: 5, expectedRevenueSaved: 180 }
    ],
    timeline: [
      { type: "Customer Created", title: "Customer created", date: "Dec 14, 2021", description: "Long-term DSL customer." },
      { type: "Offer Accepted", title: "Loyalty credit accepted", date: "May 18, 2026", description: "Customer accepted renewal incentive." },
      { type: "Prediction Made", title: "Low risk confirmed", date: "Jun 9, 2026", description: "CatBoost probability remained low." }
    ],
    radar: [
      { subject: "Engagement", score: 82 },
      { subject: "Revenue", score: 64 },
      { subject: "Loyalty", score: 94 },
      { subject: "Risk", score: 18 },
      { subject: "Services", score: 82 },
      { subject: "Support", score: 88 }
    ],
    aiSummary: "This loyal customer has strong tenure, stable contract terms and active support services. Retention risk is low.",
    aiInsights: {
      riskyBecause: "No immediate risk. Main watch point is limited streaming service adoption.",
      bestAction: "Maintain loyalty program and offer optional streaming expansion.",
      revenueImpact: "Stable account with strong renewal probability.",
      similarBehavior: "Long-tenure two-year customers show the highest retention rates."
    }
  },
  {
    id: "db_cus_004",
    customerId: "CUST_35249",
    name: "David Wilson",
    email: "david@email.com",
    gender: "Male",
    seniorCitizen: false,
    partner: false,
    dependents: false,
    contract: "Two year",
    customerSince: "2020-09-03",
    tenure: 68,
    monthlyCharges: 82,
    totalCharges: 5576,
    paymentMethod: "Credit card",
    paperlessBilling: true,
    internetService: "Fiber optic",
    techSupport: true,
    onlineSecurity: true,
    segment: "VIP",
    healthScore: 91,
    churnProbability: 22,
    riskLevel: "Low",
    lastPrediction: "June 8, 2026",
    lifetimeValue: 9820,
    revenueContribution: 984,
    retentionProbability: 93,
    previousRisk: 25,
    riskChange: -3,
    confidence: 93,
    services: [
      { label: "Phone Service", value: "Yes", active: true },
      { label: "Multiple Lines", value: "Yes", active: true },
      { label: "Internet Service", value: "Fiber optic", active: true },
      { label: "Online Security", value: "Yes", active: true },
      { label: "Online Backup", value: "Yes", active: true },
      { label: "Device Protection", value: "Yes", active: true },
      { label: "Tech Support", value: "Yes", active: true },
      { label: "Streaming TV", value: "Yes", active: true },
      { label: "Streaming Movies", value: "Yes", active: true }
    ],
    predictionHistory: [
      { date: "Jun 08", model: "CatBoost", probability: 22, riskLevel: "Low", confidence: 93, result: "Retain" },
      { date: "May 16", model: "CatBoost", probability: 25, riskLevel: "Low", confidence: 91, result: "Retain" }
    ],
    retentionHistory: [
      { action: "Loyalty Program", status: "Accepted", riskReduction: 4, expectedRevenueSaved: 220 }
    ],
    timeline: [
      { type: "Customer Created", title: "Customer created", date: "Sep 3, 2020", description: "VIP bundle activated." },
      { type: "Offer Accepted", title: "Annual loyalty program accepted", date: "May 16, 2026", description: "Customer renewed on a premium plan." }
    ],
    radar: [
      { subject: "Engagement", score: 88 },
      { subject: "Revenue", score: 95 },
      { subject: "Loyalty", score: 96 },
      { subject: "Risk", score: 22 },
      { subject: "Services", score: 98 },
      { subject: "Support", score: 92 }
    ],
    aiSummary: "VIP customer with low risk, broad service adoption and strong renewal behavior.",
    aiInsights: {
      riskyBecause: "No major risk. Price sensitivity should be monitored due to premium charges.",
      bestAction: "Protect with VIP loyalty benefits and proactive account check-ins.",
      revenueImpact: "Top-tier revenue account with $9,820 lifetime value.",
      similarBehavior: "VIP customers with two-year contracts rarely churn when support remains active."
    }
  },
  {
    id: "db_cus_005",
    customerId: "CUST_93440",
    name: "Ahmed Benali",
    email: "ahmed.benali@email.com",
    gender: "Male",
    seniorCitizen: true,
    partner: false,
    dependents: false,
    contract: "Month-to-month",
    customerSince: "2025-11-22",
    tenure: 7,
    monthlyCharges: 99,
    totalCharges: 693,
    paymentMethod: "Electronic check",
    paperlessBilling: true,
    internetService: "Fiber optic",
    techSupport: false,
    onlineSecurity: false,
    segment: "Dormant",
    healthScore: 12,
    churnProbability: 91,
    riskLevel: "Critical",
    lastPrediction: "June 10, 2026",
    lifetimeValue: 3120,
    revenueContribution: 1188,
    retentionProbability: 18,
    previousRisk: 84,
    riskChange: 7,
    confidence: 91,
    services: [
      { label: "Phone Service", value: "Yes", active: true },
      { label: "Multiple Lines", value: "No", active: false },
      { label: "Internet Service", value: "Fiber optic", active: true, risk: true },
      { label: "Online Security", value: "No", active: false, risk: true },
      { label: "Online Backup", value: "No", active: false },
      { label: "Device Protection", value: "No", active: false },
      { label: "Tech Support", value: "No", active: false, risk: true },
      { label: "Streaming TV", value: "No", active: false },
      { label: "Streaming Movies", value: "No", active: false }
    ],
    predictionHistory: [
      { date: "Jun 10", model: "CatBoost", probability: 91, riskLevel: "Critical", confidence: 91, result: "Churn" },
      { date: "Jun 01", model: "CatBoost", probability: 84, riskLevel: "Critical", confidence: 88, result: "Churn" },
      { date: "May 17", model: "CatBoost", probability: 79, riskLevel: "High", confidence: 85, result: "Churn" }
    ],
    retentionHistory: [
      { action: "Technical Support Call", status: "Recommended", riskReduction: 19, expectedRevenueSaved: 350 },
      { action: "Offer Discount", status: "Recommended", riskReduction: 17, expectedRevenueSaved: 310 }
    ],
    timeline: [
      { type: "Customer Created", title: "Customer created", date: "Nov 22, 2025", description: "Short-tenure fiber customer." },
      { type: "Risk Increased", title: "Critical risk detected", date: "Jun 10, 2026", description: "Risk crossed 90%." }
    ],
    radar: [
      { subject: "Engagement", score: 18 },
      { subject: "Revenue", score: 72 },
      { subject: "Loyalty", score: 12 },
      { subject: "Risk", score: 91 },
      { subject: "Services", score: 24 },
      { subject: "Support", score: 8 }
    ],
    aiSummary: "Dormant short-tenure customer with critical churn risk due to high monthly charges, missing support and electronic check billing.",
    aiInsights: {
      riskyBecause: "Short tenure plus unsupported fiber service creates the strongest churn pattern in the dataset.",
      bestAction: "Call within 24 hours and bundle technical support with a discount.",
      revenueImpact: "Expected save opportunity is about $350.",
      similarBehavior: "Dormant high-charge customers churn quickly without human outreach."
    }
  },
  {
    id: "db_cus_006",
    customerId: "CUST_33041",
    name: "Maria Lopez",
    email: "maria.lopez@email.com",
    gender: "Female",
    seniorCitizen: false,
    partner: true,
    dependents: false,
    contract: "Month-to-month",
    customerSince: "2026-02-02",
    tenure: 4,
    monthlyCharges: 48,
    totalCharges: 192,
    paymentMethod: "Mailed check",
    paperlessBilling: false,
    internetService: "DSL",
    techSupport: false,
    onlineSecurity: true,
    segment: "New",
    healthScore: 61,
    churnProbability: 47,
    riskLevel: "Medium",
    lastPrediction: "June 7, 2026",
    lifetimeValue: 1880,
    revenueContribution: 576,
    retentionProbability: 67,
    previousRisk: 43,
    riskChange: 4,
    confidence: 82,
    services: [
      { label: "Phone Service", value: "Yes", active: true },
      { label: "Multiple Lines", value: "No", active: false },
      { label: "Internet Service", value: "DSL", active: true },
      { label: "Online Security", value: "Yes", active: true },
      { label: "Online Backup", value: "No", active: false },
      { label: "Device Protection", value: "No", active: false },
      { label: "Tech Support", value: "No", active: false, risk: true },
      { label: "Streaming TV", value: "No", active: false },
      { label: "Streaming Movies", value: "No", active: false }
    ],
    predictionHistory: [
      { date: "Jun 07", model: "CatBoost", probability: 47, riskLevel: "Medium", confidence: 82, result: "Retain" },
      { date: "May 20", model: "CatBoost", probability: 43, riskLevel: "Medium", confidence: 80, result: "Retain" }
    ],
    retentionHistory: [
      { action: "Onboarding Call", status: "Scheduled", riskReduction: 8, expectedRevenueSaved: 120 }
    ],
    timeline: [
      { type: "Customer Created", title: "Customer created", date: "Feb 2, 2026", description: "New DSL customer." },
      { type: "Prediction Made", title: "Medium risk prediction", date: "Jun 7, 2026", description: "Onboarding intervention recommended." }
    ],
    radar: [
      { subject: "Engagement", score: 52 },
      { subject: "Revenue", score: 38 },
      { subject: "Loyalty", score: 34 },
      { subject: "Risk", score: 47 },
      { subject: "Services", score: 48 },
      { subject: "Support", score: 24 }
    ],
    aiSummary: "New customer with medium churn risk. The main opportunity is onboarding and technical support activation.",
    aiInsights: {
      riskyBecause: "Short tenure and no support lower stability.",
      bestAction: "Schedule onboarding and explain support benefits.",
      revenueImpact: "Early save action can protect the onboarding cohort.",
      similarBehavior: "New DSL customers improve retention when onboarding happens before month 6."
    }
  }
];

export const crmSegmentSummaries = [
  {
    name: "VIP" as CustomerSegment,
    description: "Highest-value customers with strong service adoption and low churn risk.",
    customers: 842,
    avgChurnProbability: 14,
    avgRevenue: 940,
    retentionRate: 94,
    strategy: "Protect with loyalty benefits and proactive account management."
  },
  {
    name: "Loyal" as CustomerSegment,
    description: "Long-tenure customers with stable contracts and healthy retention.",
    customers: 2418,
    avgChurnProbability: 18,
    avgRevenue: 610,
    retentionRate: 91,
    strategy: "Offer expansion bundles and renewal rewards."
  },
  {
    name: "At Risk" as CustomerSegment,
    description: "Customers showing elevated churn probability and revenue exposure.",
    customers: 1234,
    avgChurnProbability: 68,
    avgRevenue: 520,
    retentionRate: 41,
    strategy: "Prioritize discount, support and contract migration campaigns."
  },
  {
    name: "New" as CustomerSegment,
    description: "Recently acquired customers still forming product habits.",
    customers: 689,
    avgChurnProbability: 39,
    avgRevenue: 330,
    retentionRate: 72,
    strategy: "Activate onboarding, education and early support."
  },
  {
    name: "Dormant" as CustomerSegment,
    description: "Low-engagement customers with weak support adoption.",
    customers: 426,
    avgChurnProbability: 74,
    avgRevenue: 470,
    retentionRate: 32,
    strategy: "Use urgent human outreach and service recovery."
  },
  {
    name: "High Value" as CustomerSegment,
    description: "Large revenue accounts that require premium retention care.",
    customers: 713,
    avgChurnProbability: 42,
    avgRevenue: 890,
    retentionRate: 78,
    strategy: "Bundle premium service and account-managed retention."
  }
];

export const segmentRiskHeatmap = [
  { segment: "VIP", low: 72, medium: 19, high: 7, critical: 2 },
  { segment: "Loyal", low: 68, medium: 21, high: 8, critical: 3 },
  { segment: "At Risk", low: 8, medium: 18, high: 46, critical: 28 },
  { segment: "New", low: 28, medium: 42, high: 22, critical: 8 },
  { segment: "Dormant", low: 6, medium: 20, high: 38, critical: 36 },
  { segment: "High Value", low: 36, medium: 32, high: 22, critical: 10 }
];

export const segmentScatterPoints = [
  { segment: "VIP", tenure: 68, revenue: 940, risk: 14 },
  { segment: "Loyal", tenure: 54, revenue: 610, risk: 18 },
  { segment: "At Risk", tenure: 16, revenue: 520, risk: 68 },
  { segment: "New", tenure: 6, revenue: 330, risk: 39 },
  { segment: "Dormant", tenure: 9, revenue: 470, risk: 74 },
  { segment: "High Value", tenure: 34, revenue: 890, risk: 42 }
];

export function getCustomerByRouteId(id?: string) {
  if (!id) return customerCrmRecords[0];
  return customerCrmRecords.find((customer) => customer.customerId === id || customer.id === id) ?? customerCrmRecords[0];
}
