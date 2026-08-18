import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { HeroPreviewCard } from "@/components/landing/hero-preview-card";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:px-8">
        <Reveal trigger="load" stagger={0.1} y={16}>
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 rounded-full border-transparent bg-accent px-3 py-1 text-accent-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            Now watching Bluesky for you
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08] xl:text-6xl">
            Spot potential leads <span className="text-primary">before the noise buries them</span>
          </h1>

          <p className="mt-5 max-w-lg text-lg text-muted-foreground text-pretty">
            Feedwatch watches Bluesky for the keywords you choose, filters out the noise, and emails
            you a ranked digest of people already complaining about the problem you solve.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Magnetic className="inline-block">
              <Button size="xl" asChild>
                <Link href="/signup">
                  Get started free <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Magnetic>
            <Button size="xl" variant="outline" asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Free plan available · No credit card required
          </p>
        </Reveal>

        <HeroPreviewCard />
      </div>
    </section>
  );
}
