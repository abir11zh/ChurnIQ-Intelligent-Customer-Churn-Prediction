import {
  AlertTriangle,
  BarChart3,
  Bell,
  FileText,
  Gauge,
  Megaphone,
  ShieldCheck,
  Users
} from "lucide-react";
import { getRolePermissions } from "../lib/permissions";
import type { Campaign, Customer, Notification, Prediction, Report, SearchResult, User, Workspace } from "../types/domain";

export const mockWorkspace: Workspace = {
  id: "ws_churniq_001",
  name: "ChurnIQ AI Demo Workspace",
  plan: "Enterprise",
  region: "EU-West",
  createdAt: "2026-06-01T09:00:00.000Z"
};

export const mockUsers: User[] = [
  {
    id: "usr_admin_001",
    fullName: "John Doe",
    email: "john@churniq.local",
    avatar: "",
    role: "Admin",
    permissions: getRolePermissions("Admin"),
    workspaceId: mockWorkspace.id,
    createdAt: "2026-06-01T09:00:00.000Z",
    lastLogin: "2026-06-10T08:15:00.000Z"
  },
  {
    id: "usr_analyst_001",
    fullName: "Sarah Wilson",
    email: "sarah@churniq.local",
    avatar: "",
    role: "Analyst",
    permissions: getRolePermissions("Analyst"),
    workspaceId: mockWorkspace.id,
    createdAt: "2026-06-03T11:30:00.000Z",
    lastLogin: "2026-06-09T18:45:00.000Z"
  }
];

export const mockCustomers: Customer[] = [
  {
    id: "db_cus_001",
    customerId: "CUST_03246",
    name: "Sarah Johnson",
    email: "sarah@email.com",
    gender: "Female",
    contract: "Month-to-month",
    tenure: 12,
    monthlyCharges: 70,
    totalCharges: 840,
    churnProbability: 0.82,
    riskLevel: "CRITICAL",
    segment: "At Risk",
    createdAt: "2026-04-18T10:00:00.000Z"
  },
  {
    id: "db_cus_002",
    customerId: "CUST_18467",
    name: "Michael Chen",
    email: "m.chen@email.com",
    gender: "Male",
    contract: "One year",
    tenure: 28,
    monthlyCharges: 89,
    totalCharges: 2492,
    churnProbability: 0.67,
    riskLevel: "HIGH",
    segment: "VIP",
    createdAt: "2026-04-21T10:00:00.000Z"
  },
  {
    id: "db_cus_003",
    customerId: "CUST_02158",
    name: "Emily Davis",
    email: "emily@email.com",
    gender: "Female",
    contract: "Two year",
    tenure: 52,
    monthlyCharges: 61,
    totalCharges: 3172,
    churnProbability: 0.18,
    riskLevel: "LOW",
    segment: "Loyal",
    createdAt: "2026-04-27T10:00:00.000Z"
  }
];

export const mockPredictions: Prediction[] = [
  {
    id: "pred_001",
    customerId: "CUST_03246",
    modelName: "Logistic Regression",
    probability: 0.82,
    prediction: "Churn",
    confidence: 0.92,
    createdAt: "2026-06-10T08:20:00.000Z"
  },
  {
    id: "pred_002",
    customerId: "CUST_18467",
    modelName: "Logistic Regression",
    probability: 0.67,
    prediction: "Churn",
    confidence: 0.86,
    createdAt: "2026-06-10T08:12:00.000Z"
  }
];

export const mockReports: Report[] = [
  { id: "rep_001", name: "Executive Churn Summary", type: "Executive", status: "Ready", createdAt: "2026-06-09T16:15:00.000Z", createdBy: "John Doe" },
  { id: "rep_002", name: "Model Performance Governance", type: "Model Performance", status: "Ready", createdAt: "2026-06-09T14:40:00.000Z", createdBy: "Sarah Wilson" },
  { id: "rep_003", name: "Revenue At Risk Review", type: "Revenue", status: "Generating", createdAt: "2026-06-10T08:05:00.000Z", createdBy: "John Doe" }
];

