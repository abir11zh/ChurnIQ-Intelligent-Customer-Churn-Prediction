import { apiClient } from "./apiClient";

export async function getWorkspaceStats() {
  try {
    const { data } = await apiClient.get("/analytics/dashboard");
    return data.data;
  } catch {
    const { data } = await apiClient.get("/dashboard-summary");
    return data;
  }
}

export async function getModelGovernance() {
  try {
    const { data } = await apiClient.get("/analytics/model-performance");
    return data.data;
  } catch {
    const { data } = await apiClient.get("/model-performance");
    return data;
  }
}

export async function getDistributions() {
  const { data } = await apiClient.get("/analytics/distributions");
  return data.data;
}

export async function askCopilot(message: string) {
  const { data } = await apiClient.post("/copilot/ask", { message });
  return data.data;
}
