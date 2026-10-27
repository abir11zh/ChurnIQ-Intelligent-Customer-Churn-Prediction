import { mockReports } from "../data/foundation";
import type { Report } from "../types/domain";
import { apiClient } from "./apiClient";

export async function listReports(): Promise<Report[]> {
  try {
    const { data } = await apiClient.get("/reports");
    return data.data.reports.map((report: any) => ({
      id: report.id,
      name: report.name,
      type: report.report_type,
      status: report.status,
      createdAt: report.created_at,
      createdBy: report.created_by
    }));
  } catch {
    return mockReports;
  }
}

export async function listReportArtifacts() {
  const { data } = await apiClient.get("/reports-index");
  return data.reports;
}

export async function generateReport(reportType = "Executive Report") {
  const { data } = await apiClient.post("/reports/generate", { report_type: reportType });
  return data.data;
}

export function reportDownloadUrl(reportId: string) {
  return `${apiClient.defaults.baseURL}/reports/${reportId}/download`;
}
