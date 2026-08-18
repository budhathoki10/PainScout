"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { SidebarContent } from "@/components/dashboard/sidebar-content";
import { Topbar } from "@/components/dashboard/topbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

export const SIDEBAR_COLLAPSED_COOKIE = "sidebar-collapsed";

interface DashboardShellProps {
  projects: Project[];
  userName: string;
  userEmail: string;
  userImage: string | null;
  defaultCollapsed: boolean;
  children: React.ReactNode;
}

export function DashboardShell({
  projects,
  userName,
  userEmail,
  userImage,
  defaultCollapsed,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000`;
      return next;
    });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleCollapsed();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "relative hidden shrink-0 border-r border-border transition-[width] duration-500 ease-in-out lg:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <SidebarContent projects={projects} collapsed={collapsed} />
        </div>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={toggleCollapsed}
                className="absolute top-5 -right-3 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
              />
            }
          >
            <ChevronLeft
              className={cn(
                "size-3.5 transition-transform duration-500 ease-in-out",
                collapsed && "rotate-180",
              )}
            />
          </TooltipTrigger>
          <TooltipContent side="right" className="gap-2">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            <Kbd>Ctrl B</Kbd>
          </TooltipContent>
        </Tooltip>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          projects={projects}
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
        />
        <main className="flex-1 bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
