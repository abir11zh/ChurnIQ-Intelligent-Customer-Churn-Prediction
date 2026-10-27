import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Loader2, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

export function PageLoader({ label = "Loading workspace..." }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <div className="animate-float mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary to-accent text-white shadow-glass">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="mt-4 text-sm font-extrabold text-ink dark:text-white">{label}</p>
        <div className="mx-auto mt-4 h-2 w-48 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("space-y-4", className)}>
      <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-white/10" />
      <div className="h-9 w-36 animate-pulse rounded-xl bg-slate-100 dark:bg-white/10" />
      <div className="h-3 w-full animate-pulse rounded-full bg-slate-100 dark:bg-white/10" />
      <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-white/10" />
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-white/10" />
      ))}
    </div>
  );
}

export function FormSubmitLoader({ label = "Submitting..." }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </span>
  );
}

export function ChartSkeleton() {
  return (
    <div className="flex h-64 items-end gap-3 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
      {[42, 66, 54, 88, 72, 96, 58].map((height) => (
        <span key={height} className="flex-1 animate-pulse rounded-t-xl bg-[#e8e4ff]" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  onAction
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="grid place-items-center overflow-hidden px-6 py-12 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary to-accent text-white shadow-glass">
        <Icon className="h-6 w-6" />
      </motion.div>
      <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this workspace section. Please try again.",
  actionLabel = "Retry",
  onRetry
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-red-100 bg-gradient-to-br from-red-50/80 to-white px-6 py-8 dark:border-red-900/40 dark:from-red-950/20 dark:to-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-danger shadow-soft dark:bg-slate-900">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-danger">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
          </div>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
