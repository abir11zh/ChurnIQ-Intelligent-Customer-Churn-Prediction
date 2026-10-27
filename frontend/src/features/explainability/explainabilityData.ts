export type ShapDirection = "Risk increasing" | "Risk reducing";
export type ShapImpact = "Critical" | "High" | "Medium" | "Protective";

export type ShapFeatureDriver = {
  feature: string;
  shortName: string;
  importance: number;
  direction: ShapDirection;
  impact: ShapImpact;
  affectedCustomers: number;
  revenueImpact: number;
  historicalContribution: string;
  businessImpact: string;
  explanation: string;
  action: string;
  expectedReduction: number;
};

export type LocalContribution = {
  feature: string;
  value: string;
  contribution: number;
  direction: "increase" | "reduce";
  explanation: string;
};

export const globalFeatureDrivers: ShapFeatureDriver[] = [
  {
    feature: "Contract Type",
    shortName: "Contract",
    importance: 34,
    direction: "Risk increasing",
    impact: "Critical",
    affectedCustomers: 2380,
    revenueImpact: 146200,
    historicalContribution: "Month-to-month contracts represent 62% of churn cases.",
    businessImpact: "High",
    explanation: "Customers on flexible monthly contracts leave more often because there is less commitment and lower switching friction.",
    action: "Offer annual plan incentives with premium onboarding.",
    expectedReduction: 18
  },
  {
    feature: "Monthly Charges",
    shortName: "Charges",
    importance: 24,
    direction: "Risk increasing",
    impact: "High",
    affectedCustomers: 1840,
    revenueImpact: 112500,
    historicalContribution: "High-charge customers show 1.8x more churn pressure when contract commitment is low.",
    businessImpact: "High",
    explanation: "Customers paying above the population average are more sensitive to perceived value gaps.",
    action: "Use targeted save offers and value reviews instead of broad discounting.",
    expectedReduction: 12
  },
  {
    feature: "Tenure",
    shortName: "Tenure",
    importance: 19,
    direction: "Risk reducing",
    impact: "Protective",
    affectedCustomers: 4210,
    revenueImpact: 90400,
    historicalContribution: "Long-tenure customers are 3.1x more likely to stay.",
    businessImpact: "Medium",
    explanation: "Relationship depth lowers churn risk because customers have more usage history and switching cost.",
    action: "Protect early-life customers with a 90-day onboarding program.",
    expectedReduction: 10
  },
  {
    feature: "Tech Support",
    shortName: "Support",
    importance: 17,
    direction: "Risk increasing",
    impact: "High",
    affectedCustomers: 1765,
    revenueImpact: 98200,
    historicalContribution: "Customers without technical support churn 2.4x more often.",
    businessImpact: "High",
    explanation: "Missing support increases churn because unresolved product friction can become a cancellation trigger.",
    action: "Offer a technical support package to high-risk customers.",
    expectedReduction: 15
  },
  {
    feature: "Internet Service",
    shortName: "Internet",
    importance: 14,
    direction: "Risk increasing",
    impact: "Medium",
    affectedCustomers: 1420,
    revenueImpact: 74300,
    historicalContribution: "Fiber optic customers need proactive value reinforcement.",
    businessImpact: "Medium",
    explanation: "Internet service type changes churn risk when it combines with high monthly charges and missing support.",
    action: "Bundle service checkups with renewal outreach.",
    expectedReduction: 8
  },
  {
    feature: "Payment Method",
    shortName: "Payment",
    importance: 12,
    direction: "Risk increasing",
    impact: "Medium",
    affectedCustomers: 1512,
    revenueImpact: 68100,
    historicalContribution: "Electronic check customers are overrepresented in churn cases.",
    businessImpact: "Medium",
    explanation: "Payment behavior can signal lower commitment or higher payment friction.",
    action: "Move eligible customers to automatic payment plans.",
    expectedReduction: 7
  },
  {
    feature: "Online Security",
    shortName: "Security",
    importance: 9,
    direction: "Risk reducing",
    impact: "Protective",
    affectedCustomers: 1280,
    revenueImpact: 45500,
    historicalContribution: "Security service adoption correlates with stronger retention.",
    businessImpact: "Medium",
    explanation: "Customers with more active services tend to perceive more platform value.",
    action: "Recommend security bundles during retention outreach.",
    expectedReduction: 6
  }
];

