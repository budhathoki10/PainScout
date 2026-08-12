"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UpgradeButton({ className, variant = "default" as const }: { className?: string; variant?: "default" | "outline" }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout unavailable");
      }
      window.location.href = data.url;
    } catch {
      toast.info("Stripe isn't configured in this demo", {
        description: "Add STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID to .env to enable checkout — see README.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleUpgrade} disabled={loading} variant={variant} className={cn("gap-1.5", className)}>
      {loading && <Loader2 className="size-4 animate-spin" />}
      Upgrade to Pro
    </Button>
  );
}
