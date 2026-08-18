import { ScanEye } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ScanEye className="size-4" strokeWidth={2.4} />
      </span>
      {!iconOnly && <span className="text-foreground">Feedwatch</span>}
    </span>
  );
}
