"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  /** Caps how many tags can be added — extra input is silently dropped once reached. */
  maxTags?: number;
}

export function TagInput({ value, onChange, placeholder, className, maxTags }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const atLimit = maxTags !== undefined && value.length >= maxTags;

  function commit() {
    // Splits on commas so pasted or fast-typed "a, b, c" becomes three tags
    // instead of one literal tag containing commas.
    const parts = draft
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const next = [...value];
    for (const tag of parts) {
      if (maxTags !== undefined && next.length >= maxTags) break;
      if (!next.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        next.push(tag);
      }
    }
    if (next.length !== value.length) onChange(next);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 rounded-full pr-1">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        disabled={atLimit}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="h-6 flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
