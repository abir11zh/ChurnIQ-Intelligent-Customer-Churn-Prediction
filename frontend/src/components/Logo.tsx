import { Hexagon } from "lucide-react";
import { cn } from "../lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-extrabold text-ink", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-soft">
        <Hexagon className="h-5 w-5 fill-white/20" />
        <span className="absolute h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      {!compact && <span className="text-lg tracking-normal">ChurnIQ AI</span>}
    </div>
  );
}
