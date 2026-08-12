import { SidebarContent } from "@/components/dashboard/sidebar-content";
import { Topbar } from "@/components/dashboard/topbar";
import type { Project } from "@/lib/types";

interface DashboardShellProps {
  projects: Project[];
  userName: string;
  userEmail: string;
  userImage: string | null;
  children: React.ReactNode;
}

export function DashboardShell({ projects, userName, userEmail, userImage, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent projects={projects} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar projects={projects} userName={userName} userEmail={userEmail} userImage={userImage} />
        <main className="flex-1 bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
