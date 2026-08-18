import type {
  AccountInfo,
  AnalyticsPoint,
  BillingInfo,
  DigestLogEntry,
  Lead,
  Project,
} from "@/lib/types";

/**
 * Seeded demo dataset. This is what every page reads in the demo build
 * (see lib/data/*.ts). It exists purely so the product is fully clickable
 * without a live MongoDB / Bluesky / Resend / Freemius connection.
 */

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number, hourOffset = 9) =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000 - hourOffset * 60 * 60 * 1000).toISOString();

const postUri = (handle: string, rkey: string) => `at://did:plc:${handle.split(".")[0].replace(/-/g, "")}/app.bsky.feed.post/${rkey}`;
const postUrl = (handle: string, rkey: string) => `https://bsky.app/profile/${handle}/post/${rkey}`;

export const DEMO_USER_ID = "demo-user-1";

export const mockAccount: AccountInfo = {
  name: "Alex Rivera",
  email: "demo@feedwatch.com",
  image: null,
  timezone: "America/New_York",
  emailDigestOn: true,
};

export const mockProjects: Project[] = [
  {
    id: "proj-devmetrics",
    userId: DEMO_USER_ID,
    name: "DevMetrics — analytics for indie devs",
    keywords: ["analytics", "tracking", "dashboard", "metrics", "google analytics"],
    frequency: "DAILY",
    deliveryHour: 8,
    paused: false,
    createdAt: daysAgo(41),
  },
  {
    id: "proj-invoiceflow",
    userId: DEMO_USER_ID,
    name: "InvoiceFlow — invoicing for freelancers",
    keywords: ["invoice", "invoicing", "late payment", "billing", "chasing payment"],
    frequency: "DAILY",
    deliveryHour: 7,
    paused: false,
    createdAt: daysAgo(28),
  },
  {
    id: "proj-pingwatch",
    userId: DEMO_USER_ID,
    name: "PingWatch — uptime monitoring",
    keywords: ["uptime", "downtime", "monitoring", "alerting", "server down"],
    frequency: "TWICE_DAILY",
    deliveryHour: 9,
    paused: true,
    createdAt: daysAgo(14),
  },
];

