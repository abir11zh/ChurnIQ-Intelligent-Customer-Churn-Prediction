export type EnterpriseTone = "primary" | "success" | "warning" | "danger" | "neutral";

export type EnterpriseMetric = {
  label: string;
  value: string;
  detail: string;
  tone: EnterpriseTone;
};

export type EnterpriseRole = "Owner" | "Admin" | "Manager" | "Analyst" | "Viewer";

export const organizationProfile = {
  name: "ChurnIQ Telecom Group",
  legalName: "ChurnIQ Telecom Analytics Ltd.",
  industry: "Telecommunications",
  country: "France",
  website: "https://churniq.example",
  logo: "CI",
  plan: "Enterprise",
  status: "Active",
  workspaceId: "ws_churniq_001",
  seats: "18 / 25",
  dataRegion: "EU-West",
  compliance: ["SOC 2 Ready", "GDPR", "SAML Ready", "Audit Logs"],
  renewalDate: "July 10, 2026"
};

export const enterpriseKpis: EnterpriseMetric[] = [
  { label: "Workspace Status", value: "Active", detail: "All services operational", tone: "success" },
  { label: "Team Members", value: "18", detail: "12 active this week", tone: "primary" },
  { label: "Departments", value: "6", detail: "Retention, Analytics, Revenue and Ops", tone: "primary" },
  { label: "Security Score", value: "96%", detail: "MFA and SSO policies enabled", tone: "success" },
  { label: "API Requests", value: "184K", detail: "+12% this month", tone: "warning" },
  { label: "Audit Coverage", value: "100%", detail: "Every sensitive event recorded", tone: "success" }
];

export const organizationSettingsTabs = ["General", "Security", "Users", "Billing", "Integrations", "API Keys", "Notifications"];

export const teamMembers = [
  { name: "John Doe", initials: "JD", email: "john@churniq.local", department: "Executive", role: "Owner" as EnterpriseRole, status: "Active", lastActivity: "4 minutes ago", createdAt: "June 1, 2026" },
  { name: "Sarah Wilson", initials: "SW", email: "sarah@churniq.local", department: "Analytics", role: "Analyst" as EnterpriseRole, status: "Active", lastActivity: "18 minutes ago", createdAt: "June 3, 2026" },
  { name: "Maya Laurent", initials: "ML", email: "maya@churniq.local", department: "Retention", role: "Manager" as EnterpriseRole, status: "Active", lastActivity: "1 hour ago", createdAt: "June 4, 2026" },
  { name: "Omar Haddad", initials: "OH", email: "omar@churniq.local", department: "Revenue", role: "Admin" as EnterpriseRole, status: "Active", lastActivity: "2 hours ago", createdAt: "June 5, 2026" },
  { name: "Emma Davis", initials: "ED", email: "emma@churniq.local", department: "Support", role: "Viewer" as EnterpriseRole, status: "Invited", lastActivity: "Pending", createdAt: "June 9, 2026" },
  { name: "Lina Carter", initials: "LC", email: "lina@churniq.local", department: "Operations", role: "Manager" as EnterpriseRole, status: "Suspended", lastActivity: "9 days ago", createdAt: "May 18, 2026" }
];

export const departments = [
  { name: "Executive", members: 3, owner: "John Doe", activity: "High", budget: "$42K" },
  { name: "Analytics", members: 5, owner: "Sarah Wilson", activity: "High", budget: "$36K" },
  { name: "Retention", members: 4, owner: "Maya Laurent", activity: "High", budget: "$58K" },
  { name: "Revenue", members: 2, owner: "Omar Haddad", activity: "Medium", budget: "$28K" },
  { name: "Support", members: 2, owner: "Emma Davis", activity: "Medium", budget: "$18K" },
  { name: "Operations", members: 2, owner: "Lina Carter", activity: "Low", budget: "$14K" }
];

export const roleSummaries = [
  { role: "Owner" as EnterpriseRole, users: 1, description: "Full workspace ownership, billing, security and governance.", tone: "primary" as EnterpriseTone },
  { role: "Admin" as EnterpriseRole, users: 3, description: "Full operational control except ownership transfer.", tone: "success" as EnterpriseTone },
  { role: "Manager" as EnterpriseRole, users: 6, description: "Customers, campaigns, retention, reports and team visibility.", tone: "primary" as EnterpriseTone },
  { role: "Analyst" as EnterpriseRole, users: 5, description: "Analytics, predictions, SHAP, reports and activity visibility.", tone: "warning" as EnterpriseTone },
  { role: "Viewer" as EnterpriseRole, users: 3, description: "Read-only dashboard, reports and notifications.", tone: "neutral" as EnterpriseTone }
];

