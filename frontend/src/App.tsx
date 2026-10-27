import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import {
  AICopilot,
  Analytics,
  ActivityCenter,
  ApiKeys,
  AuditLogs,
  BatchPrediction,
  Billing,
  Campaigns,
  ContactSupport,
  CopilotHistory,
  CopilotInsights,
  CopilotReports,
  CustomerDetails,
  CustomerList,
  CustomerSegmentation,
  Dashboard,
  DemoMode,
  ExecutiveAnalytics,
  ExecutiveChurn,
  ExecutiveCohorts,
  ExecutiveCustomerLtv,
  ExecutiveForecasting,
  ExecutiveJourney,
  ExecutiveRevenue,
  HelpCenter,
  Insights,
  IntegrationsApi,
  IntegrationsCommunication,
  IntegrationsCrm,
  IntegrationsData,
  IntegrationsHub,
  IntegrationsMarketplace,
  IntegrationsWebhooks,
  InvestorDemo,
  Landing,
  ModelMonitoring,
  ModelPerformance,
  MlopsDashboard,
  MlopsDataQuality,
  MlopsDatasets,
  MlopsDrift,
  MlopsModels,
  MlopsMonitoring,
  MlopsRegistry,
  MlopsRetraining,
  Notifications,
  Organization,
  Prediction,
  PredictionHistory,
  PredictionInsights,
  PredictionResult,
  Profile,
  Reports,
  RetentionCampaigns,
  RetentionCenter,
  RetentionOpportunities,
  RetentionPlaybooks,
  RetentionSimulator,
  SettingsPage,
  SecurityCenter,
  ShapExplanation,
  ShapBusinessInsights,
  ShapComparison,
  ShapGlobal,
  ShapLocal,
  SmartHome,
  SystemHealth,
  TeamManagement
} from "./pages/AppPages";
import { ForbiddenPage, NotFoundPage, UnauthorizedPage } from "./pages/FoundationPages";
import { ForgotPasswordPage, LoginPage, OtpPage, RegisterPage, ResetPasswordPage, SessionExpiredPage, VerifyEmailPage } from "./features/auth/AuthPages";
import { PermissionGuard, ProtectedRoute } from "./lib/auth";

