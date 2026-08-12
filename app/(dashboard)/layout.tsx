import { auth } from "@/lib/auth";
import { getProjects } from "@/lib/data/projects";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session!.user.id;
  const projects = await getProjects(userId);

  return (
    <DashboardShell
      projects={projects}
      userName={session!.user.name ?? "Account"}
      userEmail={session!.user.email ?? ""}
      userImage={session!.user.image ?? null}
    >
      {children}
    </DashboardShell>
  );
}
