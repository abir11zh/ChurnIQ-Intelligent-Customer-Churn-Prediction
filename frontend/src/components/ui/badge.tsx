import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

const tones = {
  neutral: "bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10",
  success: "bg-green-50 text-green-600 ring-green-100 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20",
  warning: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  danger: "bg-red-50 text-red-600 ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
  primary: "bg-[#f2efff] text-primary ring-primary/10 dark:bg-primary/15 dark:text-white dark:ring-primary/25"
};

export function Badge({
  tone = "neutral",
  className,
  children
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ring-1", tones[tone], className)}>{children}</span>;
}
