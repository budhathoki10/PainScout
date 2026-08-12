import type { Metadata } from "next";
import { CheckCircle2, Mail, Radar, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth";
import { getProjects } from "@/lib/data/projects";
import { getLeads } from "@/lib/data/leads";
import { getAnalytics, getDigestTrend, getOpenRate } from "@/lib/data/analytics";
import { ScopeSelect } from "@/components/analytics/scope-select";
import { StatCard } from "@/components/analytics/stat-card";
import { MatchesChart } from "@/components/analytics/matches-chart";
import { AccuracyDonut } from "@/components/analytics/accuracy-donut";
import { OpenRateChart } from "@/components/analytics/open-rate-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const session = await auth();
  const { project: projectId } = await searchParams;
  const scope = projectId ?? "all";

  const userId = session!.user.id;
  const [projects, leads, points, trend, openRate] = await Promise.all([
    getProjects(userId),
    getLeads(scope === "all" ? { userId } : { userId, projectId: scope }),
    getAnalytics(scope, userId),
    getDigestTrend(scope, userId),
    getOpenRate(scope, userId),
  ]);

  const totalMatches = points.reduce((sum, p) => sum + p.matches, 0);
  const useful = leads.filter((l) => l.status === "USEFUL" || l.status === "CONTACTED").length;
  const notRelevant = leads.filter((l) => l.status === "NOT_RELEVANT").length;
  const unreviewed = leads.filter((l) => l.status === "NEW").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last 14 days.</p>
        </div>
        <ScopeSelect projects={projects} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Radar} label="Matches (14d)" value={totalMatches} />
        <StatCard
          icon={CheckCircle2}
          label="Marked useful"
          value={useful}
          hint={leads.length > 0 ? `of ${leads.length} reviewed leads` : undefined}
        />
        <StatCard icon={Mail} label="Digest open rate" value={openRate} suffix="%" />
        <StatCard icon={TrendingUp} label="Active projects" value={projects.filter((p) => !p.paused).length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Matches per day</CardTitle>
            <CardDescription>Posts that passed the pain-point filter.</CardDescription>
          </CardHeader>
          <CardContent>
            <MatchesChart data={points} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter accuracy</CardTitle>
            <CardDescription>Based on your useful / not relevant feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <AccuracyDonut useful={useful} notRelevant={notRelevant} unreviewed={unreviewed} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Digest open rate over time</CardTitle>
          <CardDescription>Share of sent digests that were opened.</CardDescription>
        </CardHeader>
        <CardContent>
          {trend.length === 0 ? (
            <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
              No digests sent yet
            </div>
          ) : (
            <OpenRateChart data={trend} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
