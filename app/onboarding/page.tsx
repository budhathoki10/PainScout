import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { getBillingInfo } from "@/lib/data/billing";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Set up your project" };

export default async function OnboardingPage() {
  const session = await auth();
  const billing = await getBillingInfo(session!.user.id);
  const atProjectLimit = billing.plan === "FREE" && billing.usage.projects >= billing.limits.projects;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-between px-6 py-5 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-lg px-4 pb-16">
        {atProjectLimit ? (
          <Card>
            <CardContent className="flex flex-col items-center px-8 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Lock className="size-6" />
              </span>
              <h1 className="mt-6 text-xl font-semibold">You&apos;ve reached your Free plan limit</h1>
              <p className="mt-2 max-w-xs text-sm text-pretty text-muted-foreground">
                Free plans track {billing.limits.projects} project. Upgrade to Pro for unlimited projects and
                keywords, twice-daily digests, and more.
              </p>
              <Button className="mt-6 gap-2" asChild>
                <Link href="/billing">Upgrade to Pro</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Set up your first project</h1>
              <p className="mt-1 text-sm text-muted-foreground">Two quick steps and you&apos;re watching Bluesky.</p>
            </div>
            <OnboardingWizard maxKeywords={billing.plan === "FREE" ? billing.limits.keywordsPerProject : undefined} />
          </>
        )}
      </main>
    </div>
  );
}