export const mockLeads: Lead[] = [
  // --- DevMetrics ---
  {
    id: "lead-1",
    projectId: "proj-devmetrics",
    postUri: postUri("throwaway-founder22.bsky.social", "3l2a2b3c1a2"),
    authorHandle: "throwaway-founder22.bsky.social",
    text: "Google Analytics is so bloated I've started tracking events in a spreadsheet. GA4 takes 4 clicks to see anything useful and the real-time view lags by minutes. Anyone found a lightweight alternative that doesn't need a data science degree to read?",
    url: postUrl("throwaway-founder22.bsky.social", "3l2a2b3c1a2"),
    score: 94,
    status: "NEW",
    matchedOn: ["dashboard", "analytics"],
    createdAt: hoursAgo(3),
  },
  {
    id: "lead-2",
    projectId: "proj-devmetrics",
    postUri: postUri("buildinpublic-dana.bsky.social", "3l2b3c4d2b3"),
    authorHandle: "buildinpublic-dana.bsky.social",
    text: "What do you use to track conversion funnels without paying $200/mo? Mixpanel quoted me that the second I crossed 10k events. Feels like every analytics tool is priced for a Series B company, not someone at $2k MRR.",
    url: postUrl("buildinpublic-dana.bsky.social", "3l2b3c4d2b3"),
    score: 91,
    status: "NEW",
    matchedOn: ["tracking", "analytics"],
    createdAt: hoursAgo(7),
  },
  {
    id: "lead-3",
    projectId: "proj-devmetrics",
    postUri: postUri("solofounder-tim.bsky.social", "3l2c4d5e3c4"),
    authorHandle: "solofounder-tim.bsky.social",
    text: "My analytics dashboard has become a second full-time job. Between GA and a Notion doc I copy numbers into every Monday, I spend almost 3 hours a week just aggregating metrics manually. There has to be a better way.",
    url: postUrl("solofounder-tim.bsky.social", "3l2c4d5e3c4"),
    score: 88,
    status: "USEFUL",
    matchedOn: ["dashboard", "metrics"],
    createdAt: daysAgo(1, 5),
  },
  {
    id: "lead-4",
    projectId: "proj-devmetrics",
    postUri: postUri("freelance-dev-kay.bsky.social", "3l2d5e6f4d5"),
    authorHandle: "freelance-dev-kay.bsky.social",
    text: "Client wants \"real-time analytics\" but won't pay for a real BI tool. Anyone got a cheap way to give a client a live-ish dashboard of site traffic and form submissions without wiring up a whole BI stack?",
    url: postUrl("freelance-dev-kay.bsky.social", "3l2d5e6f4d5"),
    score: 76,
    status: "USEFUL",
    matchedOn: ["dashboard", "tracking"],
    createdAt: daysAgo(1, 14),
  },
  {
    id: "lead-5",
    projectId: "proj-devmetrics",
    postUri: postUri("grumpy-cto.bsky.social", "3l2e6f7g5e6"),
    authorHandle: "grumpy-cto.bsky.social",
    text: "Rant: why is every analytics tool either too simple or way too complex. Plausible is great but I can't get cohort data. Amplitude has everything but takes a week to configure. Is there literally nothing in between for a 3-person team?",
    url: postUrl("grumpy-cto.bsky.social", "3l2e6f7g5e6"),
    score: 82,
    status: "CONTACTED",
    matchedOn: ["analytics"],
    createdAt: daysAgo(2, 8),
  },
  {
    id: "lead-6",
    projectId: "proj-devmetrics",
    postUri: postUri("nightbuild-priya.bsky.social", "3l2f7g8h6f7"),
    authorHandle: "nightbuild-priya.bsky.social",
    text: "How do you all track feature usage without building it yourself? I want to know which features people actually click on before I sink 2 more weeks into the roadmap. Built a janky event logger last weekend, feels like reinventing a wheel.",
    url: postUrl("nightbuild-priya.bsky.social", "3l2f7g8h6f7"),
    score: 79,
    status: "NEW",
    matchedOn: ["tracking", "metrics"],
    createdAt: daysAgo(2, 20),
  },
  {
    id: "lead-7",
    projectId: "proj-devmetrics",
    postUri: postUri("post-mvp-marcus.bsky.social", "3l2g8h9i7g8"),
    authorHandle: "post-mvp-marcus.bsky.social",
    text: "Just canceled Amplitude, back to guessing what users do. $300/mo for a tool I opened twice a month. Now I genuinely have no visibility into user behavior and it's bugging me. Looking for literally anything cheaper that still shows funnels.",
    url: postUrl("post-mvp-marcus.bsky.social", "3l2g8h9i7g8"),
    score: 85,
    status: "NEW",
    matchedOn: ["analytics", "tracking"],
    createdAt: daysAgo(3, 11),
  },
  {
    id: "lead-8",
    projectId: "proj-devmetrics",
    postUri: postUri("contractor-lee.bsky.social", "3l2h9i0j8h9"),
    authorHandle: "contractor-lee.bsky.social",
    text: "Best lightweight alternative to GA4 that a non-technical founder can read? My founder keeps asking me to \"just check the dashboard\" but GA4's UI makes that a 10-minute task. Want the 5 numbers that matter on one screen.",
    url: postUrl("contractor-lee.bsky.social", "3l2h9i0j8h9"),
    score: 71,
    status: "NOT_RELEVANT",
    matchedOn: ["dashboard"],
    createdAt: daysAgo(4, 9),
  },
  {
    id: "lead-9",
    projectId: "proj-devmetrics",
    postUri: postUri("bootstrapped-omar.bsky.social", "3l2i0j1k9i0"),
    authorHandle: "bootstrapped-omar.bsky.social",
    text: "Metrics I actually care about are buried three menus deep in every tool I've tried. MRR growth, churned users this week, top referral source. That's it. Why do I need a custom SQL query in Amplitude to see that?",
    url: postUrl("bootstrapped-omar.bsky.social", "3l2i0j1k9i0"),
    score: 89,
    status: "NEW",
    matchedOn: ["metrics", "dashboard"],
    createdAt: daysAgo(5, 7),
  },

  // --- InvoiceFlow ---
  {
    id: "lead-10",
    projectId: "proj-invoiceflow",
    postUri: postUri("designer-freelance-jo.bsky.social", "3l3a1b2c0a1"),
    authorHandle: "designer-freelance-jo.bsky.social",
    text: "Chasing a client for payment for the 4th time this month, I'm done doing this manually. Sent the invoice, sent a reminder, sent another reminder. Is there a tool that just automatically nags clients so I don't have to be the bad guy every time?",
    url: postUrl("designer-freelance-jo.bsky.social", "3l3a1b2c0a1"),
    score: 96,
    status: "NEW",
    matchedOn: ["late payment", "invoice"],
    createdAt: hoursAgo(2),
  },
  {
    id: "lead-11",
    projectId: "proj-invoiceflow",
    postUri: postUri("consultant-grace.bsky.social", "3l3b2c3d1b2"),
    authorHandle: "consultant-grace.bsky.social",
    text: "How do you all track which invoices are overdue without a spreadsheet nightmare. I have 14 active clients and my \"invoice tracker\" is a Google Sheet that's already out of date. Need something that just tells me who owes me money right now.",
    url: postUrl("consultant-grace.bsky.social", "3l3b2c3d1b2"),
    score: 90,
    status: "NEW",
    matchedOn: ["invoice", "invoicing"],
    createdAt: hoursAgo(11),
  },
  {
    id: "lead-12",
    projectId: "proj-invoiceflow",
    postUri: postUri("agency-owner-wes.bsky.social", "3l3c3d4e2c3"),
    authorHandle: "agency-owner-wes.bsky.social",
    text: "Lost $4k this year to late-paying clients because I forgot to follow up. It's not that they refuse to pay, I get busy and forget to chase it. Automating the reminder would save me so much money and stress.",
    url: postUrl("agency-owner-wes.bsky.social", "3l3c3d4e2c3"),
    score: 93,
    status: "USEFUL",
    matchedOn: ["late payment"],
    createdAt: daysAgo(1, 6),
  },
  {
    id: "lead-13",
    projectId: "proj-invoiceflow",
    postUri: postUri("photog-nina.bsky.social", "3l3d4e5f3d4"),
    authorHandle: "photog-nina.bsky.social",
    text: "Invoicing software recommendations that don't cost $30/mo for basically a PDF generator? I make maybe 6 invoices a month. Every \"invoicing platform\" wants a monthly subscription for what's basically a template and an email.",
    url: postUrl("photog-nina.bsky.social", "3l3d4e5f3d4"),
    score: 84,
    status: "NEW",
    matchedOn: ["invoicing", "billing"],
    createdAt: daysAgo(1, 16),
  },
  {
    id: "lead-14",
    projectId: "proj-invoiceflow",
    postUri: postUri("copywriter-hana.bsky.social", "3l3e5f6g4e5"),
    authorHandle: "copywriter-hana.bsky.social",
    text: "How awkward do you find it chasing payment from a client you like? Had to send a \"just following up\" email to a client I actually enjoy working with and it made me feel weird all day. Wish this part could just be automated.",
    url: postUrl("copywriter-hana.bsky.social", "3l3e5f6g4e5"),
    score: 77,
    status: "CONTACTED",
    matchedOn: ["chasing payment"],
    createdAt: daysAgo(2, 9),
  },
  {
    id: "lead-15",
    projectId: "proj-invoiceflow",
    postUri: postUri("consultant-farid.bsky.social", "3l3f6g7h5f6"),
    authorHandle: "consultant-farid.bsky.social",
    text: "Built a Zapier hack to remind me about unpaid invoices, still feels fragile. Cobbled together Zapier + Google Sheets, but it breaks every time I change my invoice format. Would pay for something that just works out of the box.",
    url: postUrl("consultant-farid.bsky.social", "3l3f6g7h5f6"),
    score: 80,
    status: "NEW",
    matchedOn: ["invoice", "billing"],
    createdAt: daysAgo(3, 13),
  },
  {
    id: "lead-16",
    projectId: "proj-invoiceflow",
    postUri: postUri("va-services-ren.bsky.social", "3l3g7h8i6g7"),
    authorHandle: "va-services-ren.bsky.social",
    text: "Client \"forgot\" to pay again, this is the third time with this one. At what point do I just build automatic late fees into my contract? I hate having to be the enforcer every single month for the same client.",
    url: postUrl("va-services-ren.bsky.social", "3l3g7h8i6g7"),
    score: 87,
    status: "NEW",
    matchedOn: ["late payment"],
    createdAt: daysAgo(4, 10),
  },
  {
    id: "lead-17",
    projectId: "proj-invoiceflow",
    postUri: postUri("studio-owner-luz.bsky.social", "3l3h8i9j7h8"),
    authorHandle: "studio-owner-luz.bsky.social",
    text: "Anyone else's cash flow a mess purely because of slow invoice payments? My work is fully booked, revenue on paper looks great, but half my invoices are 30+ days overdue at any given time. Cash flow planning is impossible like this.",
    url: postUrl("studio-owner-luz.bsky.social", "3l3h8i9j7h8"),
    score: 73,
    status: "NOT_RELEVANT",
    matchedOn: ["invoice"],
    createdAt: daysAgo(6, 8),
  },

  // --- PingWatch (paused project, sparser + older leads) ---
  {
    id: "lead-18",
    projectId: "proj-pingwatch",
    postUri: postUri("oncall-never-sleeps.bsky.social", "3l4i9j0k8i9"),
    authorHandle: "oncall-never-sleeps.bsky.social",
    text: "Found out about downtime from a customer email, not our monitoring. Our \"monitoring\" is a guy refreshing the status page. 40-minute outage last night and we only knew because a customer asked if we'd shut down. Need real alerting, yesterday.",
    url: postUrl("oncall-never-sleeps.bsky.social", "3l4i9j0k8i9"),
    score: 92,
    status: "NEW",
    matchedOn: ["downtime", "monitoring"],
    createdAt: daysAgo(9, 4),
  },
  {
    id: "lead-19",
    projectId: "proj-pingwatch",
    postUri: postUri("smallteam-sre.bsky.social", "3l4j0k1l9j0"),
    authorHandle: "smallteam-sre.bsky.social",
    text: "Uptime monitoring tools that don't require a PagerDuty-level setup? Team of 3, one app. I don't need on-call rotations and escalation policies, I just need a text when the site is down. Everything on the market is built for a 200-person eng org.",
    url: postUrl("smallteam-sre.bsky.social", "3l4j0k1l9j0"),
    score: 86,
    status: "USEFUL",
    matchedOn: ["uptime", "monitoring"],
    createdAt: daysAgo(10, 15),
  },
  {
    id: "lead-20",
    projectId: "proj-pingwatch",
    postUri: postUri("weekend-launch-theo.bsky.social", "3l4k1l2m0k1"),
    authorHandle: "weekend-launch-theo.bsky.social",
    text: "Server went down for 6 hours over the weekend, nobody noticed until Monday. No alerting set up because \"we'll do it later.\" Lost an entire weekend of signups. Setting up real alerts this week no matter what it costs.",
    url: postUrl("weekend-launch-theo.bsky.social", "3l4k1l2m0k1"),
    score: 81,
    status: "CONTACTED",
    matchedOn: ["server down", "alerting"],
    createdAt: daysAgo(12, 8),
  },
];

