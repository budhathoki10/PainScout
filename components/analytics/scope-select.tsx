"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/lib/types";

export function ScopeSelect({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("project") ?? "all";

  return (
    <Select
      value={current}
      onValueChange={(v) => router.push(v === "all" ? "/analytics" : `/analytics?project=${v}`)}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue>
          {(v: string) => (v === "all" ? "All projects" : (projects.find((p) => p.id === v)?.name ?? v))}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All projects</SelectItem>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
