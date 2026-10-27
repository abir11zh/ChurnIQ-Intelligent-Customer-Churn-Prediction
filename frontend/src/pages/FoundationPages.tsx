import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowLeft, CreditCard, History, Lock, SearchX } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { EmptyState, ErrorState } from "../components/common/States";
import { mockPredictions } from "../data/foundation";

function FoundationPage({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-normal text-ink dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export function PredictionHistoryPage() {
  return (
    <FoundationPage title="Prediction History" subtitle="Audit-friendly history prepared for production prediction workflows.">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Predictions</CardTitle>
            <CardDescription>Mock-compatible structure ready for backend persistence.</CardDescription>
          </div>
          <Badge tone="primary">{mockPredictions.length} records</Badge>
        </CardHeader>
        {mockPredictions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-muted">
                <tr>{["Customer", "Model", "Probability", "Prediction", "Confidence", "Created"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
              </thead>
              <tbody>
                {mockPredictions.map((prediction) => (
                  <tr key={prediction.id} className="border-t border-slate-100 dark:border-white/10">
                    <td className="px-4 py-4 font-extrabold">{prediction.customerId}</td>
                    <td className="px-4 py-4">{prediction.modelName}</td>
                    <td className="px-4 py-4">{Math.round(prediction.probability * 100)}%</td>
                    <td className="px-4 py-4"><Badge tone={prediction.prediction === "Churn" ? "danger" : "success"}>{prediction.prediction}</Badge></td>
                    <td className="px-4 py-4">{Math.round(prediction.confidence * 100)}%</td>
                    <td className="px-4 py-4 text-muted">{new Date(prediction.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={History} title="No predictions yet" description="Single and batch predictions will appear here once scoring starts." actionLabel="New Prediction" />
        )}
      </Card>
    </FoundationPage>
  );
}

export function BillingPage() {
  return (
    <FoundationPage title="Billing" subtitle="Workspace billing shell prepared for SaaS account management.">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Enterprise Workspace</CardTitle>
            <CardDescription>Billing UI foundation for future subscription and invoice data.</CardDescription>
          </div>
          <Badge tone="success">Active</Badge>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Plan", "Enterprise"],
            ["Seats", "12 active"],
            ["Renewal", "July 10, 2026"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-xs font-bold uppercase text-muted">{label}</p>
              <p className="mt-2 text-xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>
        <Button className="mt-6" variant="outline"><CreditCard className="h-4 w-4" /> Manage billing</Button>
      </Card>
    </FoundationPage>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-white p-6">
      <div className="w-full max-w-xl">
        <ErrorState
          title="Unauthorized workspace session"
          description="Please sign in to access protected customer intelligence."
          actionLabel="Back to login"
          onRetry={() => window.location.assign("/auth/login")}
        />
      </div>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fbfbff] p-6">
      <Card className="w-full max-w-xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-danger">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">Permission denied</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Your current role does not include access to this workspace area.</p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to Dashboard</Link></Button>
      </Card>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-white p-6">
      <Card className="w-full max-w-xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#f2efff] text-primary">
          <SearchX className="h-7 w-7" />
        </div>
        <Badge className="mt-6" tone="primary">404</Badge>
        <h1 className="mt-4 text-3xl font-extrabold">This page drifted away.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">The route you opened is not available in this ChurnIQ AI workspace.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
          <Button asChild variant="outline"><Link to="/support"><ArrowLeft className="h-4 w-4" /> Contact support</Link></Button>
        </div>
      </Card>
    </div>
  );
}

export function PermissionDeniedInline() {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Permission denied"
      description="Your current role can view this workspace, but cannot perform this action."
    />
  );
}
