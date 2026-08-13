import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getBillingInfo } from "@/lib/data/billing";
import { getFreemiusCheckoutConfig } from "@/lib/freemius";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = { title: "Set up your project" };

export default async function OnboardingPage() {
  const session = await auth();
  const billing = await getBillingInfo(session!.user.id);
  const checkoutConfig = getFreemiusCheckoutConfig();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-between px-6 py-5 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-lg px-4 pb-16">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Set up your first project</h1>
          <p className="mt-1 text-sm text-muted-foreground">Two quick steps and you&apos;re watching Bluesky.</p>
        </div>
        <OnboardingWizard
          maxKeywords={billing.limits.keywordsPerProject}
          checkoutConfig={checkoutConfig}
          userName={session!.user.name ?? undefined}
          userEmail={session!.user.email ?? undefined}
        />
      </main>
    </div>
  );
}
