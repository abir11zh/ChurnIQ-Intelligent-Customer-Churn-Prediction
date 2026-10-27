import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BarChart3, BrainCircuit, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "../Logo";
import { RobotIllustration } from "../Illustrations";
import { foundationStats } from "../../data/foundation";
import { cn } from "../../lib/utils";

export function AuthLayout({
  eyebrow = "Secure AI workspace",
  title,
  subtitle,
  children,
  compact = false
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-ink">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="soft-grid relative hidden overflow-hidden bg-[#fbfbff] px-10 py-8 lg:block">
          <div className="relative z-10 mx-auto flex h-full max-w-2xl flex-col">
            <Logo />
            <div className="mt-14">
              <span className="inline-flex rounded-full bg-[#f2efff] px-3 py-1.5 text-xs font-extrabold text-primary">{eyebrow}</span>
              <h1 className="mt-5 max-w-xl text-5xl font-extrabold leading-tight tracking-normal">
                Customer intelligence that feels production-ready.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted">
                ChurnIQ AI gives teams a secure workspace for churn decisions, analytics, reports and retention operations.
              </p>
            </div>

            <div className="relative mt-10 flex-1">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 top-4 w-72 rounded-3xl border border-white/80 bg-white/75 p-5 shadow-soft backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-extrabold text-success">Live</span>
                </div>
                <p className="mt-5 text-sm font-bold text-muted">ROC-AUC Benchmark</p>
                <p className="mt-1 text-4xl font-extrabold">84.7%</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-0 top-20 w-72 rounded-3xl border border-white/80 bg-white/75 p-5 shadow-soft backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f2efff] text-primary">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-extrabold">CatBoost AI Engine</p>
                    <p className="text-xs font-semibold text-muted">Production-ready signal</p>
                  </div>
                </div>
              </motion.div>

              <div className="absolute bottom-8 left-1/2 w-[360px] -translate-x-1/2">
                <RobotIllustration />
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-24 left-10 w-72 rounded-3xl border border-white/80 bg-white/75 p-5 shadow-soft backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-accent">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-extrabold">Revenue Protection</p>
                    <p className="text-xs font-semibold text-muted">$2.4M protected ARR</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {foundationStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur">
                  <stat.icon className="h-4 w-4 text-primary" />
                  <p className="mt-3 text-xl font-extrabold">{stat.value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase leading-4 text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="grid place-items-center bg-white px-5 py-8">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn("w-full rounded-[28px] border border-slate-100 bg-white p-6 shadow-soft sm:p-8", compact ? "max-w-lg" : "max-w-xl")}
          >
            <div className="mb-8 text-center">
              <Logo className="justify-center" />
              <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f2efff] px-3 py-1.5 text-xs font-extrabold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secured by enterprise-grade authentication
              </div>
              <h2 className="mt-5 text-3xl font-extrabold tracking-normal">{title}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{subtitle}</p>
            </div>
            {children}
            <div className="mt-7 grid gap-2 rounded-2xl bg-slate-50 p-4 text-xs font-bold text-muted">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Protected analytics workspace</span>
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Role-aware customer intelligence access</span>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
