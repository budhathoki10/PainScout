import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Counter } from "@/components/motion/counter";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, suffix, hint, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2.5 text-2xl font-semibold tracking-tight">
        <Counter to={value} suffix={suffix} />
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
