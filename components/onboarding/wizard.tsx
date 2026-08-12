"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SubredditPicker } from "@/components/onboarding/subreddit-picker";
import { TagInput } from "@/components/tag-input";
import { cn } from "@/lib/utils";

const STEPS = ["Name your project", "Pick subreddits", "Add keywords"];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const canAdvance = [name.trim().length > 1, subreddits.length > 0, keywords.length > 0][step];

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center px-8 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <PartyPopper className="size-6" />
          </span>
          <h1 className="mt-6 text-xl font-semibold">You&apos;re all set, {name || "founder"}</h1>
          <p className="mt-2 max-w-xs text-sm text-pretty text-muted-foreground">
            Your first digest for <span className="font-medium text-foreground">{name}</span> arrives
            tomorrow at 8 AM. We&apos;ll scan {subreddits.length} subreddit
            {subreddits.length === 1 ? "" : "s"} for {keywords.length} tracked keyword
            {keywords.length === 1 ? "" : "s"}.
          </p>
          <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Demo build — this project preview isn&apos;t saved. Your dashboard shows sample projects
            already loaded with leads so you can explore the full product right now.
          </p>
          <Button className="mt-6 gap-2" asChild>
            <Link href="/dashboard">
              Go to dashboard <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary/15 text-primary ring-2 ring-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("hidden text-sm sm:inline", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <Card>
        <CardContent className="space-y-5 px-6 py-8 sm:px-8">
          {step === 0 && (
            <div className="space-y-2">
              <Label htmlFor="project-name">What are you building?</Label>
              <Input
                id="project-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DevMetrics — analytics for indie devs"
              />
              <p className="text-xs text-muted-foreground">
                This becomes the name of your project and shows up in your daily digest subject line.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label>Which subreddits should we watch?</Label>
              <SubredditPicker value={subreddits} onChange={setSubreddits} />
              <p className="text-xs text-muted-foreground">Pick at least one. You can add more later.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>What keywords or phrases represent the pain point?</Label>
              <TagInput
                value={keywords}
                onChange={setKeywords}
                placeholder="Type a keyword and press Enter…"
              />
              <p className="text-xs text-muted-foreground">
                e.g. &quot;invoicing&quot;, &quot;late payment&quot;, &quot;chasing payment&quot;
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          className="gap-1.5"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button
          type="button"
          className="gap-1.5"
          disabled={!canAdvance}
          onClick={() => (step === STEPS.length - 1 ? setDone(true) : setStep((s) => s + 1))}
        >
          {step === STEPS.length - 1 ? "Finish setup" : "Continue"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
