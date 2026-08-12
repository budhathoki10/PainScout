"use client";

import { ArrowDownAZ, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/types";

export type StatusFilter = LeadStatus | "ALL";
export type SortOption = "recent" | "score";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "NEW", label: "New" },
  { value: "USEFUL", label: "Useful" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "NOT_RELEVANT", label: "Not relevant" },
];

interface FilterBarProps {
  keywords: string[];
  status: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  keyword: string;
  onKeywordChange: (v: string) => void;
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
  resultCount: number;
}

export function FilterBar({
  keywords,
  status,
  onStatusChange,
  keyword,
  onKeywordChange,
  sort,
  onSortChange,
  resultCount,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={(v) => v && onStatusChange(v as StatusFilter)}>
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue placeholder="Status">
              {(v: StatusFilter) => STATUS_OPTIONS.find((opt) => opt.value === v)?.label ?? v}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={keyword} onValueChange={(v) => v && onKeywordChange(v)}>
          <SelectTrigger size="sm" className="w-[160px]">
            <SelectValue placeholder="Keyword">
              {(v: string) => (v === "ALL" ? "All keywords" : v)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All keywords</SelectItem>
            {keywords.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {resultCount} lead{resultCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onSortChange("recent")}
          className={cn("h-7 gap-1.5 px-2.5 text-xs", sort === "recent" && "bg-accent text-accent-foreground")}
        >
          <ArrowDownAZ className="size-3.5" /> Newest
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onSortChange("score")}
          className={cn("h-7 gap-1.5 px-2.5 text-xs", sort === "score" && "bg-accent text-accent-foreground")}
        >
          <Sparkles className="size-3.5" /> Top match
        </Button>
      </div>
    </div>
  );
}
