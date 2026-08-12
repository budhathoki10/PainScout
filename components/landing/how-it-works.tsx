import { ListFilter, Mail, Radar } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { StepConnector } from "@/components/landing/step-connector";

const STEPS = [
  {
    icon: Radar,
    title: "Tell it what to watch",
    description:
      "Pick the keywords that represent the problem you solve — \"invoicing\", \"uptime monitoring\", whatever fits your niche.",
  },
  {
    icon: ListFilter,
    title: "It scans and filters daily",
    description:
      "A scheduled scan searches Bluesky for new posts, discards memes and noise, and keeps only genuine complaints that match what you're tracking.",
  },
  {
    icon: Mail,
    title: "You get a ranked digest",
    description:
      "The best matches land in your inbox every morning. Reply to the ones that fit — no more scrolling Bluesky for hours.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From scattered complaints to a ranked inbox
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Three steps, fully automated after setup.
          </p>
        </Reveal>

        <div className="relative mt-16">
          <StepConnector />
          <Reveal as="div" stagger={0.15} y={28} className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                  <step.icon className="size-5 text-primary" strokeWidth={2} />
                </div>
                <span className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {step.description}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
