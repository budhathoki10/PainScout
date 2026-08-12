"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FreemiusCheckoutConfig } from "@/lib/freemius";

// Freemius doesn't publish official TypeScript types for Checkout.js.
declare global {
  interface Window {
    FS?: {
      Checkout: {
        configure: (options: Record<string, unknown>) => {
          open: (options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function UpgradeButton({
  config,
  userName,
  userEmail,
  className,
  variant = "default" as const,
}: {
  config: FreemiusCheckoutConfig | null;
  userName?: string;
  userEmail?: string;
  className?: string;
  variant?: "default" | "outline";
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleUpgrade() {
    if (!config) {
      toast.info("Freemius isn't configured in this demo", {
        description: "Add FREEMIUS_PRODUCT_ID, FREEMIUS_PRO_PLAN_ID, and FREEMIUS_PUBLIC_KEY to .env — see README.",
      });
      return;
    }
    if (!window.FS) {
      toast.info("Checkout is still loading — try again in a moment.");
      return;
    }

    setLoading(true);
    const handler = window.FS.Checkout.configure({
      product_id: config.productId,
      plan_id: config.planId,
      public_key: config.publicKey,
      image: "/icon.png",
    });

    handler.open({
      name: userName,
      email: userEmail,
      success: () => {
        toast.success("You're upgraded to Pro!");
        router.push("/billing?upgraded=1");
        router.refresh();
      },
      cancel: () => setLoading(false),
    });
  }

  return (
    <>
      {config && <Script src="https://checkout.freemius.com/checkout.js" strategy="lazyOnload" />}
      <Button onClick={handleUpgrade} disabled={loading} variant={variant} className={cn("gap-1.5", className)}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Upgrade to Pro
      </Button>
    </>
  );
}
