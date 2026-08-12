import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = { title: "Set up your project" };

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-between px-6 py-5 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-lg px-4 pb-16">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Set up your first project</h1>
          <p className="mt-1 text-sm text-muted-foreground">Three quick steps and you&apos;re watching Reddit.</p>
        </div>
        <OnboardingWizard />
      </main>
    </div>
  );
}
