import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        aria-hidden="true"
        className="size-7 shrink-0 text-primary"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="28" height="28" rx="8.5" fill="currentColor" />
        <path
          d="M9.5 12.5v-2A2.5 2.5 0 0 1 12 8h2M20 8h2a2.5 2.5 0 0 1 2.5 2.5v2M24.5 19.5v2A2.5 2.5 0 0 1 22 24h-2M12 24h-2a2.5 2.5 0 0 1-2.5-2.5v-2"
          stroke="var(--primary-foreground)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.75 16c1.55-2.55 3.35-3.83 5.25-3.83s3.7 1.28 5.25 3.83c-1.55 2.55-3.35 3.83-5.25 3.83s-3.7-1.28-5.25-3.83Z"
          fill="var(--primary-foreground)"
        />
        <circle cx="16" cy="16" r="2.15" fill="currentColor" />
        <circle cx="16.75" cy="15.25" r="0.7" fill="var(--primary-foreground)" />
      </svg>
      {!iconOnly && (
        <span className="text-[15px] font-semibold leading-none tracking-[-0.025em] text-foreground">
          Feedwatch
        </span>
      )}
    </span>
  );
}