export const permissionModules = [
  { module: "Dashboard", permissions: { View: true, Create: false, Edit: false, Delete: false, Export: true, Manage: false } },
  { module: "Customers", permissions: { View: true, Create: true, Edit: true, Delete: true, Export: true, Manage: true } },
  { module: "Predictions", permissions: { View: true, Create: true, Edit: false, Delete: false, Export: true, Manage: true } },
  { module: "SHAP", permissions: { View: true, Create: false, Edit: false, Delete: false, Export: true, Manage: false } },
  { module: "Analytics", permissions: { View: true, Create: false, Edit: false, Delete: false, Export: true, Manage: false } },
  { module: "Copilot", permissions: { View: true, Create: true, Edit: false, Delete: false, Export: true, Manage: false } },
  { module: "Retention", permissions: { View: true, Create: true, Edit: true, Delete: false, Export: true, Manage: true } },
  { module: "Reports", permissions: { View: true, Create: true, Edit: true, Delete: true, Export: true, Manage: true } },
  { module: "Settings", permissions: { View: true, Create: false, Edit: true, Delete: false, Export: false, Manage: true } }
];

export const invitations = [
  { email: "finance.lead@company.com", invitedBy: "John Doe", role: "Viewer", status: "Pending", sentAt: "Today, 09:32" },
  { email: "retention.ops@company.com", invitedBy: "Maya Laurent", role: "Manager", status: "Accepted", sentAt: "Yesterday, 16:18" },
  { email: "external.audit@company.com", invitedBy: "Omar Haddad", role: "Viewer", status: "Expired", sentAt: "May 30, 2026" },
  { email: "old.user@company.com", invitedBy: "Sarah Wilson", role: "Analyst", status: "Rejected", sentAt: "May 28, 2026" }
];

export const platformActivities = [
  { event: "User Login", user: "John Doe", detail: "Signed in from Paris, FR", time: "4 minutes ago", category: "Security", result: "Success" },
  { event: "Prediction Generated", user: "Sarah Wilson", detail: "CatBoost scored 1,000 customers", time: "18 minutes ago", category: "Predictions", result: "Success" },
  { event: "Report Exported", user: "Omar Haddad", detail: "Executive Revenue Report exported as PDF", time: "42 minutes ago", category: "Reports", result: "Success" },
  { event: "Campaign Created", user: "Maya Laurent", detail: "VIP Loyalty Shield campaign created", time: "1 hour ago", category: "Campaigns", result: "Success" },
  { event: "Customer Updated", user: "Emma Davis", detail: "Customer CUST_03246 status marked reviewed", time: "2 hours ago", category: "Customers", result: "Success" },
  { event: "Model Updated", user: "System", detail: "CatBoost governance check completed", time: "3 hours ago", category: "System", result: "Success" }
];

export const auditLogs = [
  { timestamp: "2026-06-11 10:42:12", user: "john@churniq.local", action: "billing.plan.view", resource: "Billing", ip: "192.168.1.24", result: "Allowed" },
  { timestamp: "2026-06-11 10:37:08", user: "sarah@churniq.local", action: "prediction.batch.create", resource: "Predictions", ip: "192.168.1.41", result: "Allowed" },
  { timestamp: "2026-06-11 10:20:49", user: "maya@churniq.local", action: "campaign.create", resource: "Retention Campaign", ip: "192.168.1.52", result: "Allowed" },
  { timestamp: "2026-06-11 09:58:23", user: "external.audit@company.com", action: "settings.security.edit", resource: "Security Policy", ip: "10.42.0.18", result: "Denied" },
  { timestamp: "2026-06-11 09:32:17", user: "system", action: "model.health.check", resource: "CatBoost Scoring Artifact", ip: "internal", result: "Allowed" }
];

