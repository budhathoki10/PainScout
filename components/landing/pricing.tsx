import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Try it out on a single project.",
    features: [
      "1 tracked project",
      "Up to 5 keywords",
      "Daily digest email",
      "7-day lead history",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "/month",
    description: "For founders running multiple products or niches.",
    features: [
      "Unlimited projects",
      "Unlimited keywords",
      "Twice-daily digests",
      "Full lead history & analytics",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Start free. Upgrade when you're running more than one project.
          </p>
        </Reveal>

        <Reveal as="div" stagger={0.1} y={20} className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
          {PLANS.map((plan) =>
            plan.highlighted ? (
              <SpotlightCard
                key={plan.name}
                className="flex flex-col rounded-2xl border border-primary/40 bg-card p-8 shadow-lg shadow-primary/5 ring-1 ring-primary/20 transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
                <PlanBody plan={plan} />
              </SpotlightCard>
            ) : (
              <div
                key={plan.name}
                className="relative flex flex-col rounded-2xl border border-border bg-card p-8 transition-transform duration-300 hover:-translate-y-1"
              >
                <PlanBody plan={plan} />
              </div>
            ),
          )}
        </Reveal>
      </div>
    </section>
  );
}

function PlanBody({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <>
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
        <span className="text-sm text-muted-foreground">{plan.cadence}</span>
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <Button
        className={cn("mt-8 w-full")}
        variant={plan.highlighted ? "default" : "outline"}
        asChild
      >
        <Link href="/signup">{plan.cta}</Link>
      </Button>
    </>
  );
}
