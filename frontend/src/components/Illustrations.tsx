import { motion } from "framer-motion";
import { BarChart3, Bot, CheckCircle2, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function RobotIllustration({ small = false }: { small?: boolean }) {
  return (
    <div className={small ? "relative h-32 w-44" : "relative h-72 w-full max-w-md"}>
      <div className="absolute inset-x-8 bottom-2 top-8 rounded-[48px] border border-primary/10 bg-gradient-to-b from-[#f8f7ff] to-white" />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-8 h-28 w-28 -translate-x-1/2 rounded-[32px] border border-white bg-gradient-to-br from-white to-[#d9dcff] shadow-glass"
      >
        <div className="absolute left-1/2 top-7 h-11 w-20 -translate-x-1/2 rounded-2xl bg-[#272057]">
          <span className="absolute left-4 top-4 h-3 w-3 rounded-full bg-[#aab3ff]" />
          <span className="absolute right-4 top-4 h-3 w-3 rounded-full bg-[#aab3ff]" />
        </div>
        <div className="absolute -right-3 top-12 h-8 w-5 rounded-r-2xl bg-primary/70" />
      </motion.div>
      <div className="absolute bottom-9 left-1/2 h-20 w-36 -translate-x-1/2 rounded-[34px] bg-gradient-to-br from-white to-[#d7dbff] shadow-soft" />
      <div className="absolute bottom-4 left-1/2 h-2 w-52 -translate-x-1/2 rounded-full bg-[#e8e6ff]" />
      <FloatingChip className="left-7 top-20" icon={<ShieldCheck className="h-4 w-4" />} text="Secure" />
      <FloatingChip className="right-4 top-32" icon={<Sparkles className="h-4 w-4" />} text="AI" />
      <FloatingChip className="bottom-20 right-14" icon={<CheckCircle2 className="h-4 w-4" />} text="Ready" />
    </div>
  );
}

export function HeroDashboardIllustration() {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-xl">
      <div className="absolute inset-8 rounded-[40px] border border-primary/10 bg-gradient-to-br from-[#f8f7ff] via-white to-[#f0fbff]" />
      <motion.div
        initial={{ opacity: 0, y: 18, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.7 }}
        className="absolute left-12 top-16 w-[78%] rounded-[28px] border border-white bg-white/85 p-6 shadow-glass backdrop-blur-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#121025] to-primary" />
            <div>
              <div className="h-3 w-28 rounded-full bg-slate-200" />
              <div className="mt-2 h-2 w-20 rounded-full bg-slate-100" />
            </div>
          </div>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex items-center gap-6">
          <div className="relative h-36 w-36">
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(#6D5BFF_0_82%,#E9E7FF_82%_100%)]" />
            <div className="absolute inset-4 grid place-items-center rounded-full bg-white">
              <div className="text-center">
                <p className="text-3xl font-extrabold">82%</p>
                <p className="text-xs font-semibold text-muted">Churn risk</p>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <Meter color="bg-danger" width="w-[86%]" />
            <Meter color="bg-primary" width="w-[64%]" />
            <Meter color="bg-accent" width="w-[72%]" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <MiniStat label="Risk" value="Critical" />
              <MiniStat label="MRR" value="$16.2M" />
            </div>
          </div>
        </div>
      </motion.div>
      <FloatingCard className="left-0 top-8" icon={<Bot className="h-5 w-5" />} title="Recommendation" text="Launch save offer" />
      <FloatingCard className="right-0 top-32" icon={<Gauge className="h-5 w-5" />} title="$16.2M" text="Revenue protected" />
      <FloatingCard className="bottom-16 left-4" icon={<BarChart3 className="h-5 w-5" />} title="92.4%" text="Model accuracy" />
    </div>
  );
}

function FloatingCard({
  className,
  icon,
  title,
  text
}: {
  className: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute rounded-2xl border border-white bg-white/90 p-4 shadow-glass ${className}`}
    >
      <div className="mb-2 text-primary">{icon}</div>
      <p className="text-sm font-extrabold text-ink">{title}</p>
      <p className="text-xs text-muted">{text}</p>
    </motion.div>
  );
}

function FloatingChip({ className, icon, text }: { className: string; icon: ReactNode; text: string }) {
  return (
    <div className={`absolute flex items-center gap-2 rounded-2xl border border-white bg-white/85 px-3 py-2 text-xs font-bold text-primary shadow-soft ${className}`}>
      {icon}
      {text}
    </div>
  );
}

function Meter({ color, width }: { color: string; width: string }) {
  return (
    <div className="h-2.5 rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color} ${width}`} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f6f4ff] p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-extrabold text-ink">{value}</p>
    </div>
  );
}
