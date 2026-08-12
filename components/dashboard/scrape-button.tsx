"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DOT_DELAYS_MS = [0, 150, 300];

/**
 * Manual "Scrape now" trigger — runs the same live pipeline as the scheduled
 * cron digest but never emails (see app/api/projects/[id]/scan/route.ts).
 * Only the scheduled run emails; this just refreshes the dashboard.
 */
export function ScrapeButton({ projectId, className }: { projectId: string; className?: string }) {
  const router = useRouter();
  const [scraping, setScraping] = useState(false);

  async function handleScrape() {
    setScraping(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/scan`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Scrape failed");

      if (data.newLeads > 0) {
        toast.success(`Found ${data.newLeads} new lead${data.newLeads === 1 ? "" : "s"}`);
      } else {
        toast("No new leads found", { description: "Nothing new since the last scrape." });
      }
      router.refresh();
    } catch (err) {
      toast.error("Couldn't scrape right now", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setScraping(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-1.5", className)}
      onClick={handleScrape}
      disabled={scraping}
    >
      {scraping ? (
        <>
          <Loader2 className="size-3.5 animate-spin" />
          <span className="inline-flex items-baseline">
            Scraping
            <span className="ml-0.5 inline-flex">
              {DOT_DELAYS_MS.map((delay) => (
                <span
                  key={delay}
                  className="animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  .
                </span>
              ))}
            </span>
          </span>
        </>
      ) : (
        <>
          <ScanLine className="size-3.5" />
          Scrape now
        </>
      )}
    </Button>
  );
}