function ProtectedApp() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/otp" element={<OtpPage />} />
      <Route path="/auth/session-expired" element={<SessionExpiredPage />} />

      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
      <Route path="/reset-password" element={<Navigate to="/auth/reset-password" replace />} />

      <Route element={<ProtectedApp />}>
        <Route path="smart-home" element={<PermissionGuard permission="dashboard:read"><SmartHome /></PermissionGuard>} />
        <Route path="dashboard" element={<PermissionGuard permission="dashboard:read"><Dashboard /></PermissionGuard>} />
        <Route path="demo" element={<PermissionGuard permission="dashboard:read"><DemoMode /></PermissionGuard>} />
        <Route path="investor-demo" element={<PermissionGuard permission="dashboard:read"><InvestorDemo /></PermissionGuard>} />
        <Route path="organization" element={<PermissionGuard permission="organization:read"><Organization /></PermissionGuard>} />
        <Route path="customers" element={<PermissionGuard permission="customers:read"><CustomerList /></PermissionGuard>} />
        <Route path="customers/:id" element={<PermissionGuard permission="customers:read"><CustomerDetails /></PermissionGuard>} />
        <Route path="segments" element={<PermissionGuard permission="segments:read"><CustomerSegmentation /></PermissionGuard>} />
        <Route path="predictions/single" element={<PermissionGuard permissions={["predictions:read", "predictions:write"]}><Prediction /></PermissionGuard>} />
        <Route path="predictions/result" element={<PermissionGuard permission="predictions:read"><PredictionResult /></PermissionGuard>} />
        <Route path="predictions/single/result" element={<PermissionGuard permission="predictions:read"><PredictionResult /></PermissionGuard>} />
        <Route path="predictions/batch" element={<PermissionGuard permissions={["predictions:read", "predictions:write"]}><BatchPrediction /></PermissionGuard>} />
        <Route path="predictions/history" element={<PermissionGuard permission="predictions:read"><PredictionHistory /></PermissionGuard>} />
        <Route path="predictions/insights" element={<PermissionGuard permission="predictions:read"><PredictionInsights /></PermissionGuard>} />
        <Route path="analytics" element={<PermissionGuard permission="analytics:read"><Analytics /></PermissionGuard>} />
        <Route path="executive" element={<PermissionGuard permission="analytics:read"><ExecutiveAnalytics /></PermissionGuard>} />
        <Route path="executive/revenue" element={<PermissionGuard permission="analytics:read"><ExecutiveRevenue /></PermissionGuard>} />
        <Route path="executive/churn" element={<PermissionGuard permission="analytics:read"><ExecutiveChurn /></PermissionGuard>} />
        <Route path="executive/cohorts" element={<PermissionGuard permission="analytics:read"><ExecutiveCohorts /></PermissionGuard>} />
        <Route path="executive/customer-ltv" element={<PermissionGuard permission="analytics:read"><ExecutiveCustomerLtv /></PermissionGuard>} />
        <Route path="executive/forecasting" element={<PermissionGuard permission="analytics:read"><ExecutiveForecasting /></PermissionGuard>} />
        <Route path="executive/journey" element={<PermissionGuard permission="analytics:read"><ExecutiveJourney /></PermissionGuard>} />
        <Route path="model-performance" element={<PermissionGuard permission="models:read"><ModelPerformance /></PermissionGuard>} />
        <Route path="model-monitoring" element={<PermissionGuard permission="models:read"><ModelMonitoring /></PermissionGuard>} />
        <Route path="mlops" element={<PermissionGuard permission="mlops:read"><MlopsDashboard /></PermissionGuard>} />
        <Route path="mlops/models" element={<PermissionGuard permission="mlops:read"><MlopsModels /></PermissionGuard>} />
        <Route path="mlops/monitoring" element={<PermissionGuard permission="mlops:read"><MlopsMonitoring /></PermissionGuard>} />
        <Route path="mlops/drift" element={<PermissionGuard permission="mlops:read"><MlopsDrift /></PermissionGuard>} />
        <Route path="mlops/data-quality" element={<PermissionGuard permission="mlops:read"><MlopsDataQuality /></PermissionGuard>} />
        <Route path="mlops/datasets" element={<PermissionGuard permission="mlops:read"><MlopsDatasets /></PermissionGuard>} />
        <Route path="mlops/retraining" element={<PermissionGuard permission="mlops:read"><MlopsRetraining /></PermissionGuard>} />
        <Route path="mlops/registry" element={<PermissionGuard permission="mlops:read"><MlopsRegistry /></PermissionGuard>} />
        <Route path="shap" element={<PermissionGuard permission="shap:read"><ShapExplanation /></PermissionGuard>} />
        <Route path="shap/global" element={<PermissionGuard permission="shap:read"><ShapGlobal /></PermissionGuard>} />
        <Route path="shap/local" element={<PermissionGuard permission="shap:read"><ShapLocal /></PermissionGuard>} />
        <Route path="shap/comparison" element={<PermissionGuard permission="shap:read"><ShapComparison /></PermissionGuard>} />
        <Route path="shap/business-insights" element={<PermissionGuard permission="shap:read"><ShapBusinessInsights /></PermissionGuard>} />
        <Route path="ai-insights" element={<PermissionGuard permission="ai:read"><Insights /></PermissionGuard>} />
        <Route path="copilot" element={<PermissionGuard permission="ai:read"><AICopilot /></PermissionGuard>} />
        <Route path="copilot/history" element={<PermissionGuard permission="ai:read"><CopilotHistory /></PermissionGuard>} />
        <Route path="copilot/insights" element={<PermissionGuard permission="ai:read"><CopilotInsights /></PermissionGuard>} />
        <Route path="copilot/reports" element={<PermissionGuard permission="ai:read"><CopilotReports /></PermissionGuard>} />
        <Route path="ai-copilot" element={<Navigate to="/copilot" replace />} />
        <Route path="retention" element={<PermissionGuard permission="retention:read"><RetentionCenter /></PermissionGuard>} />
        <Route path="retention/simulator" element={<PermissionGuard permission="retention:read"><RetentionSimulator /></PermissionGuard>} />
        <Route path="retention/opportunities" element={<PermissionGuard permission="retention:read"><RetentionOpportunities /></PermissionGuard>} />
        <Route path="retention/campaigns" element={<PermissionGuard permission="retention:read"><RetentionCampaigns /></PermissionGuard>} />
        <Route path="retention/playbooks" element={<PermissionGuard permission="retention:read"><RetentionPlaybooks /></PermissionGuard>} />
        <Route path="campaigns" element={<PermissionGuard permission="campaigns:read"><Campaigns /></PermissionGuard>} />
        <Route path="reports" element={<PermissionGuard permission="reports:read"><Reports /></PermissionGuard>} />
        <Route path="notifications" element={<PermissionGuard permission="notifications:read"><Notifications /></PermissionGuard>} />
        <Route path="team" element={<PermissionGuard permission="team:read"><TeamManagement /></PermissionGuard>} />
        <Route path="activity" element={<PermissionGuard permission="activity:read"><ActivityCenter /></PermissionGuard>} />
        <Route path="audit-logs" element={<PermissionGuard permission="audit:read"><AuditLogs /></PermissionGuard>} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<PermissionGuard permission="settings:read"><SettingsPage /></PermissionGuard>} />
        <Route path="settings/api-keys" element={<PermissionGuard permission="api_keys:read"><ApiKeys /></PermissionGuard>} />
        <Route path="billing" element={<PermissionGuard permission="billing:read"><Billing /></PermissionGuard>} />
        <Route path="integrations" element={<PermissionGuard permission="integrations:read"><IntegrationsHub /></PermissionGuard>} />
        <Route path="integrations/crm" element={<PermissionGuard permission="integrations:read"><IntegrationsCrm /></PermissionGuard>} />
        <Route path="integrations/communication" element={<PermissionGuard permission="integrations:read"><IntegrationsCommunication /></PermissionGuard>} />
        <Route path="integrations/data" element={<PermissionGuard permission="integrations:read"><IntegrationsData /></PermissionGuard>} />
        <Route path="integrations/webhooks" element={<PermissionGuard permission="integrations:read"><IntegrationsWebhooks /></PermissionGuard>} />
        <Route path="integrations/api" element={<PermissionGuard permission="integrations:read"><IntegrationsApi /></PermissionGuard>} />
        <Route path="integrations/marketplace" element={<PermissionGuard permission="integrations:read"><IntegrationsMarketplace /></PermissionGuard>} />
        <Route path="system-health" element={<PermissionGuard permission="system:read"><SystemHealth /></PermissionGuard>} />
        <Route path="security" element={<PermissionGuard permission="security:read"><SecurityCenter /></PermissionGuard>} />
        <Route path="help" element={<HelpCenter />} />
        <Route path="support" element={<ContactSupport />} />

        <Route path="app" element={<Navigate to="/dashboard" replace />} />
        <Route path="app/smart-home" element={<Navigate to="/smart-home" replace />} />
        <Route path="app/demo" element={<Navigate to="/demo" replace />} />
        <Route path="app/investor-demo" element={<Navigate to="/investor-demo" replace />} />
        <Route path="app/organization" element={<Navigate to="/organization" replace />} />
        <Route path="app/customers" element={<Navigate to="/customers" replace />} />
        <Route path="app/customers/:id" element={<Navigate to="/customers" replace />} />
        <Route path="app/segmentation" element={<Navigate to="/segments" replace />} />
        <Route path="app/prediction" element={<Navigate to="/predictions/single" replace />} />
        <Route path="app/prediction/result" element={<Navigate to="/predictions/result" replace />} />
        <Route path="app/batch" element={<Navigate to="/predictions/batch" replace />} />
        <Route path="app/prediction/insights" element={<Navigate to="/predictions/insights" replace />} />
        <Route path="app/analytics" element={<Navigate to="/analytics" replace />} />
        <Route path="app/executive" element={<Navigate to="/executive" replace />} />
        <Route path="app/executive/revenue" element={<Navigate to="/executive/revenue" replace />} />
        <Route path="app/executive/churn" element={<Navigate to="/executive/churn" replace />} />
        <Route path="app/executive/cohorts" element={<Navigate to="/executive/cohorts" replace />} />
        <Route path="app/executive/customer-ltv" element={<Navigate to="/executive/customer-ltv" replace />} />
        <Route path="app/executive/forecasting" element={<Navigate to="/executive/forecasting" replace />} />
        <Route path="app/executive/journey" element={<Navigate to="/executive/journey" replace />} />
        <Route path="app/model-performance" element={<Navigate to="/model-performance" replace />} />
        <Route path="app/model-monitoring" element={<Navigate to="/model-monitoring" replace />} />
        <Route path="app/mlops" element={<Navigate to="/mlops" replace />} />
        <Route path="app/mlops/models" element={<Navigate to="/mlops/models" replace />} />
        <Route path="app/mlops/monitoring" element={<Navigate to="/mlops/monitoring" replace />} />
        <Route path="app/mlops/drift" element={<Navigate to="/mlops/drift" replace />} />
        <Route path="app/mlops/data-quality" element={<Navigate to="/mlops/data-quality" replace />} />
        <Route path="app/mlops/datasets" element={<Navigate to="/mlops/datasets" replace />} />
        <Route path="app/mlops/retraining" element={<Navigate to="/mlops/retraining" replace />} />
        <Route path="app/mlops/registry" element={<Navigate to="/mlops/registry" replace />} />
        <Route path="app/shap" element={<Navigate to="/shap" replace />} />
        <Route path="app/shap/global" element={<Navigate to="/shap/global" replace />} />
        <Route path="app/shap/local" element={<Navigate to="/shap/local" replace />} />
        <Route path="app/shap/comparison" element={<Navigate to="/shap/comparison" replace />} />
        <Route path="app/shap/business-insights" element={<Navigate to="/shap/business-insights" replace />} />
        <Route path="app/insights" element={<Navigate to="/ai-insights" replace />} />
        <Route path="app/copilot" element={<Navigate to="/copilot" replace />} />
        <Route path="app/copilot/history" element={<Navigate to="/copilot/history" replace />} />
        <Route path="app/copilot/insights" element={<Navigate to="/copilot/insights" replace />} />
        <Route path="app/copilot/reports" element={<Navigate to="/copilot/reports" replace />} />
        <Route path="app/retention" element={<Navigate to="/retention" replace />} />
        <Route path="app/retention/simulator" element={<Navigate to="/retention/simulator" replace />} />
        <Route path="app/retention/opportunities" element={<Navigate to="/retention/opportunities" replace />} />
        <Route path="app/retention/campaigns" element={<Navigate to="/retention/campaigns" replace />} />
        <Route path="app/retention/playbooks" element={<Navigate to="/retention/playbooks" replace />} />
        <Route path="app/campaigns" element={<Navigate to="/campaigns" replace />} />
        <Route path="app/reports" element={<Navigate to="/reports" replace />} />
        <Route path="app/notifications" element={<Navigate to="/notifications" replace />} />
        <Route path="app/team" element={<Navigate to="/team" replace />} />
        <Route path="app/activity" element={<Navigate to="/activity" replace />} />
        <Route path="app/audit-logs" element={<Navigate to="/audit-logs" replace />} />
        <Route path="app/profile" element={<Navigate to="/profile" replace />} />
        <Route path="app/settings" element={<Navigate to="/settings" replace />} />
        <Route path="app/settings/api-keys" element={<Navigate to="/settings/api-keys" replace />} />
        <Route path="app/billing" element={<Navigate to="/billing" replace />} />
        <Route path="app/integrations" element={<Navigate to="/integrations" replace />} />
        <Route path="app/integrations/crm" element={<Navigate to="/integrations/crm" replace />} />
        <Route path="app/integrations/communication" element={<Navigate to="/integrations/communication" replace />} />
        <Route path="app/integrations/data" element={<Navigate to="/integrations/data" replace />} />
        <Route path="app/integrations/webhooks" element={<Navigate to="/integrations/webhooks" replace />} />
        <Route path="app/integrations/api" element={<Navigate to="/integrations/api" replace />} />
        <Route path="app/integrations/marketplace" element={<Navigate to="/integrations/marketplace" replace />} />
        <Route path="app/system-health" element={<Navigate to="/system-health" replace />} />
        <Route path="app/security" element={<Navigate to="/security" replace />} />
        <Route path="app/help" element={<Navigate to="/help" replace />} />
        <Route path="app/support" element={<Navigate to="/support" replace />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
