import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getProjects } from "@/lib/data/projects";
import { DashboardShell, SIDEBAR_COLLAPSED_COOKIE } from "@/components/dashboard/shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session!.user.id;
  const [projects, cookieStore] = await Promise.all([getProjects(userId), cookies()]);
  const defaultCollapsed = cookieStore.get(SIDEBAR_COLLAPSED_COOKIE)?.value === "1";

  return (
    <DashboardShell
      projects={projects}
      userName={session!.user.name ?? "Account"}
      userEmail={session!.user.email ?? ""}
      userImage={session!.user.image ?? null}
      defaultCollapsed={defaultCollapsed}
    >
      {children}
    </DashboardShell>
  );
}
