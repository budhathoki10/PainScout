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
}

const SCORE_TIER = (score: number) =>
  score >= 85
    ? "border-primary/30 bg-primary/10 text-primary"
    : score >= 60
      ? "border-warning/30 bg-warning/10 text-warning"
      : "border-border bg-muted text-muted-foreground";

const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  USEFUL: "Useful",
  NOT_RELEVANT: "Not relevant",
  CONTACTED: "Contacted",
};

export function LeadCard({ lead, updating, onStatusChange }: LeadCardProps) {
  const isUseful = lead.status === "USEFUL";
  const isContacted = lead.status === "CONTACTED";
  const isNotRelevant = lead.status === "NOT_RELEVANT";

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">@{lead.authorHandle}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lead.status !== "NEW" && (
            <Badge variant="outline" className="text-[11px]">
              {STATUS_LABEL[lead.status]}
            </Badge>
          )}
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
              SCORE_TIER(lead.score),
            )}
          >
            {Math.round(lead.score)}% match
          </span>
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
