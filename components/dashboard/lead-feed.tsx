"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { FilterBar, type SortOption, type StatusFilter } from "@/components/dashboard/filter-bar";
import { LeadCard } from "@/components/dashboard/lead-card";
import { EmptyState } from "@/components/empty-state";
import type { Lead, LeadStatus } from "@/lib/types";

export function LeadFeed({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [subreddit, setSubreddit] = useState("ALL");
  const [sort, setSort] = useState<SortOption>("recent");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const subreddits = useMemo(
    () => Array.from(new Set(initialLeads.map((l) => l.subreddit))).sort(),
    [initialLeads],
  );

  const visibleLeads = useMemo(() => {
    let result = leads;
    if (status !== "ALL") result = result.filter((l) => l.status === status);
    if (subreddit !== "ALL") result = result.filter((l) => l.subreddit === subreddit);
    return [...result].sort((a, b) =>
      sort === "score"
        ? b.score - a.score
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [leads, status, subreddit, sort]);

  const gridRef = useRef<HTMLDivElement>(null);
  // Signature (not the array reference) so a status click on one card doesn't
  // replay the whole grid's entrance — only an actual membership/order change does.
  const visibleSignature = visibleLeads.map((l) => l.id).join(",");

  useGSAP(
    () => {
      if (!gridRef.current || prefersReducedMotion()) return;
      gsap.from(gridRef.current.children, {
        opacity: 0,
        y: 8,
        duration: 0.3,
        stagger: 0.03,
        ease: "power1.out",
      });
    },
    [visibleSignature],
  );

  async function handleStatusChange(lead: Lead, next: LeadStatus) {
    const previous = lead.status;
    setPendingId(lead.id);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: next } : l)));

    try {
      const res = await fetch(`/api/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Request failed");

      if (next === "USEFUL") toast.success("Marked as useful");
      else if (next === "CONTACTED") toast.success("Marked as contacted");
      else if (next === "NOT_RELEVANT") toast("Marked as not relevant");
      else toast("Reset to new");
    } catch {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: previous } : l)));
      toast.error("Couldn't update lead status", { description: "Please try again." });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <FilterBar
        subreddits={subreddits}
        status={status}
        onStatusChange={setStatus}
        subreddit={subreddit}
        onSubredditChange={setSubreddit}
        sort={sort}
        onSortChange={setSort}
        resultCount={visibleLeads.length}
      />

      {visibleLeads.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No leads match these filters"
          description="Try clearing a filter, or check back after the next scan runs."
        />
      ) : (
        <div ref={gridRef} className="grid gap-4 lg:grid-cols-2">
          {visibleLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              updating={pendingId === lead.id}
              onStatusChange={(next) => handleStatusChange(lead, next)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
