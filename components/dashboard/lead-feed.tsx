"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Inbox, Settings } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { FilterBar, type SortOption, type StatusFilter } from "@/components/dashboard/filter-bar";
import { LeadCard } from "@/components/dashboard/lead-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Pagination, PAGE_SIZE } from "@/components/dashboard/pagination";
import type { Lead, LeadStatus } from "@/lib/types";

export function LeadFeed({
  initialLeads,
  projectKeywords,
  scheduleLabel,
  settingsHref,
}: {
  initialLeads: Lead[];
  projectKeywords: string[];
  scheduleLabel: string;
  settingsHref: string;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [keyword, setKeyword] = useState("ALL");
  const [sort, setSort] = useState<SortOption>("recent");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Sourced from the project's own config, not from existing leads' matchedOn —
  // otherwise editing a project's keywords wouldn't visibly change this list
  // until a new scan ran, which read as "my edit didn't save."
  const keywords = useMemo(() => [...projectKeywords].sort(), [projectKeywords]);

  const visibleLeads = useMemo(() => {
    let result = leads;
    if (status !== "ALL") result = result.filter((l) => l.status === status);
    if (keyword !== "ALL") result = result.filter((l) => l.matchedOn.includes(keyword));
    return [...result].sort((a, b) =>
      sort === "score"
        ? b.score - a.score
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [leads, status, keyword, sort]);

  function handleStatusFilterChange(v: StatusFilter) {
    setStatus(v);
    setPage(1);
  }
  function handleKeywordFilterChange(v: string) {
    setKeyword(v);
    setPage(1);
  }
  function handleSortChange(v: SortOption) {
    setSort(v);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(visibleLeads.length / PAGE_SIZE));
  const pagedLeads = useMemo(
    () => visibleLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [visibleLeads, page],
  );

  const gridRef = useRef<HTMLDivElement>(null);
  // Signature (not the array reference) so a status click on one card doesn't
  // replay the whole grid's entrance — only an actual membership/order change does.
  const visibleSignature = pagedLeads.map((l) => l.id).join(",");

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
        keywords={keywords}
        status={status}
        onStatusChange={handleStatusFilterChange}
        keyword={keyword}
        onKeywordChange={handleKeywordFilterChange}
        sort={sort}
        onSortChange={handleSortChange}
        resultCount={visibleLeads.length}
      />

      {visibleLeads.length === 0 ? (
        leads.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No leads yet"
            description={scheduleLabel}
            action={
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <Link href={settingsHref}>
                  <Settings className="size-3.5" />
                  Change schedule
                </Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Inbox}
            title="No leads match these filters"
            description="Try clearing a filter, or check back after the next scan runs."
          />
        )
      ) : (
        <>
          <div ref={gridRef} className="grid gap-4 lg:grid-cols-2">
            {pagedLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                updating={pendingId === lead.id}
                onStatusChange={(next) => handleStatusChange(lead, next)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
