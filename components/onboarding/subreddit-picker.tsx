"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { POPULAR_SUBREDDITS } from "@/lib/popular-subreddits";

interface SubredditPickerProps {
  value: string[];
  onChange: (subs: string[]) => void;
}

export function SubredditPicker({ value, onChange }: SubredditPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = POPULAR_SUBREDDITS.filter(
    (s) => s.toLowerCase().includes(query.toLowerCase()) && !value.includes(s),
  );

  function toggle(sub: string) {
    onChange(value.includes(sub) ? value.filter((s) => s !== sub) : [...value, sub]);
  }

  function addCustom() {
    const clean = query.trim().replace(/^r\//i, "");
    if (clean && !value.includes(clean)) {
      onChange([...value, clean]);
      setQuery("");
    }
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((sub) => (
            <Badge key={sub} variant="secondary" className="gap-1 rounded-full pr-1">
              r/{sub}
              <button
                type="button"
                aria-label={`Remove r/${sub}`}
                onClick={() => toggle(sub)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Search subreddits (e.g. SaaS, freelance) or type your own"
          className="pl-9"
        />
      </div>

      <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-md border border-border p-1">
        {filtered.length === 0 ? (
          <button
            type="button"
            onClick={addCustom}
            disabled={!query.trim()}
            className="w-full rounded-sm px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {query.trim() ? `Add "r/${query.trim().replace(/^r\//i, "")}"` : "No matches — try a different search"}
          </button>
        ) : (
          filtered.slice(0, 8).map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => toggle(sub)}
              className={cn(
                "w-full rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              )}
            >
              r/{sub}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
