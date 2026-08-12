"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Links to /api/billing/checkout, which resolves the signed-in user
 * server-side and redirects to a Freemius-hosted checkout link built via
 * the SDK — no client-editable query string, no embedded checkout script.
 */
export function UpgradeButton({
  configured,
  className,
  variant = "default" as const,
}: {
  configured: boolean;
  className?: string;
  variant?: "default" | "outline";
}) {
  if (!configured) {
    return (
      <Button
        variant={variant}
        className={cn("gap-1.5", className)}
        onClick={() =>
          toast.info("Freemius isn't configured in this demo", {
            description: "Add FREEMIUS_PRODUCT_ID, FREEMIUS_API_KEY, FREEMIUS_SECRET_KEY, and FREEMIUS_PUBLIC_KEY to .env — see README.",
          })
        }
      >
        Upgrade to Pro
      </Button>
    );
  }

  return (
    <Button variant={variant} className={cn("gap-1.5", className)} asChild>
      <a href="/api/billing/checkout">Upgrade to Pro</a>
    </Button>
  );
}
