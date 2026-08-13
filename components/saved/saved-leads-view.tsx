"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDownAZ, Sparkles, ThumbsUp } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LeadCard } from "@/components/dashboard/lead-card";
import { EmptyState } from "@/components/empty-state";
import { Pagination, PAGE_SIZE } from "@/components/dashboard/pagination";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/types";
import type { SavedLead } from "@/lib/data/leads";

type SortOption = "recent" | "score";

export function SavedLeadsView({ initialLeads }: { initialLeads: SavedLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [project, setProject] = useState("ALL");
  const [sort, setSort] = useState<SortOption>("recent");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const projects = useMemo(
    () => Array.from(new Set(leads.map((l) => l.projectName))).sort(),
    [leads],
  );

  const visibleLeads = useMemo(() => {
    let result = leads;
    if (project !== "ALL") result = result.filter((l) => l.projectName === project);
    return [...result].sort((a, b) =>
      sort === "score"
        ? b.score - a.score
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [leads, project, sort]);

  function handleProjectFilterChange(v: string) {
    setProject(v);
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

  async function handleStatusChange(lead: SavedLead, next: LeadStatus) {
    setPendingId(lead.id);
    const previous = leads;
    // This view only shows USEFUL leads — reclassifying one removes it here.
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));

    try {
      const res = await fetch(`/api/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Request failed");

      if (next === "CONTACTED") toast.success("Marked as contacted");
      else if (next === "NOT_RELEVANT") toast("Marked as not relevant");
      else toast("Removed from useful");
    } catch {
      setLeads(previous);
      toast.error("Couldn't update lead status", { description: "Please try again." });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={project} onValueChange={(v) => v && handleProjectFilterChange(v)}>
            <SelectTrigger size="sm" className="w-[180px]">
              <SelectValue placeholder="Project">
                {(v: string) => (v === "ALL" ? "All projects" : v)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {visibleLeads.length} lead{visibleLeads.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handleSortChange("recent")}
            className={cn("h-7 gap-1.5 px-2.5 text-xs", sort === "recent" && "bg-accent text-accent-foreground")}
          >
            <ArrowDownAZ className="size-3.5" /> Newest
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handleSortChange("score")}
            className={cn("h-7 gap-1.5 px-2.5 text-xs", sort === "score" && "bg-accent text-accent-foreground")}
          >
            <Sparkles className="size-3.5" /> Top match
          </Button>
        </div>
      </div>

      {visibleLeads.length === 0 ? (
        <EmptyState
          icon={ThumbsUp}
          title="No saved leads yet"
          description="Mark a lead as Useful from any project's Leads page and it'll show up here."
        />
      ) : (
        <>
          <div ref={gridRef} className="grid gap-4 lg:grid-cols-2">
            {pagedLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                projectName={lead.projectName}
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
