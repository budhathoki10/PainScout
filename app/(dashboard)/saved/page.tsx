import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUsefulLeads } from "@/lib/data/leads";
import { SavedLeadsView } from "@/components/saved/saved-leads-view";

export const metadata: Metadata = { title: "Saved leads" };

export default async function SavedPage() {
  const session = await auth();
  const leads = await getUsefulLeads(session!.user.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Saved leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every lead you&apos;ve marked Useful, across all your projects.
        </p>
      </div>
      <SavedLeadsView initialLeads={leads} />
    </div>
  );
}