export const mockDigestLogs: Record<string, DigestLogEntry[]> = {
  "proj-devmetrics": Array.from({ length: 14 }).map((_, i) => ({
    id: `digest-dm-${i}`,
    projectId: "proj-devmetrics",
    sentAt: daysAgo(13 - i, 8),
    leadCount: [3, 5, 2, 4, 6, 3, 5, 4, 2, 5, 7, 3, 4, 6][i],
    opened: [true, true, false, true, true, true, false, true, true, true, true, false, true, true][i],
  })),
  "proj-invoiceflow": Array.from({ length: 14 }).map((_, i) => ({
    id: `digest-if-${i}`,
    projectId: "proj-invoiceflow",
    sentAt: daysAgo(13 - i, 7),
    leadCount: [2, 4, 3, 3, 5, 4, 2, 3, 4, 6, 3, 2, 4, 5][i],
    opened: [true, true, true, false, true, true, true, false, true, true, true, true, false, true][i],
  })),
  "proj-pingwatch": Array.from({ length: 8 }).map((_, i) => ({
    id: `digest-pw-${i}`,
    projectId: "proj-pingwatch",
    sentAt: daysAgo(13 - i, 9),
    leadCount: [1, 2, 0, 1, 3, 1, 0, 2][i],
    opened: [true, false, true, true, true, false, true, true][i],
  })),
};

export function computeAnalytics(projectId: string | "all"): AnalyticsPoint[] {
  const leads = projectId === "all" ? mockLeads : mockLeads.filter((l) => l.projectId === projectId);
  const points: AnalyticsPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const dayLeads = leads.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= dayStart.getTime() && t < dayEnd.getTime();
    });
    points.push({
      date: dayStart.toISOString().slice(0, 10),
      matches: dayLeads.length,
      useful: dayLeads.filter((l) => l.status === "USEFUL" || l.status === "CONTACTED").length,
      notRelevant: dayLeads.filter((l) => l.status === "NOT_RELEVANT").length,
    });
  }
  return points;
}

export const mockBilling: BillingInfo = {
  plan: "FREE",
  status: "ACTIVE",
  renewsOn: null,
  limits: {
    projects: 3,
    keywordsPerProject: 5,
    scansPerDay: 1,
  },
  usage: {
    projects: mockProjects.length,
    maxKeywordsInProject: Math.max(...mockProjects.map((p) => p.keywords.length)),
    scansToday: 1,
  },
};