export const mockCampaigns: Campaign[] = [
  { id: "cmp_001", name: "Critical Risk Save Play", status: "Active", audienceSize: 245, expectedRevenueSaved: 2400000, createdAt: "2026-06-08T12:00:00.000Z" },
  { id: "cmp_002", name: "Tech Support Upgrade", status: "Draft", audienceSize: 118, expectedRevenueSaved: 820000, createdAt: "2026-06-09T09:30:00.000Z" }
];

export const mockNotifications: Notification[] = [
  {
    id: "ntf_001",
    type: "Risk Alert",
    title: "Sarah Johnson moved to critical risk",
    description: "Logistic Regression scored this customer at 82% churn probability.",
    time: "2 minutes ago",
    read: false,
    actionLabel: "View customer",
    href: "/customers/CUST_03246"
  },
  {
    id: "ntf_002",
    type: "Prediction Completed",
    title: "Batch scoring completed",
    description: "1,000 telecom customers were scored successfully.",
    time: "12 minutes ago",
    read: false,
    actionLabel: "Open predictions",
    href: "/predictions/history"
  },
  {
    id: "ntf_003",
    type: "Report Generated",
    title: "Executive report is ready",
    description: "The latest churn and revenue summary can be exported.",
    time: "1 hour ago",
    read: true,
    actionLabel: "Open reports",
    href: "/reports"
  },
  {
    id: "ntf_004",
    type: "Model Update",
    title: "Logistic Regression governance check passed",
    description: "Model governance review separates ROC-AUC leadership from recall-first business value.",
    time: "3 hours ago",
    read: true,
    actionLabel: "Review model",
    href: "/model-performance"
  },
  {
    id: "ntf_005",
    type: "Campaign Alert",
    title: "Retention campaign needs approval",
    description: "245 high-risk customers are ready for a save play.",
    time: "Yesterday",
    read: true,
    actionLabel: "Open campaigns",
    href: "/campaigns"
  }
];

export const notificationIcons = {
  "Risk Alert": AlertTriangle,
  "Prediction Completed": Gauge,
  "Report Generated": FileText,
  "Model Update": ShieldCheck,
  "Campaign Alert": Megaphone
};