export const notificationCategories = [
  { category: "Predictions", count: 18, unread: 4, detail: "Batch jobs, completed scoring and failed uploads", tone: "primary" as EnterpriseTone },
  { category: "Customers", count: 42, unread: 12, detail: "Risk transitions, health score changes and CRM updates", tone: "warning" as EnterpriseTone },
  { category: "Campaigns", count: 9, unread: 2, detail: "Launches, paused campaigns and save-play outcomes", tone: "success" as EnterpriseTone },
  { category: "Reports", count: 7, unread: 1, detail: "Scheduled reports, exports and executive summaries", tone: "primary" as EnterpriseTone },
  { category: "AI Insights", count: 15, unread: 5, detail: "Daily churn signals and Copilot recommendations", tone: "primary" as EnterpriseTone },
  { category: "System", count: 6, unread: 0, detail: "Health checks, sync jobs and infrastructure events", tone: "neutral" as EnterpriseTone },
  { category: "Security", count: 3, unread: 1, detail: "Login alerts, permission changes and audit events", tone: "danger" as EnterpriseTone }
];

export const notificationSettings = [
  { label: "Email Notifications", enabled: true, description: "Send important workspace alerts by email." },
  { label: "In-App Notifications", enabled: true, description: "Show real-time alerts inside CHURNIQ AI." },
  { label: "Weekly Digest", enabled: true, description: "Summarize churn, revenue risk and team activity every Monday." },
  { label: "Monthly Summary", enabled: true, description: "Send an executive business intelligence recap." },
  { label: "Risk Alerts", enabled: true, description: "Notify users when customers cross high-risk thresholds." }
];

export const workspaceSettings = {
  name: "ChurnIQ AI Demo Workspace",
  timezone: "Europe/Paris",
  currency: "USD",
  language: "English",
  logo: "CI",
  primaryColor: "#6D5BFF",
  secondaryColor: "#8B5CF6",
  theme: "Light",
  welcomeMessage: "Protect revenue with customer intelligence."
};

export const currentPlan = {
  name: "Enterprise",
  status: "Active",
  renewalDate: "July 10, 2026",
  price: "$499 / month",
  seats: "18 active seats",
  benefits: ["Unlimited dashboards", "SAML SSO ready", "Audit logs", "API access", "Priority support"]
};

export const subscriptionPlans = [
  { name: "Starter", price: "$49/mo", limit: "2,000 predictions", features: ["Dashboard", "Single predictions", "Basic reports"], recommended: false },
  { name: "Professional", price: "$149/mo", limit: "25,000 predictions", features: ["Batch predictions", "SHAP insights", "Retention campaigns"], recommended: true },
  { name: "Enterprise", price: "Custom", limit: "Unlimited scale", features: ["SSO", "Audit logs", "API keys", "Priority support"], recommended: false }
];

export const usageAnalytics = [
  { label: "Predictions Used", value: 74200, max: 100000, display: "74,200" },
  { label: "Reports Generated", value: 184, max: 250, display: "184" },
  { label: "Customers Managed", value: 7043, max: 10000, display: "7,043" },
  { label: "Storage Used", value: 68, max: 100, display: "68 GB" },
  { label: "API Requests", value: 184000, max: 250000, display: "184K" }
];

export const invoices = [
  { id: "INV-2026-006", date: "June 1, 2026", amount: "$499.00", status: "Paid" },
  { id: "INV-2026-005", date: "May 1, 2026", amount: "$499.00", status: "Paid" },
  { id: "INV-2026-004", date: "April 1, 2026", amount: "$499.00", status: "Paid" }
];

export const apiKeys = [
  { name: "Production API", prefix: "churniq_live_8F3A", created: "June 1, 2026", lastUsed: "8 minutes ago", status: "Active", scope: "Predictions, Reports" },
  { name: "Analytics Warehouse", prefix: "churniq_live_2C91", created: "June 4, 2026", lastUsed: "2 hours ago", status: "Active", scope: "Read-only Analytics" },
  { name: "Legacy Connector", prefix: "churniq_test_91AB", created: "May 18, 2026", lastUsed: "12 days ago", status: "Revoked", scope: "Test Predictions" }
];

export const integrations = [
  { name: "Salesforce", category: "CRM", status: "Connected", lastSync: "12 minutes ago", recordsSynced: "7,043", logs: "24 successful syncs" },
  { name: "HubSpot", category: "CRM", status: "Available", lastSync: "Not connected", recordsSynced: "-", logs: "Ready to connect" },
  { name: "Slack", category: "Notifications", status: "Connected", lastSync: "4 minutes ago", recordsSynced: "32 alerts", logs: "Risk alerts delivered" },
  { name: "Google Sheets", category: "Productivity", status: "Connected", lastSync: "1 hour ago", recordsSynced: "1,000 rows", logs: "Batch import completed" },
  { name: "Microsoft Excel", category: "Productivity", status: "Available", lastSync: "Not connected", recordsSynced: "-", logs: "CSV and XLSX import ready" },
  { name: "Zapier", category: "Automation", status: "Available", lastSync: "Not connected", recordsSynced: "-", logs: "Workflow templates ready" },
  { name: "Gmail", category: "Email", status: "Available", lastSync: "Not connected", recordsSynced: "-", logs: "Email delivery ready" },
  { name: "Outlook", category: "Email", status: "Connected", lastSync: "28 minutes ago", recordsSynced: "18 scheduled reports", logs: "Digest delivery active" }
];

