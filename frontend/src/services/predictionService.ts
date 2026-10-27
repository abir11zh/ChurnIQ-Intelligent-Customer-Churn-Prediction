import { mockPredictions } from "../data/foundation";
import type { Prediction } from "../types/domain";
import { apiClient } from "./apiClient";

function normalizePrediction(prediction: any): Prediction {
  const probability = Number(prediction.probability ?? prediction.churn_probability ?? 0);

  return {
    id: prediction.id ?? prediction.prediction_id,
    customerId: prediction.customerId ?? prediction.customer_id ?? "manual",
    modelName: prediction.modelName ?? prediction.model_name ?? "Logistic Regression",
    probability,
    prediction: prediction.prediction ?? prediction.will_churn ?? probability >= 0.5,
    confidence: Number(prediction.confidence ?? 0),
    createdAt: prediction.createdAt ?? prediction.created_at ?? prediction.scored_at
  };
}

export async function listPredictions(): Promise<Prediction[]> {
  try {
    const { data } = await apiClient.get("/predictions/history");
    return data.data.predictions.map(normalizePrediction);
  } catch {
    return mockPredictions;
  }
}

export async function scoreCustomer(payload: unknown) {
  const { data } = await apiClient.post("/predict/single", payload);
  return data.data;
}

export async function scoreBatch(customers: unknown[], jobName = "Batch Logistic Regression Scoring") {
  const { data } = await apiClient.post("/predict/batch", { job_name: jobName, customers });
  return data.data;
}

export async function explainPrediction(payload: unknown) {
  const { data } = await apiClient.post("/shap/explain", payload);
  return data.data;
}
