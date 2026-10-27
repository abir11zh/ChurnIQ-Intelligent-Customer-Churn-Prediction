export type MlopsTone = "primary" | "success" | "warning" | "danger" | "neutral";

export type MlopsMetric = {
  label: string;
  value: string;
  detail: string;
  tone: MlopsTone;
};

export const productionModel = {
  name: "Logistic Regression",
  version: "benchmark-none",
  status: "Online",
  deploymentDate: "June 12, 2026",
  predictionsServed: "1,253,420",
  averageConfidence: "84.7% ROC-AUC",
  health: "Governed",
  modelSource: "Production registry",
  servingLatency: "48 ms",
  technicalChampion: "Logistic Regression",
  businessChampion: "Logistic Regression + PowerTransformer",
  governanceNote: "Logistic Regression leads ROC-AUC narrowly; Logistic Regression leads recall for churn operations."
};

export const mlopsKpis: MlopsMetric[] = [
  { label: "Current Accuracy", value: "80.1%", detail: "Logistic Regression scoring artifact", tone: "primary" },
  { label: "Precision", value: "67.2%", detail: "Logistic Regression favors cleaner positive alerts", tone: "success" },
  { label: "Recall", value: "48.7%", detail: "Business risk: many churners can be missed", tone: "danger" },
  { label: "F1 Score", value: "56.4%", detail: "Needs threshold and cost review", tone: "warning" },
  { label: "ROC-AUC", value: "84.7%", detail: "Narrow technical lead", tone: "success" },
  { label: "Predictions Today", value: "7,043", detail: "1,253 active predictions", tone: "primary" },
  { label: "Predictions This Month", value: "184K", detail: "+12% usage growth", tone: "warning" },
  { label: "Average Confidence", value: "84.7%", detail: "Interpreted as ROC-AUC benchmark", tone: "primary" },
  { label: "Active Customers", value: "7,043", detail: "Current scoring population", tone: "primary" }
];

export const aiHealthScores = [
  { label: "Overall AI Score", value: 84, status: "Governed", tone: "primary" as MlopsTone },
  { label: "Model Health", value: 85, status: "Recall review", tone: "warning" as MlopsTone },
  { label: "Data Health", value: 96, status: "Excellent", tone: "success" as MlopsTone },
  { label: "Prediction Health", value: 79, status: "Threshold review", tone: "warning" as MlopsTone },
  { label: "System Health", value: 99, status: "Operational", tone: "success" as MlopsTone }
];

export const modelVersions = [
  { name: "Logistic Regression", version: "PowerTransformer", createdDate: "June 12, 2026", status: "Business Champion", performance: "Recall 79.7%", deploymentStatus: "Candidate", accuracy: 74.4, recall: 79.7, precision: 51.2, f1: 62.3, rocAuc: 84.7, trainingDate: "June 12, 2026" },
  { name: "Logistic Regression", version: "none", createdDate: "June 12, 2026", status: "Technical Champion", performance: "ROC-AUC 84.7%", deploymentStatus: "Deployed", accuracy: 80.1, recall: 48.7, precision: 67.2, f1: 56.4, rocAuc: 84.7, trainingDate: "June 12, 2026" },
  { name: "Stacking", version: "PowerTransformer", createdDate: "June 12, 2026", status: "Rejected", performance: "121.27s train", deploymentStatus: "Rejected", accuracy: 76.1, recall: 76.2, precision: 53.5, f1: 62.8, rocAuc: 84.7, trainingDate: "June 12, 2026" },
  { name: "Random Forest", version: "balanced", createdDate: "June 12, 2026", status: "Comparison", performance: "Stable baseline", deploymentStatus: "Ready", accuracy: 78.4, recall: 57.8, precision: 58.9, f1: 58.3, rocAuc: 83.4, trainingDate: "June 12, 2026" }
];

export const predictionVolumeTrend = [
  { day: "Mon", volume: 6120, confidence: 90.2, highRisk: 420 },
  { day: "Tue", volume: 6840, confidence: 91.1, highRisk: 438 },
  { day: "Wed", volume: 7043, confidence: 84.7, highRisk: 421 },
  { day: "Thu", volume: 7320, confidence: 92.0, highRisk: 456 },
  { day: "Fri", volume: 7580, confidence: 91.4, highRisk: 462 },
  { day: "Sat", volume: 5210, confidence: 90.8, highRisk: 318 },
  { day: "Sun", volume: 4880, confidence: 90.6, highRisk: 301 }
];

