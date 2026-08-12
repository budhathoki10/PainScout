import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/lib/data/projects";
import { ProjectSettingsForm } from "@/components/projects/settings-form";

export const metadata: Metadata = { title: "Project settings" };

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const project = await getProjectById(id, session!.user.id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Project settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">{project.name}</p>
      </div>
      <ProjectSettingsForm project={project} />
    </div>
  );
}
