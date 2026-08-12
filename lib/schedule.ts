import type { Project } from "@/lib/types";

/** Formats an hour-of-day (0-23) as a 12-hour clock label, e.g. 20 -> "8:00 PM". */
export function formatHour(hour: number): string {
  const reference = new Date(Date.UTC(2000, 0, 1, hour));
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(reference);
}

/**
 * Human-readable description of when a project's next scan(s) run, based on
 * its frequency/deliveryHour and the owner's timezone. Mirrors the gating
 * logic in app/api/cron/digest/route.ts (deliveryHoursFor).
 */
export function scanScheduleLabel(
  project: Pick<Project, "frequency" | "deliveryHour">,
  timezone: string,
): string {
  if (project.frequency === "TWICE_DAILY") {
    const second = (project.deliveryHour + 12) % 24;
    return `Your keywords are searched twice a day, at ${formatHour(project.deliveryHour)} and ${formatHour(second)} (${timezone} time).`;
  }
  return `Your keywords are searched once a day, at ${formatHour(project.deliveryHour)} (${timezone} time).`;
}