export const confidenceHistogram = [
  { bucket: "50-60", count: 42 },
  { bucket: "60-70", count: 86 },
  { bucket: "70-80", count: 224 },
  { bucket: "80-90", count: 498 },
  { bucket: "90-100", count: 403 }
];

export const predictionDistribution = [
  { label: "Retain", value: 73.5, color: "#22C55E" },
  { label: "Churn", value: 26.5, color: "#EF4444" }
];

export const riskDistribution = [
  { risk: "Low", customers: 3850 },
  { risk: "Medium", customers: 1430 },
  { risk: "High", customers: 1218 },
  { risk: "Critical", customers: 545 }
];

export const confidenceBySegment = [
  { segment: "VIP", confidence: 94.3 },
  { segment: "Loyal", confidence: 93.1 },
  { segment: "At Risk", confidence: 90.4 },
  { segment: "New", confidence: 88.6 },
  { segment: "Dormant", confidence: 89.2 }
];

export const featureMonitoring = [
  { feature: "Tenure", mean: "32.4", median: "29", variance: "18.6", training: "33.1", current: "32.4", driftScore: 0.04, status: "Low" },
  { feature: "Monthly Charges", mean: "$74.32", median: "$71.80", variance: "24.2", training: "$68.40", current: "$74.32", driftScore: 0.21, status: "High" },
  { feature: "Contract Type", mean: "Month-to-month 52%", median: "-", variance: "0.18", training: "45%", current: "52%", driftScore: 0.18, status: "Medium" },
  { feature: "Internet Service", mean: "Fiber 44%", median: "-", variance: "0.14", training: "39%", current: "44%", driftScore: 0.15, status: "Medium" },
  { feature: "Payment Method", mean: "Electronic check 33%", median: "-", variance: "0.12", training: "31%", current: "33%", driftScore: 0.08, status: "Low" },
  { feature: "Support Services", mean: "No support 41%", median: "-", variance: "0.16", training: "40%", current: "41%", driftScore: 0.05, status: "Low" }
];

export const featureDriftRanking = [
  { feature: "Monthly Charges", driftScore: 0.21, severity: "High", training: "$68.40", current: "$74.32", impact: "Revenue-sensitive feature shifted upward." },
  { feature: "Contract Type", driftScore: 0.18, severity: "Medium", training: "45% monthly", current: "52% monthly", impact: "Flexible contract mix increased." },
  { feature: "Internet Service", driftScore: 0.15, severity: "Medium", training: "39% fiber", current: "44% fiber", impact: "Fiber customer distribution changed." },
  { feature: "Payment Method", driftScore: 0.08, severity: "Low", training: "31% electronic", current: "33% electronic", impact: "Payment mix remains acceptable." },
  { feature: "Tenure", driftScore: 0.04, severity: "Low", training: "33.1 months", current: "32.4 months", impact: "Tenure distribution is stable." }
];

export const driftAlerts = [
  { title: "Monthly Charges Drift Detected", severity: "High", detail: "Current average monthly charge is 8.6% above training baseline.", time: "18 minutes ago" },
  { title: "Contract Type Drift Detected", severity: "Medium", detail: "Month-to-month contracts increased from 45% to 52%.", time: "1 hour ago" },
  { title: "Internet Service Distribution Changed", severity: "Medium", detail: "Fiber optic share increased by 5 percentage points.", time: "3 hours ago" }
];

export const dataQualityOverview = [
  { label: "Missing Values", value: "0.8%", detail: "42 records require review", tone: "success" as MlopsTone },
  { label: "Duplicates", value: "0", detail: "No duplicate customer IDs", tone: "success" as MlopsTone },
  { label: "Invalid Records", value: "12", detail: "Payment method or charge anomalies", tone: "warning" as MlopsTone },
  { label: "Outliers", value: "44", detail: "High-charge customers flagged", tone: "warning" as MlopsTone },
  { label: "Completeness", value: "96%", detail: "Excellent prediction readiness", tone: "success" as MlopsTone }
];

export const qualityChecks = [
  { check: "Column Health", score: 98, status: "Excellent", detail: "All required model features are present." },
  { check: "Feature Health", score: 96, status: "Excellent", detail: "Categorical and numeric ranges are valid." },
  { check: "Data Consistency", score: 94, status: "Good", detail: "Minor billing consistency warnings detected." },
  { check: "Prediction Readiness", score: 97, status: "Excellent", detail: "Dataset is ready for Logistic Regression scoring." }
];

