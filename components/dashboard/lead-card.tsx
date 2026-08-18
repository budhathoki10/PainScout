"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, ExternalLink, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/lib/types";

interface LeadCardProps {
  lead: Lead;
  updating: boolean;
  onStatusChange: (status: LeadStatus) => void;
  /** Shown when a lead is displayed outside its own project's page (e.g. a cross-project view). */
  projectName?: string;
}

const SCORE_TIER = (score: number) =>
  score >= 85
    ? { text: "text-primary", border: "border-l-primary" }
    : score >= 60
      ? { text: "text-warning", border: "border-l-warning" }
      : { text: "text-muted-foreground", border: "border-l-border" };

const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  USEFUL: "Useful",
  NOT_RELEVANT: "Not relevant",
  CONTACTED: "Contacted",
};

export function LeadCard({ lead, updating, onStatusChange, projectName }: LeadCardProps) {
  const isUseful = lead.status === "USEFUL";
  const isContacted = lead.status === "CONTACTED";
  const isNotRelevant = lead.status === "NOT_RELEVANT";
  const tier = SCORE_TIER(lead.score);

  return (
    <div
      className={cn(
        "rounded-xl border border-l-2 border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        tier.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-primary">@{lead.authorHandle}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
            </span>
          </div>
          {(projectName || lead.status !== "NEW") && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {projectName && (
                <Badge variant="outline" className="text-[11px]">
                  {projectName}
                </Badge>
              )}
              {lead.status !== "NEW" && (
                <Badge variant="outline" className="text-[11px]">
                  {STATUS_LABEL[lead.status]}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className={cn("text-lg leading-none font-semibold tabular-nums", tier.text)}>
            {Math.round(lead.score)}
          </div>
          <div className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            match
          </div>
        </div>
      </div>

      <a
        href={lead.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 block text-[15px] leading-relaxed font-medium text-balance hover:underline"
      >
        {lead.text}
      </a>

      {lead.matchedOn.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lead.matchedOn.map((kw) => (
            <Badge key={kw} variant="secondary" className="rounded-full text-[11px] font-normal">
              {kw}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button
          size="sm"
          variant={isUseful ? "default" : "outline"}
          className="h-8 gap-1.5 text-xs"
          disabled={updating}
          onClick={() => onStatusChange(isUseful ? "NEW" : "USEFUL")}
        >
          {updating ? <Loader2 className="size-3.5 animate-spin" /> : <ThumbsUp className="size-3.5" />}
          Useful
        </Button>
        <Button
          size="sm"
          variant={isNotRelevant ? "default" : "outline"}
          className="h-8 gap-1.5 text-xs"
          disabled={updating}
          onClick={() => onStatusChange(isNotRelevant ? "NEW" : "NOT_RELEVANT")}
        >
          <ThumbsDown className="size-3.5" />
          Not relevant
        </Button>
        <Button
          size="sm"
          variant={isContacted ? "default" : "outline"}
          className="h-8 gap-1.5 text-xs"
          disabled={updating}
          onClick={() => onStatusChange(isContacted ? "NEW" : "CONTACTED")}
        >
          <Check className="size-3.5" />
          Contacted
        </Button>
        <Button size="sm" variant="ghost" className="ml-auto h-8 gap-1.5 text-xs" asChild>
          <a href={lead.url} target="_blank" rel="noreferrer">
            Open on Bluesky <ExternalLink className="size-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
