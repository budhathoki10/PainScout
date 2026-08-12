import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getProjects } from "@/lib/data/projects";
import { getLeads } from "@/lib/data/leads";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { LeadFeed } from "@/components/dashboard/lead-feed";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Leads" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const session = await auth();
  const { project: projectId } = await searchParams;

  const projects = await getProjects(session!.user.id);
  const activeProject = projects.find((p) => p.id === projectId) ?? projects[0];

  if (!activeProject) {
    return (
      <EmptyState
        icon={FolderPlus}
        title="No projects yet"
        description="Create a project to start watching subreddits for pain points."
        action={
          <Button asChild>
            <Link href="/onboarding">New project</Link>
          </Button>
        }
      />
    );
  }

  const leads = await getLeads({ userId: session!.user.id, projectId: activeProject.id });

  return (
    <div>
      <ProjectHeader project={activeProject} />
      <LeadFeed key={activeProject.id} initialLeads={leads} />
    </div>
  );
}