export const scheduledReports = [
  { name: "CEO Revenue Protection Summary", cadence: "Weekly", delivery: "Email + Dashboard", owner: "John Doe", nextRun: "Monday 08:00" },
  { name: "High Risk Customers Export", cadence: "Daily", delivery: "Download + Dashboard", owner: "Maya Laurent", nextRun: "Tomorrow 07:30" },
  { name: "Model Governance Report", cadence: "Monthly", delivery: "Email", owner: "Sarah Wilson", nextRun: "July 1, 2026" },
  { name: "Quarterly Board Pack", cadence: "Quarterly", delivery: "Email + PDF", owner: "Omar Haddad", nextRun: "September 30, 2026" }
];

export const systemHealth = [
  { service: "API Status", value: "Operational", uptime: "99.99%", tone: "success" as EnterpriseTone },
  { service: "Database Status", value: "Operational", uptime: "99.98%", tone: "success" as EnterpriseTone },
  { service: "Model Status", value: "CatBoost Online", uptime: "99.97%", tone: "success" as EnterpriseTone },
  { service: "Storage Status", value: "Healthy", uptime: "68 GB used", tone: "success" as EnterpriseTone },
  { service: "Queue Status", value: "Processing", uptime: "14 jobs pending", tone: "warning" as EnterpriseTone }
];

export const securitySessions = [
  { device: "Chrome on Windows", location: "Paris, France", ip: "192.168.1.24", lastSeen: "Active now", trusted: true },
  { device: "Edge on Windows", location: "Casablanca, Morocco", ip: "192.168.1.42", lastSeen: "2 hours ago", trusted: true },
  { device: "Safari on iPhone", location: "Lyon, France", ip: "10.0.4.18", lastSeen: "Yesterday", trusted: false }
];

export const loginHistory = [
  { user: "John Doe", time: "Today 10:42", location: "Paris, FR", result: "Success" },
  { user: "Sarah Wilson", time: "Today 09:12", location: "Remote", result: "Success" },
  { user: "Unknown", time: "Yesterday 23:18", location: "Unknown", result: "Failed" },
  { user: "Maya Laurent", time: "Yesterday 18:02", location: "Paris, FR", result: "Success" }
];

export const passwordActivity = [
  { label: "Password Policy", value: "Strong", detail: "12 characters, complexity and reuse protection" },
  { label: "MFA Coverage", value: "94%", detail: "17 of 18 users enrolled" },
  { label: "Failed Logins", value: "3", detail: "Last 24 hours" },
  { label: "Session Timeout", value: "30 min", detail: "Idle timeout enabled" }
];

export const helpResources = [
  { title: "Documentation", detail: "Guides for dashboard, predictions, SHAP and retention workflows." },
  { title: "Video Tutorials", detail: "Short walkthroughs for analysts, managers and executives." },
  { title: "FAQs", detail: "Answers about billing, security, imports and CatBoost outputs." },
  { title: "Release Notes", detail: "Latest platform changes and enterprise feature updates." },
  { title: "Support Tickets", detail: "Track open issues, priority and SLA response status." }
];

export const supportTickets = [
  { id: "SUP-1042", subject: "Salesforce sync mapping", priority: "High", status: "Open", owner: "Support Team" },
  { id: "SUP-1037", subject: "Scheduled report formatting", priority: "Medium", status: "In Progress", owner: "Customer Success" },
  { id: "SUP-1028", subject: "Billing contact update", priority: "Low", status: "Resolved", owner: "Billing" }
];

export const commandActions = [
  { label: "Create Prediction", href: "/predictions/single", category: "Action" },
  { label: "Open Customer", href: "/customers", category: "Action" },
  { label: "Generate Report", href: "/reports", category: "Action" },
  { label: "Launch Campaign", href: "/retention/campaigns", category: "Action" },
  { label: "Open Copilot", href: "/copilot", category: "Action" }
];