export const localCustomer = {
  id: "CUST_03246",
  name: "Sarah Johnson",
  email: "sarah@email.com",
  risk: 82,
  confidence: 94,
  riskLevel: "Critical",
  prediction: "Likely to churn",
  revenueAtRisk: 1200,
  lifetimeValue: 4820,
  segment: "At Risk",
  contract: "Month-to-month"
};

export const localContributions: LocalContribution[] = [
  {
    feature: "Contract Type",
    value: "Month-to-month",
    contribution: 22,
    direction: "increase",
    explanation: "Flexible contract makes cancellation easier and increases risk."
  },
  {
    feature: "Monthly Charges",
    value: "$70",
    contribution: 16,
    direction: "increase",
    explanation: "Charges are above the safer customer average for this segment."
  },
  {
    feature: "No Tech Support",
    value: "No",
    contribution: 12,
    direction: "increase",
    explanation: "Missing support increases the chance of unresolved service friction."
  },
  {
    feature: "Electronic Check",
    value: "Payment method",
    contribution: 8,
    direction: "increase",
    explanation: "This payment pattern appears more often among churned customers."
  },
  {
    feature: "Streaming Services",
    value: "TV and Movies",
    contribution: -7,
    direction: "reduce",
    explanation: "More active services increase perceived product value."
  },
  {
    feature: "Partner Status",
    value: "Partner",
    contribution: -4,
    direction: "reduce",
    explanation: "Household relationships can make the service stickier."
  }
];

export const waterfallSteps = [
  { label: "Base risk", value: 26, cumulative: 26, type: "base" },
  { label: "Contract", value: 22, cumulative: 48, type: "increase" },
  { label: "Charges", value: 16, cumulative: 64, type: "increase" },
  { label: "No support", value: 12, cumulative: 76, type: "increase" },
  { label: "Payment", value: 8, cumulative: 84, type: "increase" },
  { label: "Streaming", value: -7, cumulative: 77, type: "reduce" },
  { label: "Partner", value: -4, cumulative: 73, type: "reduce" },
  { label: "Final", value: 82, cumulative: 82, type: "final" }
];

export const comparisonMetrics = [
  { metric: "Monthly Charges", customer: 70, average: 64, highRisk: 78, lowRisk: 49, suffix: "$" },
  { metric: "Tenure", customer: 12, average: 32, highRisk: 10, lowRisk: 48, suffix: "mo" },
  { metric: "Support Usage", customer: 18, average: 42, highRisk: 21, lowRisk: 64, suffix: "%" },
  { metric: "Service Depth", customer: 54, average: 61, highRisk: 47, lowRisk: 72, suffix: "%" },
  { metric: "Risk Level", customer: 82, average: 27, highRisk: 73, lowRisk: 16, suffix: "%" }
];

export const populationComparison = [
  { group: "Customer", monthly: 70, tenure: 12, support: 18, risk: 82 },
  { group: "Population Average", monthly: 64, tenure: 32, support: 42, risk: 27 },
  { group: "High-Risk Customers", monthly: 78, tenure: 10, support: 21, risk: 73 },
  { group: "Low-Risk Customers", monthly: 49, tenure: 48, support: 64, risk: 16 }
];

export const insightCards = [
  "Contract type explains 34% of churn behavior in the current customer base.",
  "Customers without technical support churn 2.4x more often.",
  "Tenure strongly reduces churn risk after the first 12 months.",
  "High monthly charges increase churn probability when customers lack support.",
  "Revenue loss risk is concentrated in three customer groups."
];

export const revenueImpact = {
  revenueAtRisk: 45230,
  customersImpacted: 1240,
  potentialSavings: 18400,
  retentionOpportunities: 312
};

export const actionRecommendations = [
  {
    problem: "No Technical Support",
    action: "Offer Technical Support Package",
    expectedRiskReduction: 15,
    revenueSaved: 8400
  },
  {
    problem: "Month-to-month Contract",
    action: "Offer Annual Plan Incentive",
    expectedRiskReduction: 18,
    revenueSaved: 12200
  },
  {
    problem: "High Monthly Charges",
    action: "Run Value Review Call",
    expectedRiskReduction: 12,
    revenueSaved: 6800
  },
  {
    problem: "Electronic Check",
    action: "Move to Automatic Payment",
    expectedRiskReduction: 7,
    revenueSaved: 3900
  }
];
