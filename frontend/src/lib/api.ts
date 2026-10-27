import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_CHURN_API_URL ?? "http://127.0.0.1:8000",
  timeout: 12000
});

export type PredictionPayload = {
  tenure: number;
  MonthlyCharges: number;
  TotalCharges: number;
  gender: "Male" | "Female";
  SeniorCitizen: "Yes" | "No";
  Partner: "Yes" | "No";
  Dependents: "Yes" | "No";
  PhoneService: "Yes" | "No";
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
};

export type PredictionResultData = {
  churn_probability: number;
  will_churn: boolean;
  risk_level: string;
  recommendation: string;
  confidence: number;
  threshold_used: number;
  model_version: string;
  model_name: string;
  model_source: string;
  scored_at: string;
};

export async function predictCustomer(payload: PredictionPayload) {
  const { data } = await api.post("/predict", payload);
  return data as PredictionResultData;
}

export type DashboardSummary = {
  total_customers: number;
  churn_rate: number;
  monthly_revenue: number;
  avg_tenure: number;
  high_risk_customers: number;
  prediction_accuracy: number;
  retention_score: number;
  threshold: number | null;
  model: string;
  model_version: string;
};

export type ProjectCustomer = {
  customer_id: string;
  name: string;
  email: string;
  contract: string;
  monthly_charges: number;
  tenure: number;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  churn_probability: number;
};

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardSummary>("/dashboard-summary");
  return data;
}

export async function getCustomerSample(limit = 10) {
  const { data } = await api.get<{ customers: ProjectCustomer[] }>("/customers-sample", {
    params: { limit }
  });
  return data.customers;
}

export type ModelLeaderboardRow = {
  model: string;
  scaler?: string;
  label?: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  pr_auc: number;
  cv_mean?: number;
  cv_std?: number;
  training_time?: number;
  inference_time?: number;
  tp?: number;
  fp?: number;
  fn?: number;
  tn?: number;
  business_cost: number;
  overfit_status: string;
  loaded?: boolean;
};

export type AvailableModel = {
  name: string;
  loaded: boolean;
  is_default: boolean;
  roc_auc: number;
  precision: number;
  recall: number;
  f1: number;
};

export type FeatureImpact = {
  feature: string;
  base_auc?: number;
  aug_auc?: number;
  delta_auc?: number;
  recommendation?: string;
};

export type ShapFeature = {
  feature: string;
  importance: number;
};

export type ModelPerformance = {
  best_model: string;
  recommended_model?: string;
  current_scoring_artifact?: string;
  trained_on: string | null;
  optimal_threshold: number;
  leaderboard: ModelLeaderboardRow[];
  best_metrics: Partial<ModelLeaderboardRow>;
  model_selection?: {
    false_negative_cost: number;
    false_positive_cost: number;
    technical_champion: Partial<ModelLeaderboardRow> & Record<string, unknown>;
    business_champion: Partial<ModelLeaderboardRow> & Record<string, unknown>;
    highest_recall_model: Partial<ModelLeaderboardRow> & Record<string, unknown>;
    highest_roc_auc_model: Partial<ModelLeaderboardRow> & Record<string, unknown>;
    best_training_efficiency: Partial<ModelLeaderboardRow> & Record<string, unknown>;
    best_stability: Partial<ModelLeaderboardRow> & Record<string, unknown>;
    current_scoring_artifact: string;
    recommendation: string;
    catboost_vs_logistic: Record<string, unknown>;
    stacking_analysis: Record<string, unknown>;
    class_imbalance_handling: Array<{ model: string; method: string }>;
    methodology: string[];
    presentation_narrative: string[];
  };
  feature_impact: FeatureImpact[];
  shap_features: ShapFeature[];
  model_loaded: boolean;
  model_registry_loaded?: boolean;
  available_models?: AvailableModel[];
  fallback_prediction_enabled: boolean;
};

export type SegmentSummary = {
  name: string;
  customers: number;
  churn_rate: number;
  avg_monthly_charge: number;
  avg_tenure: number;
  revenue: number;
  priority: string;
};

export type SegmentationSummary = {
  segments: SegmentSummary[];
  scatter: {
    customer_id: string;
    segment: string;
    tenure: number;
    monthly_charges: number;
    total_charges: number;
    churned: boolean;
  }[];
  contract_mix: { Contract: string; customers: number }[];
  recommendations: string[];
};

export type ModelMonitoring = {
  status: string;
  model_loaded: boolean;
  model_error: string | null;
  fallback_prediction_enabled: boolean;
  model_version: string;
  trained_on: string | null;
  model_age_days: number | null;
  monitored_at: string;
  prediction_volume: number;
  drift: {
    score: number;
    status: string;
    baseline_churn_rate: number;
    current_churn_rate: number;
  };
  data_quality: {
    rows: number;
    columns: number;
    missing_values: number;
    duplicate_customers: number;
  };
  alerts: string[];
};

export type ReportIndexItem = {
  name: string;
  type: string;
  size_kb: number;
  updated_at: string;
};

export type CopilotResponse = {
  answer: string;
  suggested_actions: string[];
  sources: string[];
  confidence: number;
  generated_at: string;
};

export async function getModelPerformance() {
  const { data } = await api.get<ModelPerformance>("/model-performance");
  return data;
}

export async function getAvailableModels() {
  const { data } = await api.get<{
    default_model: string;
    version: string;
    trained_on: string | null;
    threshold: number;
    models: AvailableModel[];
    registry_loaded: boolean;
    model_error: string | null;
  }>("/models");
  return data;
}

export async function getSegmentationSummary() {
  const { data } = await api.get<SegmentationSummary>("/segmentation-summary");
  return data;
}

export async function getModelMonitoring() {
  const { data } = await api.get<ModelMonitoring>("/model-monitoring");
  return data;
}

export async function getReportsIndex() {
  const { data } = await api.get<{ reports: ReportIndexItem[] }>("/reports-index");
  return data.reports;
}

export async function askCopilot(message: string) {
  const { data } = await api.post<CopilotResponse>("/ai-copilot", { message });
  return data;
}
