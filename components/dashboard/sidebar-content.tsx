"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BarChart3, CreditCard, Inbox, Plus, Settings, ThumbsUp, User } from "lucide-react";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Leads", icon: Inbox },
  { href: "/saved", label: "Saved", icon: ThumbsUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/account", label: "Account", icon: User },
];

export function SidebarContent({
  projects,
  collapsed = false,
  onNavigate,
}: {
  projects: Project[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeProject = searchParams.get("project");

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center px-4 py-5", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" onClick={onNavigate} aria-label="Pain Scout">
          <Logo iconOnly={collapsed} />
        </Link>
      </div>

      <nav className={cn("space-y-0.5 px-3", collapsed && "px-2")}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const link = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-label={item.label}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0 py-2.5",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );

          if (!collapsed) return link;

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={link} />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className={cn("mt-6 flex-1 overflow-y-auto overflow-x-hidden px-3", collapsed && "px-2")}>
        {!collapsed && (
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Projects</span>
            <Link
              href="/onboarding"
              onClick={onNavigate}
              aria-label="New project"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="size-3.5" />
            </Link>
          </div>
        )}

        <ul className="space-y-0.5">
          {projects.map((project) => {
            const isActive = pathname === "/dashboard" && (activeProject === project.id || (!activeProject && project === projects[0]));
            const dot = (
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  project.paused ? "bg-muted-foreground/40" : "bg-primary",
                )}
              />
            );

            if (collapsed) {
              return (
                <li key={project.id}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/dashboard?project=${project.id}`}
                          onClick={onNavigate}
                          aria-label={project.name}
                          className={cn(
                            "flex items-center justify-center rounded-md py-2.5 text-xs font-medium transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                          )}
                        />
                      }
                    >
                      {project.name.slice(0, 1).toUpperCase()}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {project.name}
                      {project.paused && " · Paused"}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return (
              <li key={project.id} className="group flex items-center">
                <Link
                  href={`/dashboard?project=${project.id}`}
                  onClick={onNavigate}
                  className={cn(
                    "flex flex-1 items-center gap-2 truncate rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  {dot}
                  <span className="truncate">{project.name}</span>
                  {project.paused && (
                    <Badge variant="outline" className="ml-auto shrink-0 px-1.5 py-0 text-[10px]">
                      Paused
                    </Badge>
                  )}
                </Link>
                <Link
                  href={`/projects/${project.id}/settings`}
                  onClick={onNavigate}
                  aria-label={`Settings for ${project.name}`}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 hover:bg-accent hover:text-accent-foreground group-hover:opacity-100"
                >
                  <Settings className="size-3.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
