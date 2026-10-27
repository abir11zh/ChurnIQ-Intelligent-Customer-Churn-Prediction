export type Role = "Owner" | "Admin" | "Manager" | "Analyst" | "Viewer";

export type Permission =
  | "dashboard:read"
  | "organization:read"
  | "organization:write"
  | "customers:read"
  | "customers:write"
  | "segments:read"
  | "predictions:read"
  | "predictions:write"
  | "analytics:read"
  | "models:read"
  | "mlops:read"
  | "mlops:write"
  | "shap:read"
  | "ai:read"
  | "retention:read"
  | "campaigns:read"
  | "campaigns:write"
  | "reports:read"
  | "reports:write"
  | "notifications:read"
  | "team:read"
  | "team:write"
  | "activity:read"
  | "audit:read"
  | "integrations:read"
  | "integrations:write"
  | "security:read"
  | "system:read"
  | "api_keys:read"
  | "api_keys:write"
  | "settings:read"
  | "settings:write"
  | "support:read"
  | "billing:read";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: Role;
  permissions: Permission[];
  workspaceId: string;
  createdAt: string;
  lastLogin: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: "Starter" | "Growth" | "Enterprise";
  region: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerId: string;
  name: string;
  email: string;
  gender: "Male" | "Female";
  contract: "Month-to-month" | "One year" | "Two year";
  tenure: number;
  monthlyCharges: number;
  totalCharges: number;
  churnProbability: number;
  riskLevel: RiskLevel;
  segment: "VIP" | "Loyal" | "At Risk" | "New" | "Core";
  createdAt: string;
}

export interface Prediction {
  id: string;
  customerId: string;
  modelName: string;
  probability: number;
  prediction: "Churn" | "Retain";
  confidence: number;
  createdAt: string;
}

export interface Report {
  id: string;
  name: string;
  type: "Customer Churn" | "Model Performance" | "Revenue" | "Retention" | "Executive";
  status: "Draft" | "Ready" | "Generating";
  createdAt: string;
  createdBy: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: "Draft" | "Active" | "Paused" | "Completed";
  audienceSize: number;
  expectedRevenueSaved: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "Risk Alert" | "Prediction Completed" | "Report Generated" | "Model Update" | "Campaign Alert";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  href?: string;
}

export interface Settings {
  id: string;
  workspaceId: string;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  riskAlertThreshold: number;
  timezone: string;
}

export interface SearchResult {
  id: string;
  category: "Customers" | "Predictions" | "Reports" | "Pages" | "Users" | "Campaigns" | "Settings" | "Integrations" | "Security" | "Models" | "MLOps";
  title: string;
  description: string;
  href: string;
}
