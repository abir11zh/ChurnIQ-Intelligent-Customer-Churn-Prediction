import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BrainCircuit,
  FileText,
  Gauge,
  Megaphone,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users
} from "lucide-react";

export type CopilotVisualType = "metrics" | "chart" | "customers" | "table" | "report";

export type CopilotVisual =
  | { type: "metrics"; title: string; metrics: Array<{ label: string; value: string; tone: "primary" | "success" | "warning" | "danger" }> }
  | { type: "chart"; title: string; data: Array<{ label: string; churn: number; revenue: number }> }
  | { type: "customers"; title: string; customers: typeof highRiskCustomers }
  | { type: "table"; title: string; rows: Array<{ label: string; value: string; action: string }> }
  | { type: "report"; title: string; sections: Array<{ title: string; text: string }> };

export type CopilotAnswer = {
  title: string;
  answer: string;
  bullets: string[];
  sources: string[];
  actions: Array<{ label: string; href: string; tone?: "primary" | "secondary" | "outline" }>;
  visual?: CopilotVisual;
};

export const welcomePrompts = [
  "Why is churn increasing?",
  "Show high risk customers.",
  "Summarize this month's analytics.",
  "Which segment generates the most revenue?",
  "What is the biggest churn driver?",
  "Create retention strategy.",
  "Generate executive report."
];

export const recommendedPrompts = [
  "Analyze churn risk",
  "Compare customer segments",
  "Show retention opportunities",
  "Explain customer risk",
  "How much revenue is at risk?",
  "Which customers need retention actions?"
];

export const knowledgeSources = [
  { label: "Customer Data", status: "Synced", icon: Users },
  { label: "Prediction Data", status: "Live", icon: Gauge },
  { label: "CatBoost Predictions", status: "Production", icon: BrainCircuit },
  { label: "SHAP Explanations", status: "Ready", icon: Sparkles },
  { label: "Analytics", status: "Updated", icon: BarChart3 },
  { label: "Reports", status: "Available", icon: FileText },
  { label: "Segments", status: "Mapped", icon: Target },
  { label: "Campaigns", status: "Actionable", icon: Megaphone },
  { label: "Revenue Metrics", status: "Protected", icon: TrendingUp }
];

export const contextKpis = [
  { label: "Total Customers", value: "7,043", detail: "+12.4% growth", tone: "primary" },
  { label: "High Risk Customers", value: "421", detail: "Critical cohort", tone: "danger" },
  { label: "Revenue At Risk", value: "$45,230", detail: "+4.2% this week", tone: "danger" },
  { label: "Active Predictions", value: "1,253", detail: "CatBoost online", tone: "success" }
] as const;

export const liveInsights = [
  { title: "Churn increased by 4%", text: "Month-to-month customers are driving the weekly increase.", tone: "danger" },
  { title: "Revenue risk is growing", text: "$45,230 is currently exposed across 421 critical accounts.", tone: "warning" },
  { title: "Contract type remains top driver", text: "It explains 34% of churn behavior in the explanation layer.", tone: "primary" },
  { title: "Support bundle opportunity", text: "312 customers are eligible for a support-led save play.", tone: "success" }
] as const;

export const highRiskCustomers = [
  { id: "CUST_03246", name: "Sarah Johnson", risk: 82, revenue: "$1,200", segment: "At Risk", action: "Offer discount + support" },
  { id: "CUST_93440", name: "Ahmed Benali", risk: 91, revenue: "$1,188", segment: "Dormant", action: "Retention call today" },
  { id: "CUST_18467", name: "Michael Chen", risk: 73, revenue: "$2,136", segment: "High Value", action: "Upgrade package" },
  { id: "CUST_33041", name: "Maria Lopez", risk: 47, revenue: "$640", segment: "New", action: "Onboarding nurture" }
];

export const churnTrendData = [
  { label: "Jan", churn: 31, revenue: 38 },
  { label: "Feb", churn: 29, revenue: 34 },
  { label: "Mar", churn: 33, revenue: 42 },
  { label: "Apr", churn: 27, revenue: 31 },
  { label: "May", churn: 30, revenue: 39 },
  { label: "Jun", churn: 26.5, revenue: 45 }
];

export const conversationGroups = [
  {
    label: "Today",
    items: [
      { title: "High-risk customer review", preview: "Show customers above 80% risk", time: "09:42" },
      { title: "Executive report draft", preview: "Generate executive report", time: "10:18" }
    ]
  },
  {
    label: "Yesterday",
    items: [
      { title: "Revenue risk analysis", preview: "How much revenue is at risk?", time: "16:20" },
      { title: "SHAP driver summary", preview: "What is the biggest churn driver?", time: "14:05" }
    ]
  },
  {
    label: "This Week",
    items: [
      { title: "VIP retention strategy", preview: "Best strategy for VIP customers", time: "Mon" },
      { title: "Segment comparison", preview: "Which segment is most profitable?", time: "Tue" }
    ]
  },
  {
    label: "This Month",
    items: [
      { title: "Monthly churn analytics", preview: "What changed this month?", time: "Jun 04" }
    ]
  }
];

