import { Clock, Filter, ScanEye, Zap } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";
import { Marquee } from "@/components/motion/marquee";
import { EXAMPLE_KEYWORDS } from "@/lib/example-keywords";

export function ValueStrip() {
  return (
    <section className="border-t border-border/60 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal
          stagger={0.08}
          y={20}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:col-span-2">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Clock className="size-5" />
            </span>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-balance">Get your time back</p>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground text-pretty">
              Feedwatch scans Bluesky continuously and filters out the noise — so you don&apos;t have to
              scroll for it.
            </p>
           
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ScanEye className="size-5" />
            </span>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              <Counter to={20} suffix="+" />
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground text-pretty">Keywords watched at once</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Filter className="size-5" />
            </span>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              <Counter to={100} suffix="%" />
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground text-pretty">Automated — memes and noise filtered out</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:col-span-2 lg:col-span-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Zap className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Watching right now</p>
                  <p className="text-sm text-muted-foreground">A sample of keywords founders track with Feedwatch</p>
                </div>
              </div>
            </div>
            <Marquee items={EXAMPLE_KEYWORDS} className="mt-5" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
