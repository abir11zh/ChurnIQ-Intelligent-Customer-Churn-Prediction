export type EcosystemTone = "primary" | "success" | "warning" | "danger" | "neutral";

export type IntegrationStatus = "Connected" | "Available" | "Needs Attention" | "Beta";

export type IntegrationApp = {
  name: string;
  category: string;
  status: IntegrationStatus;
  health: string;
  syncHealth: number;
  recordsSynced: string;
  lastSync: string;
  latency: string;
  description: string;
  tone: EcosystemTone;
  certified?: boolean;
  popular?: boolean;
};

export type EcosystemMetric = {
  label: string;
  value: string;
  detail: string;
  tone: EcosystemTone;
};

export const ecosystemKpis: EcosystemMetric[] = [
  { label: "Connected Apps", value: "12", detail: "Across CRM, data, comms and BI", tone: "success" },
  { label: "Available Integrations", value: "28", detail: "Ready for enterprise rollout", tone: "primary" },
  { label: "Sync Health", value: "98.7%", detail: "Last 24 hours", tone: "success" },
  { label: "Recent Syncs", value: "312", detail: "+18% this week", tone: "primary" },
  { label: "Active Automations", value: "24", detail: "Risk alerts and campaigns", tone: "warning" },
  { label: "API Requests", value: "184K", detail: "Average 142 ms response", tone: "primary" }
];

export const connectedApps: IntegrationApp[] = [
  { name: "Salesforce", category: "CRM", status: "Connected", health: "Operational", syncHealth: 99, recordsSynced: "7,043", lastSync: "12 minutes ago", latency: "118 ms", description: "Two-way customer, account and churn-risk sync.", tone: "success", certified: true, popular: true },
  { name: "Slack", category: "Communication", status: "Connected", health: "Operational", syncHealth: 98, recordsSynced: "126 alerts", lastSync: "4 minutes ago", latency: "86 ms", description: "Real-time high-risk alerts and executive digests.", tone: "success", certified: true, popular: true },
  { name: "Google Sheets", category: "Productivity", status: "Connected", health: "Operational", syncHealth: 97, recordsSynced: "1,000 rows", lastSync: "1 hour ago", latency: "164 ms", description: "Batch imports and team-owned churn workbooks.", tone: "success", certified: true },
  { name: "Outlook", category: "Communication", status: "Connected", health: "Operational", syncHealth: 96, recordsSynced: "18 reports", lastSync: "28 minutes ago", latency: "139 ms", description: "Scheduled executive reports and retention emails.", tone: "success", certified: true },
  { name: "Power BI", category: "Business Intelligence", status: "Connected", health: "Operational", syncHealth: 95, recordsSynced: "42 datasets", lastSync: "46 minutes ago", latency: "221 ms", description: "Executive datasets, revenue risk and churn cohorts.", tone: "success", popular: true },
  { name: "Snowflake", category: "Data Warehouse", status: "Needs Attention", health: "Schema drift", syncHealth: 84, recordsSynced: "2.4M rows", lastSync: "2 hours ago", latency: "348 ms", description: "Warehouse ingestion for scoring and analytics.", tone: "warning", certified: true }
];