export const reportTemplates = [
  {
    title: "Executive Churn Report",
    description: "Board-ready summary with revenue, risk and recommended actions.",
    sections: ["Summary", "Revenue Analysis", "Risk Analysis", "Customer Analysis", "Recommended Actions"]
  },
  {
    title: "Retention Strategy Report",
    description: "Campaign plan for high-risk customers and priority segments.",
    sections: ["Target Cohorts", "Save Plays", "Expected Savings", "Campaign Timeline"]
  },
  {
    title: "SHAP Business Explanation",
    description: "Plain English explanation of churn drivers for non-technical managers.",
    sections: ["Top Drivers", "Affected Customers", "Revenue Impact", "Actions"]
  }
];

export const copilotQuickActions: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Create Campaign", href: "/campaigns", icon: Megaphone },
  { label: "Open Customers", href: "/customers", icon: Users },
  { label: "Run Prediction", href: "/predictions/single", icon: Gauge },
  { label: "Export Report", href: "/reports", icon: FileText },
  { label: "View SHAP", href: "/shap", icon: Search }
];

export function generateCopilotAnswer(prompt: string): CopilotAnswer {
  const query = prompt.toLowerCase();

  if (query.includes("executive") || query.includes("report")) {
    return {
      title: "Executive report generated",
      answer: "I generated an executive-ready churn report focused on revenue protection, customer risk and recommended actions.",
      bullets: [
        "Churn pressure is concentrated in month-to-month customers.",
        "Revenue at risk is currently $45,230 across the critical cohort.",
        "The fastest retention opportunity is a support-led save play for 312 customers.",
        "Recommended next step: launch a targeted campaign and export the report for leadership."
      ],
      sources: ["Dashboard KPIs", "CatBoost Predictions", "SHAP Business Insights", "Revenue Metrics"],
      actions: [
        { label: "Open Executive Analytics", href: "/executive", tone: "primary" },
        { label: "Export Report", href: "/reports", tone: "outline" },
        { label: "Open Business Insights", href: "/shap/business-insights", tone: "outline" }
      ],
      visual: {
        type: "report",
        title: "Executive Report",
        sections: [
          { title: "Summary", text: "Churn is improving overall, but critical risk remains concentrated in flexible contracts." },
          { title: "Revenue Analysis", text: "$45,230 is currently at risk, with $18,400 potential savings from targeted actions." },
          { title: "Risk Analysis", text: "421 customers require immediate attention and 82 are critical." },
          { title: "Recommended Actions", text: "Offer annual incentives, technical support bundles and retention calls." }
        ]
      }
    };
  }

  if (query.includes("trend") || query.includes("analytics") || query.includes("changed") || query.includes("increasing")) {
    return {
      title: "Churn trend analysis",
      answer: "Churn is lower than the early-year peak, but revenue risk increased because more high-value customers entered the critical cohort.",
      bullets: [
        "Current churn rate is 26.5%.",
        "Revenue at risk increased by 4.2% this week.",
        "Month-to-month contracts remain the strongest churn signal.",
        "High-value customers need prioritized retention outreach."
      ],
      sources: ["Analytics Hub", "Dashboard", "Prediction Insights"],
      actions: [
        { label: "Open Analytics", href: "/analytics", tone: "primary" },
        { label: "View Prediction Insights", href: "/predictions/insights", tone: "outline" }
      ],
      visual: { type: "chart", title: "Churn and Revenue Risk Trend", data: churnTrendData }
    };
  }

  if (query.includes("customer") || query.includes("80") || query.includes("risk") || query.includes("likely")) {
    return {
      title: "High-risk customer list",
      answer: "I found the customers most likely to churn and prioritized them by risk, revenue contribution and recommended action.",
      bullets: [
        "Ahmed Benali is the most urgent account at 91% churn risk.",
        "Sarah Johnson is critical and should receive discount plus support.",
        "Michael Chen is high-value and should receive an upgrade package.",
        "Critical customers should be routed into a retention campaign today."
      ],
      sources: ["Customer Data", "CatBoost Predictions", "Retention Center"],
      actions: [
        { label: "Open Customers", href: "/customers", tone: "primary" },
        { label: "Create Campaign", href: "/campaigns", tone: "outline" }
      ],
      visual: { type: "customers", title: "Customers above priority threshold", customers: highRiskCustomers }
    };
  }

  if (query.includes("driver") || query.includes("shap") || query.includes("why") || query.includes("contract")) {
    return {
      title: "Top churn driver explained",
      answer: "The strongest churn driver is contract type. Customers on month-to-month contracts are much more likely to churn because they have lower commitment and can leave with less friction.",
      bullets: [
        "Contract type explains 34% of churn behavior.",
        "Customers without technical support churn 2.4x more often.",
        "Tenure strongly reduces churn risk after the first year.",
        "Best action: move high-risk customers toward annual plans with support coverage."
      ],
      sources: ["SHAP Global", "SHAP Business Insights", "Model Performance"],
      actions: [
        { label: "View SHAP", href: "/shap/global", tone: "primary" },
        { label: "Open Business Explanation", href: "/shap/business-insights", tone: "outline" }
      ],
      visual: {
        type: "table",
        title: "Top churn drivers",
        rows: [
          { label: "Contract Type", value: "34% influence", action: "Offer annual plan incentive" },
          { label: "Monthly Charges", value: "24% influence", action: "Run value review" },
          { label: "No Tech Support", value: "17% influence", action: "Offer support package" },
          { label: "Tenure", value: "Protective", action: "Improve onboarding" }
        ]
      }
    };
  }

  if (query.includes("revenue") || query.includes("saved") || query.includes("profitable")) {
    return {
      title: "Revenue risk summary",
      answer: "Current revenue at risk is $45,230. The most profitable protection path is to prioritize high-value customers with critical churn risk.",
      bullets: [
        "$45,230 revenue is at risk in the active critical cohort.",
        "$18,400 can be protected through immediate retention actions.",
        "High-value and VIP customers should receive account-manager outreach.",
        "Support packages and annual plan incentives create the highest expected savings."
      ],
      sources: ["Revenue Metrics", "Customer Segments", "Retention Center"],
      actions: [
        { label: "Open Retention Center", href: "/retention", tone: "primary" },
        { label: "Export Revenue Report", href: "/reports", tone: "outline" }
      ],
      visual: {
        type: "metrics",
        title: "Revenue protection snapshot",
        metrics: [
          { label: "Revenue At Risk", value: "$45,230", tone: "danger" },
          { label: "Potential Savings", value: "$18,400", tone: "success" },
          { label: "Impacted Customers", value: "1,240", tone: "primary" },
          { label: "Retention Opportunities", value: "312", tone: "warning" }
        ]
      }
    };
  }

  if (query.includes("retention") || query.includes("strategy") || query.includes("campaign") || query.includes("vip")) {
    return {
      title: "Retention strategy",
      answer: "The best retention strategy is segmented: critical customers need immediate save offers, VIP customers need account-manager outreach, and new customers need onboarding support. The highest-ROI next action is the Technical Support Upgrade play.",
      bullets: [
        "Launch a high-risk save campaign for 421 customers.",
        "Offer technical support bundles to customers without support.",
        "Move month-to-month customers into annual plans with incentives.",
        "Protect VIP customers with personal follow-up and loyalty credits.",
        "Use the Retention Simulator before spending budget on discounts or support upgrades."
      ],
      sources: ["Retention Center", "Campaigns", "Customer Segments"],
      actions: [
        { label: "Open Retention Intelligence", href: "/retention", tone: "primary" },
        { label: "Run Simulator", href: "/retention/simulator", tone: "outline" },
        { label: "Create Campaign", href: "/retention/campaigns", tone: "outline" }
      ],
      visual: {
        type: "table",
        title: "Recommended retention plays",
        rows: [
          { label: "Critical risk", value: "421 customers", action: "Immediate save offer" },
          { label: "Technical support gap", value: "$11,200 saved", action: "Support Upgrade" },
          { label: "VIP", value: "$2.4M protected ARR", action: "Account-manager outreach" },
          { label: "Contract risk", value: "118 customers", action: "Annual migration" }
        ]
      }
    };
  }

  return {
    title: "Business intelligence answer",
    answer: "I analyzed the current customer intelligence workspace and found that churn risk is mainly driven by contract flexibility, price pressure and missing support coverage.",
    bullets: [
      "Total customers: 7,043.",
      "Current churn rate: 26.5%.",
      "High-risk customers: 421.",
      "Recommended action: prioritize retention campaigns for month-to-month customers."
    ],
    sources: ["Dashboard", "Customer Data", "Prediction Center", "SHAP"],
    actions: [
      { label: "Open Dashboard", href: "/dashboard", tone: "primary" },
      { label: "View Customers", href: "/customers", tone: "outline" }
    ],
    visual: {
      type: "metrics",
      title: "Workspace snapshot",
      metrics: [
        { label: "Customers", value: "7,043", tone: "primary" },
        { label: "Churn Rate", value: "26.5%", tone: "warning" },
        { label: "High Risk", value: "421", tone: "danger" },
        { label: "ROC-AUC", value: "84.7%", tone: "success" }
      ]
    }
  };
}
