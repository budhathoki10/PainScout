import Link from "next/link";
import { Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/types";

export function ProjectHeader({ project }: { project: Project }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
          {project.paused && <Badge variant="outline">Paused</Badge>}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {project.keywords.map((k) => (
            <Badge key={k} variant="secondary" className="rounded-full text-xs font-normal">
              {k}
            </Badge>
          ))}
        </div>
      </div>
      <Button variant="outline" size="sm" className="gap-1.5 self-start" asChild>
        <Link href={`/projects/${project.id}/settings`}>
          <Settings className="size-3.5" />
          Project settings
        </Link>
      </Button>
    </div>
  );
}