export const marketplaceApps: IntegrationApp[] = [
  ...connectedApps,
  { name: "HubSpot", category: "CRM", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Sync contacts, companies, deals and retention campaigns.", tone: "primary", popular: true },
  { name: "Zoho CRM", category: "CRM", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Bring churn scoring into Zoho accounts and contacts.", tone: "primary" },
  { name: "Microsoft Dynamics", category: "CRM", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Enterprise CRM pipeline and customer health sync.", tone: "primary", certified: true },
  { name: "Microsoft Teams", category: "Communication", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Route high-risk alerts to account teams.", tone: "primary", certified: true },
  { name: "Gmail", category: "Communication", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Send churn warnings, digests and campaign follow-ups.", tone: "primary" },
  { name: "WhatsApp Business", category: "Communication", status: "Beta", health: "Beta", syncHealth: 0, recordsSynced: "-", lastSync: "Invite only", latency: "-", description: "Customer-facing retention messages for approved templates.", tone: "warning", popular: true },
  { name: "Excel", category: "Productivity", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Import XLSX files and export prediction reports.", tone: "primary" },
  { name: "Zapier", category: "Automation", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "No-code automation between CHURNIQ AI and 5,000+ apps.", tone: "primary", popular: true },
  { name: "Notion", category: "Productivity", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Publish churn playbooks, reports and workspace notes.", tone: "primary" },
  { name: "Tableau", category: "Business Intelligence", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Connect BI dashboards to churn and revenue datasets.", tone: "primary", certified: true },
  { name: "BigQuery", category: "Data Warehouse", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Analyze telecom data at warehouse scale.", tone: "primary", certified: true },
  { name: "AWS", category: "Cloud Platform", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Connect S3, Lambda and enterprise cloud workloads.", tone: "primary", certified: true },
  { name: "Azure", category: "Cloud Platform", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Connect Azure Blob, AD and cloud analytics.", tone: "primary", certified: true },
  { name: "Google Cloud", category: "Cloud Platform", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Connect Cloud Storage and BigQuery pipelines.", tone: "primary", certified: true },
  { name: "PostgreSQL", category: "Database", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Direct SQL sync for customer and prediction data.", tone: "primary" },
  { name: "MySQL", category: "Database", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Import churn datasets from operational databases.", tone: "primary" },
  { name: "MongoDB", category: "Database", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Connect document-based customer and event data.", tone: "primary" },
  { name: "S3", category: "Storage", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Import files, exports and batch prediction datasets.", tone: "primary" },
  { name: "Azure Blob", category: "Storage", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Enterprise file ingestion from Azure storage.", tone: "primary" },
  { name: "Google Cloud Storage", category: "Storage", status: "Available", health: "Ready", syncHealth: 0, recordsSynced: "-", lastSync: "Not connected", latency: "-", description: "Import files from GCP buckets into prediction workflows.", tone: "primary" }
];

export const crmIntegrations = marketplaceApps.filter((app) => app.category === "CRM");
export const communicationIntegrations = marketplaceApps.filter((app) => app.category === "Communication");
export const dataPlatformIntegrations = marketplaceApps.filter((app) => ["Data Warehouse", "Database", "Storage", "Cloud Platform"].includes(app.category));

export const customerSyncStats: EcosystemMetric[] = [
  { label: "Imported Customers", value: "7,043", detail: "Synced from CRM records", tone: "success" },
  { label: "Updated Customers", value: "1,286", detail: "Changed in last 24 hours", tone: "primary" },
  { label: "New Customers", value: "248", detail: "New accounts detected", tone: "primary" },
  { label: "Failed Imports", value: "12", detail: "Needs field mapping review", tone: "warning" }
];

export const syncHealthTrend = [
  { day: "Mon", success: 96, failures: 4, latency: 142 },
  { day: "Tue", success: 98, failures: 2, latency: 138 },
  { day: "Wed", success: 97, failures: 3, latency: 151 },
  { day: "Thu", success: 99, failures: 1, latency: 132 },
  { day: "Fri", success: 98, failures: 2, latency: 145 },
  { day: "Sat", success: 99, failures: 1, latency: 124 },
  { day: "Sun", success: 98.7, failures: 1.3, latency: 142 }
];

export const recentSyncs = [
  { service: "Salesforce", type: "Customer sync", status: "Success", records: "7,043", time: "12 minutes ago", detail: "Customer health, churn risk and account owner fields updated." },
  { service: "Slack", type: "Alert delivery", status: "Success", records: "32 alerts", time: "18 minutes ago", detail: "High-risk customer alerts delivered to #retention-war-room." },
  { service: "Snowflake", type: "Warehouse load", status: "Warning", records: "2.4M rows", time: "2 hours ago", detail: "Schema drift detected in monthly_charges field." },
  { service: "Outlook", type: "Report delivery", status: "Success", records: "18 reports", time: "28 minutes ago", detail: "Weekly executive report sent to leadership group." },
  { service: "Google Sheets", type: "Batch import", status: "Success", records: "1,000 rows", time: "1 hour ago", detail: "Retention campaign cohort imported from shared sheet." }
];

export const alertAutomations = [
  { action: "Send Slack Alert", trigger: "Customer risk crosses 80%", target: "#retention-war-room", usage: "126 alerts", tone: "success" as EcosystemTone },
  { action: "Send Email Alert", trigger: "VIP customer becomes critical", target: "Account manager", usage: "42 emails", tone: "primary" as EcosystemTone },
  { action: "Send Weekly Report", trigger: "Monday 08:00", target: "Executive team", usage: "18 reports", tone: "primary" as EcosystemTone },
  { action: "Send Churn Warning", trigger: "Prediction completed", target: "CRM owner", usage: "284 warnings", tone: "warning" as EcosystemTone }
];

export const dataPipelineMetrics: EcosystemMetric[] = [
  { label: "Data Sources", value: "9", detail: "Warehouse, CRM and file storage", tone: "primary" },
  { label: "Records Imported", value: "2.4M", detail: "Last 30 days", tone: "success" },
  { label: "Pipeline Status", value: "Healthy", detail: "1 schema warning", tone: "warning" },
  { label: "Data Quality", value: "96%", detail: "Prediction-ready records", tone: "success" },
  { label: "Sync Frequency", value: "15 min", detail: "Near real-time pipelines", tone: "primary" }
];

export const dataPipelineTrend = [
  { source: "CRM", records: 7043, quality: 98 },
  { source: "Sheets", records: 1000, quality: 94 },
  { source: "Snowflake", records: 24000, quality: 96 },
  { source: "S3", records: 8200, quality: 95 },
  { source: "BigQuery", records: 18400, quality: 97 }
];

export const webhookEvents = ["Customer Created", "Prediction Completed", "Customer High Risk", "Campaign Created", "Report Generated", "Model Updated", "Drift Detected"];

export const webhooks = [
  { url: "https://hooks.company.com/churniq/risk", status: "Active", events: "Customer High Risk, Prediction Completed", lastTrigger: "8 minutes ago", failures: 0, health: "Healthy" },
  { url: "https://crm.company.com/events/churniq", status: "Active", events: "Customer Created, Campaign Created", lastTrigger: "32 minutes ago", failures: 1, health: "Review" },
  { url: "https://data.company.com/mlops/drift", status: "Paused", events: "Model Updated, Drift Detected", lastTrigger: "Yesterday", failures: 3, health: "Paused" }
];

export const apiMetrics: EcosystemMetric[] = [
  { label: "API Requests", value: "184K", detail: "This month", tone: "primary" },
  { label: "Response Time", value: "142 ms", detail: "p95 across endpoints", tone: "success" },
  { label: "Success Rate", value: "99.4%", detail: "Last 24 hours", tone: "success" },
  { label: "Errors", value: "0.6%", detail: "Mostly validation errors", tone: "warning" },
  { label: "Rate Limits", value: "82%", detail: "Enterprise quota used", tone: "warning" }
];

export const apiEndpoints = [
  { method: "POST", path: "/api/predict", description: "Run CatBoost churn prediction for one customer.", usage: "42K calls" },
  { method: "GET", path: "/api/customers", description: "List customers with risk, segment and health score.", usage: "68K calls" },
  { method: "GET", path: "/api/reports", description: "Access executive, revenue and retention reports.", usage: "18K calls" },
  { method: "GET", path: "/api/analytics/summary", description: "Read BI metrics, revenue risk and segmentation.", usage: "56K calls" }
];

export const codeSamples = [
  { language: "JavaScript", code: "await churniq.predictions.create({ customerId: 'CUST_03442' });" },
  { language: "Python", code: "client.predictions.create(customer_id='CUST_03442')" },
  { language: "cURL", code: "curl -X POST https://api.churniq.ai/api/predict -H 'Authorization: Bearer <token>'" }
];

export const workflowExamples = [
  { name: "High Risk Customer", trigger: "If customer risk > 80%", condition: "Segment is VIP or High Value", action: "Create Retention Campaign", impact: "$31.5K potential saved", tone: "danger" as EcosystemTone },
  { name: "Prediction Complete", trigger: "When CatBoost prediction finishes", condition: "Confidence > 90%", action: "Send Email to Account Owner", impact: "284 automated warnings", tone: "primary" as EcosystemTone },
  { name: "Drift Detected", trigger: "When drift severity is High", condition: "Production feature impact", action: "Notify Data Team", impact: "3 MLOps alerts", tone: "warning" as EcosystemTone },
  { name: "Report Generated", trigger: "Weekly executive report ready", condition: "Monday 08:00", action: "Send to Leadership", impact: "18 recipients", tone: "success" as EcosystemTone }
];

export const automationBlocks = [
  { label: "Trigger", value: "Customer risk > 80%", detail: "Prediction, customer, report, model or sync event" },
  { label: "Condition", value: "VIP and revenue > $500", detail: "Segment, risk, revenue, owner or service state" },
  { label: "Action", value: "Create campaign + send alert", detail: "CRM update, Slack, email, webhook or report" }
];

export const marketplaceCategories = [
  { category: "CRM", apps: 4, description: "Customer records, account owners and retention actions." },
  { category: "Marketing", apps: 5, description: "Campaign audiences, save plays and lifecycle messaging." },
  { category: "Analytics", apps: 4, description: "BI dashboards, warehouse analytics and executive exports." },
  { category: "Communication", apps: 5, description: "Slack, Teams, email and customer messaging." },
  { category: "Storage", apps: 4, description: "Batch files, datasets and governed exports." },
  { category: "AI", apps: 3, description: "Future AI assistants, enrichment and prediction workflows." }
];

export const integrationAnalytics = [
  { label: "Connected Services", value: 12, max: 28, display: "12 / 28" },
  { label: "Most Used Integrations", value: 68, max: 100, display: "Salesforce + Slack" },
  { label: "Sync Success Rate", value: 98.7, max: 100, display: "98.7%" },
  { label: "Automation Usage", value: 74, max: 100, display: "24 active workflows" }
];

export const integrationNotifications = [
  { title: "Snowflake schema drift", detail: "monthly_charges changed numeric precision.", type: "Sync Failure", time: "2 hours ago", tone: "warning" as EcosystemTone },
  { title: "Webhook retry succeeded", detail: "CRM campaign event delivered after one retry.", type: "Webhook", time: "32 minutes ago", tone: "success" as EcosystemTone },
  { title: "API quota warning", detail: "Enterprise workspace used 82% of monthly quota.", type: "API Warning", time: "1 hour ago", tone: "warning" as EcosystemTone },
  { title: "Slack alerts delivered", detail: "32 high-risk alerts delivered successfully.", type: "Connection", time: "18 minutes ago", tone: "success" as EcosystemTone }
];
