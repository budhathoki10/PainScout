import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAccountInfo } from "@/lib/data/billing";
import { AccountForm } from "@/components/account/account-form";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  const account = await getAccountInfo(session!.user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Account settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and notification preferences.</p>
      </div>
      <AccountForm account={account} />
    </div>
  );
}