export const globalSearchData: SearchResult[] = [
  ...mockCustomers.map((customer) => ({
    id: customer.id,
    category: "Customers" as const,
    title: customer.name,
    description: `${customer.customerId} - ${customer.riskLevel} risk - ${customer.contract}`,
    href: `/customers/${customer.customerId}`
  })),
  ...mockUsers.map((user) => ({
    id: user.id,
    category: "Users" as const,
    title: user.fullName,
    description: `${user.role} - ${user.email}`,
    href: "/team"
  })),
  ...mockPredictions.map((prediction) => ({
    id: prediction.id,
    category: "Predictions" as const,
    title: `${prediction.customerId} Logistic Regression prediction`,
    description: `${Math.round(prediction.probability * 100)}% churn probability`,
    href: "/predictions/history"
  })),
  ...mockReports.map((report) => ({
    id: report.id,
    category: "Reports" as const,
    title: report.name,
    description: `${report.type} report - ${report.status}`,
    href: "/reports"
  })),
  ...mockCampaigns.map((campaign) => ({
    id: campaign.id,
    category: "Campaigns" as const,
    title: campaign.name,
    description: `${campaign.status} - ${campaign.audienceSize} customers - $${campaign.expectedRevenueSaved.toLocaleString()} expected saved`,
    href: "/retention/campaigns"
  })),
  { id: "page_smart_home", category: "Pages", title: "Smart Home", description: "Personalized daily AI briefing, achievements, progress and smart recommendations", href: "/smart-home" },
  { id: "page_dashboard", category: "Pages", title: "Dashboard", description: "Executive AI command center", href: "/dashboard" },
  { id: "page_demo", category: "Pages", title: "Demo Mode", description: "Presentation-safe demo customers, predictions, analytics, reports and insights", href: "/demo" },
  { id: "page_investor_demo", category: "Pages", title: "Investor Demo", description: "Business value, revenue protected, customers saved, ROI and AI advantages", href: "/investor-demo" },
  { id: "page_organization", category: "Settings", title: "Organization", description: "Organization profile, plan, workspace status and governance", href: "/organization" },
  { id: "page_executive", category: "Pages", title: "Executive Analytics", description: "CEO dashboard for revenue, risk, retention and growth", href: "/executive" },
  { id: "page_executive_revenue", category: "Pages", title: "Revenue Intelligence", description: "Revenue trends, contribution, at-risk exposure and recovery", href: "/executive/revenue" },
  { id: "page_executive_churn", category: "Pages", title: "Churn Intelligence", description: "Current churn, forecasted churn, drivers and revenue impact", href: "/executive/churn" },
  { id: "page_executive_cohorts", category: "Pages", title: "Cohort Analysis", description: "Monthly and quarterly retention heatmaps", href: "/executive/cohorts" },
  { id: "page_executive_ltv", category: "Pages", title: "Customer Lifetime Value", description: "CLV by segment, risk and customer value matrix", href: "/executive/customer-ltv" },
  { id: "page_executive_forecasting", category: "Pages", title: "Forecasting Center", description: "Revenue, churn, retention and growth forecasts", href: "/executive/forecasting" },
  { id: "page_executive_journey", category: "Pages", title: "Customer Journey Analytics", description: "Journey flow, drop-off points and retention opportunities", href: "/executive/journey" },
  { id: "page_mlops", category: "MLOps", title: "AI Operations", description: "Production AI monitoring, model governance, data health, drift and retraining", href: "/mlops" },
  { id: "page_mlops_models", category: "Models", title: "Active Model", description: "Current scoring artifact, business champion, deployment and predictions served", href: "/mlops/models" },
  { id: "page_mlops_monitoring", category: "MLOps", title: "Model Monitoring", description: "Prediction volume, confidence, risk distribution and trends", href: "/mlops/monitoring" },
  { id: "page_mlops_drift", category: "MLOps", title: "Data Drift Center", description: "Training data versus current data, drift ranking and alerts", href: "/mlops/drift" },
  { id: "page_mlops_data_quality", category: "MLOps", title: "Data Quality Center", description: "Missing values, duplicates, invalid records, outliers and readiness", href: "/mlops/data-quality" },
  { id: "page_mlops_datasets", category: "MLOps", title: "Dataset Explorer", description: "Rows, columns, distributions, correlations, heatmaps and scatter plots", href: "/mlops/datasets" },
  { id: "page_mlops_retraining", category: "Models", title: "Retraining Center", description: "Training history, scheduled retraining and readiness status", href: "/mlops/retraining" },
  { id: "page_mlops_registry", category: "Models", title: "Model Registry", description: "Model candidates, deployment status, recall and governance", href: "/mlops/registry" },
  { id: "page_customers", category: "Pages", title: "Customers", description: "Customer intelligence workspace", href: "/customers" },
  { id: "page_predictions", category: "Pages", title: "Single Prediction", description: "Manual churn scoring workflow", href: "/predictions/single" },
  { id: "page_prediction_insights", category: "Pages", title: "Prediction Insights", description: "Prediction trends, risk distribution and high-risk groups", href: "/predictions/insights" },
  { id: "page_explainability", category: "Pages", title: "Explainable AI Center", description: "Business explainability for churn decisions", href: "/shap" },
  { id: "page_shap_global", category: "Pages", title: "Global SHAP", description: "Top churn drivers and feature importance", href: "/shap/global" },
  { id: "page_shap_local", category: "Pages", title: "Local SHAP", description: "Single-customer explanation and waterfall view", href: "/shap/local" },
  { id: "page_shap_comparison", category: "Pages", title: "Customer Comparison", description: "Compare customer risk against the population", href: "/shap/comparison" },
  { id: "page_shap_business", category: "Pages", title: "Business Explanations", description: "Revenue impact and recommended retention actions", href: "/shap/business-insights" },
  { id: "page_copilot", category: "Pages", title: "AI Copilot", description: "Ask business questions and generate smart visual answers", href: "/copilot" },
  { id: "page_copilot_history", category: "Pages", title: "Copilot History", description: "Saved AI conversations by day and topic", href: "/copilot/history" },
  { id: "page_copilot_insights", category: "Pages", title: "Copilot Insights", description: "Live AI insight cards and recommended prompts", href: "/copilot/insights" },
  { id: "page_copilot_reports", category: "Pages", title: "Copilot Reports", description: "Generate executive reports from AI conversations", href: "/copilot/reports" },
  { id: "page_retention", category: "Pages", title: "Retention Intelligence", description: "Revenue protection command center and AI retention summary", href: "/retention" },
  { id: "page_retention_simulator", category: "Pages", title: "Retention Simulator", description: "Before and after churn risk, ROI and revenue saved scenarios", href: "/retention/simulator" },
  { id: "page_retention_opportunities", category: "Pages", title: "Retention Opportunities", description: "Prioritized retention actions by expected impact and ROI", href: "/retention/opportunities" },
  { id: "page_retention_campaigns", category: "Pages", title: "Retention Campaigns", description: "Campaign manager for discount, upgrade, support and loyalty plays", href: "/retention/campaigns" },
  { id: "page_retention_playbooks", category: "Pages", title: "Retention Playbooks", description: "Strategy library for high-risk, VIP and revenue-critical customers", href: "/retention/playbooks" },
  { id: "page_reports", category: "Pages", title: "Reports", description: "Executive and operational exports", href: "/reports" },
  { id: "page_team", category: "Users", title: "Team Management", description: "Members, departments, roles, permissions and invitations", href: "/team" },
  { id: "page_activity", category: "Security", title: "Activity Center", description: "All user, model, customer, prediction and report activity", href: "/activity" },
  { id: "page_audit_logs", category: "Security", title: "Audit Logs", description: "Timestamp, user, action, resource, IP and result", href: "/audit-logs" },
  { id: "page_notifications", category: "Settings", title: "Notification Center", description: "Prediction, customer, campaign, report, AI and security alerts", href: "/notifications" },
  { id: "page_workspace_settings", category: "Settings", title: "Workspace Settings", description: "Workspace name, timezone, currency, language and branding", href: "/settings" },
  { id: "page_billing", category: "Settings", title: "Billing", description: "Plan, subscription status, renewal, invoices and usage", href: "/billing" },
  { id: "page_api_keys", category: "Security", title: "API Keys", description: "Generate, revoke, regenerate and copy workspace API keys", href: "/settings/api-keys" },
  { id: "page_integrations", category: "Integrations", title: "Integrations Hub", description: "Connected marketplace for CRM, communication, data, cloud, BI, APIs and automations", href: "/integrations" },
  { id: "page_integrations_crm", category: "Integrations", title: "CRM Integrations", description: "Salesforce, HubSpot, Zoho CRM and Microsoft Dynamics customer sync", href: "/integrations/crm" },
  { id: "page_integrations_communication", category: "Integrations", title: "Communication Integrations", description: "Slack, Teams, Gmail, Outlook and WhatsApp Business alert automation", href: "/integrations/communication" },
  { id: "page_integrations_data", category: "Integrations", title: "Data Platform Integrations", description: "Snowflake, BigQuery, PostgreSQL, MySQL, MongoDB and cloud storage pipelines", href: "/integrations/data" },
  { id: "page_integrations_webhooks", category: "Integrations", title: "Webhook Center", description: "Webhook events for customers, predictions, campaigns, reports, model updates and drift", href: "/integrations/webhooks" },
  { id: "page_integrations_api", category: "Integrations", title: "API Platform", description: "Developer center with API metrics, endpoints, code samples and playground", href: "/integrations/api" },
  { id: "page_integrations_marketplace", category: "Integrations", title: "Integration Marketplace", description: "Certified and popular partner ecosystem integrations", href: "/integrations/marketplace" },
  { id: "page_system_health", category: "Security", title: "System Health", description: "API, database, model, storage and queue status", href: "/system-health" },
  { id: "page_security", category: "Security", title: "Security Center", description: "Sessions, devices, login history and failed logins", href: "/security" },
  { id: "page_help", category: "Pages", title: "Help Center", description: "Documentation, tutorials, FAQs and release notes", href: "/help" },
  { id: "page_support", category: "Pages", title: "Support Center", description: "Live chat, support tickets, knowledge base and contact form", href: "/support" }
];

export const foundationStats = [
  { label: "ROC-AUC Benchmark", value: "84.7%", icon: Gauge },
  { label: "Customers Analyzed", value: "7,043", icon: Users },
  { label: "Protected Revenue", value: "$2.4M", icon: BarChart3 },
  { label: "Real-Time Alerts", value: "24/7", icon: Bell }
];