export const datasetStats = [
  { label: "Rows", value: "7,043" },
  { label: "Columns", value: "21" },
  { label: "Missing Values", value: "42" },
  { label: "Numeric Features", value: "4" },
  { label: "Categorical Features", value: "17" },
  { label: "Target Balance", value: "26.5% churn" }
];

export const datasetDistributions = [
  { feature: "Tenure", p25: 12, median: 29, p75: 52, outliers: 8 },
  { feature: "Monthly Charges", p25: 48, median: 72, p75: 91, outliers: 44 },
  { feature: "Total Charges", p25: 820, median: 2420, p75: 4980, outliers: 31 },
  { feature: "Churn Probability", p25: 18, median: 42, p75: 73, outliers: 12 }
];

export const correlationMatrix = [
  { pair: "Tenure / Churn", value: -0.62 },
  { pair: "Monthly Charges / Churn", value: 0.48 },
  { pair: "Contract / Churn", value: 0.58 },
  { pair: "Support / Churn", value: -0.36 },
  { pair: "Internet / Charges", value: 0.42 },
  { pair: "Total Charges / Tenure", value: 0.81 }
];

export const retrainingSummary = {
  lastTrainingDate: "June 1, 2026",
  trainingDataset: "telco_churn_curated_2026_06",
  trainingDuration: "14 min 32 sec",
  status: "Ready",
  nextScheduledRun: "July 1, 2026 02:00",
  trigger: "Monthly schedule or critical drift alert"
};

export const retrainingHistory = [
  { run: "benchmark_2026_06_12", status: "Completed", dataset: "telco_churn_curated_2026_06", duration: "02m 04s", accuracy: "Logistic Regression AUC 84.7%", date: "June 12, 2026" },
  { run: "recall_review_2026_06_12", status: "Completed", dataset: "telco_churn_curated_2026_06", duration: "00m 22s", accuracy: "LR Recall 79.7%", date: "June 12, 2026" },
  { run: "stacking_cost_2026_06_12", status: "Rejected", dataset: "telco_churn_curated_2026_06", duration: "02m 01s", accuracy: "No AUC gain", date: "June 12, 2026" },
  { run: "train_2026_03_30", status: "Failed", dataset: "telco_churn_raw_2026_03", duration: "03m 11s", accuracy: "-", date: "March 30, 2026" }
];

export const alertCenter = [
  { type: "Drift Alert", title: "Monthly Charges Drift", severity: "High", owner: "ML Engineering", action: "Review drift report" },
  { type: "Data Alert", title: "12 invalid billing records", severity: "Medium", owner: "Data Operations", action: "Clean records" },
  { type: "Prediction Alert", title: "Critical risk volume increased", severity: "Medium", owner: "Retention Ops", action: "Review high-risk cohort" },
  { type: "Performance Alert", title: "Logistic Regression recall is below recall-first target", severity: "High", owner: "Data Science", action: "Review Logistic Regression candidate" }
];

export const explainabilityHealth = [
  { label: "SHAP Status", value: "Online", detail: "Local and global explanations available." },
  { label: "Explanation Coverage", value: "99.2%", detail: "Predictions with generated explanation." },
  { label: "Explanation Success Rate", value: "98.7%", detail: "No major explainability failures." }
];

export const executiveAiReadout = [
  "Logistic Regression production scoring is online, but model governance flags a recall tradeoff.",
  "Logistic Regression is the business champion because it detects substantially more churners.",
  "Monthly Charges drift should be reviewed because it may affect revenue-sensitive decisions.",
  "Data quality is excellent and the dataset is ready for continued scoring and threshold review."
];

export const dataScientistReadout = [
  "Feature drift is concentrated in Monthly Charges, Contract Type and Internet Service.",
  "Logistic Regression leads ROC-AUC by a negligible margin, while Logistic Regression strongly improves recall.",
  "Stacking is rejected because its training cost is much higher without meaningful ROC-AUC gain.",
  "Dataset checks show low missingness, no duplicates and strong prediction readiness."
];

export const mlopsExports = ["Model Report", "Drift Report", "Data Quality Report", "Training Report", "Monitoring Report"];
