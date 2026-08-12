"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarContent } from "@/components/dashboard/sidebar-content";
import type { Project } from "@/lib/types";

interface TopbarProps {
  projects: Project[];
  userName: string;
  userEmail: string;
}

export function Topbar({ projects, userName, userEmail }: TopbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent projects={projects} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 flex items-center gap-2 rounded-full p-0.5 pr-2.5 transition-colors hover:bg-accent"
              aria-label="Account menu"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                  {initials || <UserIcon className="size-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{userName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/account">Account settings</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
