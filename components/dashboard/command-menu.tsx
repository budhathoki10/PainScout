"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CreditCard, FolderCog, Inbox, Plus, Search, ThumbsUp, User } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { Project } from "@/lib/types";

const destinations = [
  { label: "Lead inbox", href: "/dashboard", icon: Inbox },
  { label: "Saved leads", href: "/saved", icon: ThumbsUp },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Account settings", href: "/account", icon: User },
];

export function CommandMenu({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-8 w-8 justify-center gap-2 px-0 text-muted-foreground sm:w-48 sm:justify-start sm:px-2.5"
        onClick={() => setOpen(true)}
        aria-label="Search pages and projects"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Search</span>
        <Kbd className="ml-auto hidden h-auto w-auto px-1 py-0.5 lg:inline-flex">Ctrl K</Kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Quick search">
        <CommandInput placeholder="Search pages and projects..." />
        <CommandList>
          <CommandEmpty>No matching page or project.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {destinations.map((item) => (
              <CommandItem key={item.href} value={item.label} onSelect={() => navigate(item.href)}>
                <item.icon />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <CommandItem
                key={project.id}
                value={`${project.name} project`}
                onSelect={() => navigate(`/dashboard?project=${project.id}`)}
              >
                <FolderCog />
                <span>{project.name}</span>
                {project.paused && <CommandShortcut>Paused</CommandShortcut>}
              </CommandItem>
            ))}
            <CommandItem value="new project" onSelect={() => navigate("/onboarding")}>
              <Plus />
              <span>New project</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
