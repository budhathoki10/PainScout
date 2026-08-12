import type { Metadata } from "next";
import { Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { getBillingInfo } from "@/lib/data/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UpgradeButton } from "@/components/billing/upgrade-button";

export const metadata: Metadata = { title: "Billing" };

const FREE_FEATURES = ["1 tracked project", "Up to 4 subreddits", "Daily digest email", "7-day lead history"];
const PRO_FEATURES = [
  "Unlimited projects",
  "Unlimited subreddits & keywords",
  "Twice-daily digests",
  "Full lead history & analytics",
  "Priority support",
];

export default async function BillingPage() {
  const session = await auth();
  const billing = await getBillingInfo(session!.user.id);
  const isPro = billing.plan === "PRO";

  const usageRows = [
    { label: "Projects", used: billing.usage.projects, limit: billing.limits.projects },
    {
      label: "Subreddits in largest project",
      used: billing.usage.maxSubredditsInAnyProject,
      limit: billing.limits.subredditsPerProject,
    },
    { label: "Scans today", used: billing.usage.scansToday, limit: billing.limits.scansPerDay },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your plan and usage.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              Current plan
              <Badge variant={isPro ? "default" : "secondary"}>{billing.plan}</Badge>
            </CardTitle>
            <CardDescription>
              {isPro ? "Billed monthly · manage or cancel anytime" : "Free forever, upgrade anytime"}
            </CardDescription>
          </div>
          {!isPro && <UpgradeButton />}
        </CardHeader>
        <CardContent className="space-y-5">
          {usageRows.map((row) => {
            const pct = Math.min(100, Math.round((row.used / row.limit) * 100));
            return (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">
                    {row.used} / {row.limit}
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className={!isPro ? "ring-1 ring-primary/30" : undefined}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Free</CardTitle>
              {!isPro && <Badge variant="secondary">Current</Badge>}
            </div>
            <CardDescription>$0 forever</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className={isPro ? "ring-1 ring-primary/30" : undefined}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pro</CardTitle>
              {isPro ? <Badge variant="secondary">Current</Badge> : <Badge>$29/mo</Badge>}
            </div>
            <CardDescription>For multi-project founders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            {!isPro && <UpgradeButton className="w-full" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
