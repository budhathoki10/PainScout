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
 * without a live MongoDB / Reddit / Resend / Freemius connection.
 */

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number, hourOffset = 9) =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000 - hourOffset * 60 * 60 * 1000).toISOString();

export const DEMO_USER_ID = "demo-user-1";

export const mockAccount: AccountInfo = {
  name: "Alex Rivera",
  email: "demo@reddit-painscout.com",
  image: null,
  timezone: "America/New_York",
  emailDigestOn: true,
};

export const mockProjects: Project[] = [
  {
    id: "proj-devmetrics",
    userId: DEMO_USER_ID,
    name: "DevMetrics — analytics for indie devs",
    subreddits: ["SaaS", "microsaas", "webdev", "IndieHackers"],
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
    subreddits: ["freelance", "smallbusiness", "Entrepreneur"],
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
    subreddits: ["sysadmin", "devops", "webdev"],
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
    redditId: "t3_1a2b3c",
    subreddit: "SaaS",
    title: "Google Analytics is so bloated I've started tracking events in a spreadsheet",
    snippet:
      "Genuinely considering just logging pageviews to a Google Sheet at this point. GA4 dashboard takes 4 clicks to see anything useful and the real-time view lags by minutes. Anyone found a lightweight alternative that doesn't need a data science degree to read?",
    url: "https://reddit.com/r/SaaS/comments/1a2b3c",
    author: "throwaway_founder22",
    score: 94,
    status: "NEW",
    matchedOn: ["dashboard", "analytics"],
    createdAt: hoursAgo(3),
  },
  {
    id: "lead-2",
    projectId: "proj-devmetrics",
    redditId: "t3_2b3c4d",
    subreddit: "microsaas",
    title: "What do you use to track conversion funnels without paying $200/mo?",
    snippet:
      "Mixpanel quoted me $200/mo the second I crossed 10k events. I just want to see where people drop off in my signup flow. Feels like every analytics tool is priced for a Series B company, not someone at $2k MRR.",
    url: "https://reddit.com/r/microsaas/comments/2b3c4d",
    author: "buildinpublic_dana",
    score: 91,
    status: "NEW",
    matchedOn: ["tracking", "analytics"],
    createdAt: hoursAgo(7),
  },
  {
    id: "lead-3",
    projectId: "proj-devmetrics",
    redditId: "t3_3c4d5e",
    subreddit: "IndieHackers",
    title: "My analytics dashboard has become a second full-time job",
    snippet:
      "Between GA, Stripe dashboard, and a Notion doc I copy numbers into every Monday, I spend almost 3 hours a week just aggregating metrics manually. There has to be a better way to get one screen with the numbers that matter.",
    url: "https://reddit.com/r/IndieHackers/comments/3c4d5e",
    author: "solofounder_tim",
    score: 88,
    status: "USEFUL",
    matchedOn: ["dashboard", "metrics"],
    createdAt: daysAgo(1, 5),
  },
  {
    id: "lead-4",
    projectId: "proj-devmetrics",
    redditId: "t3_4d5e6f",
    subreddit: "webdev",
    title: "Client wants \"real-time analytics\" but won't pay for a real BI tool",
    snippet:
      "Anyone got a cheap way to give a client a live-ish dashboard of site traffic and form submissions without wiring up a whole BI stack? They think Google Analytics is \"too complicated\" (their words).",
    url: "https://reddit.com/r/webdev/comments/4d5e6f",
    author: "freelance_dev_kay",
    score: 76,
    status: "USEFUL",
    matchedOn: ["dashboard", "tracking"],
    createdAt: daysAgo(1, 14),
  },
  {
    id: "lead-5",
    projectId: "proj-devmetrics",
    redditId: "t3_5e6f7g",
    subreddit: "SaaS",
    title: "Rant: why is every analytics tool either too simple or way too complex",
    snippet:
      "Plausible is great but I can't get cohort data. Amplitude has everything but it takes a week to configure. Is there literally nothing in between for a 3-person team?",
    url: "https://reddit.com/r/SaaS/comments/5e6f7g",
    author: "grumpy_cto",
    score: 82,
    status: "CONTACTED",
    matchedOn: ["analytics"],
    createdAt: daysAgo(2, 8),
  },
  {
    id: "lead-6",
    projectId: "proj-devmetrics",
    redditId: "t3_6f7g8h",
    subreddit: "microsaas",
    title: "How do you all track feature usage without building it yourself?",
    snippet:
      "I want to know which features people actually click on before I sink 2 more weeks into the roadmap. Built a janky event logger last weekend but it feels like reinventing a wheel that should already exist cheaply.",
    url: "https://reddit.com/r/microsaas/comments/6f7g8h",
    author: "nightbuild_priya",
    score: 79,
    status: "NEW",
    matchedOn: ["tracking", "metrics"],
    createdAt: daysAgo(2, 20),
  },
  {
    id: "lead-7",
    projectId: "proj-devmetrics",
    redditId: "t3_7g8h9i",
    subreddit: "IndieHackers",
    title: "Just canceled Amplitude, back to guessing what users do",
    snippet:
      "$300/mo for a tool I opened twice a month. Cancelled it. Now I genuinely have no visibility into user behavior and it's bugging me. Looking for literally anything cheaper that still shows funnels.",
    url: "https://reddit.com/r/IndieHackers/comments/7g8h9i",
    author: "post_mvp_marcus",
    score: 85,
    status: "NEW",
    matchedOn: ["analytics", "tracking"],
    createdAt: daysAgo(3, 11),
  },
  {
    id: "lead-8",
    projectId: "proj-devmetrics",
    redditId: "t3_8h9i0j",
    subreddit: "webdev",
    title: "Best lightweight alternative to GA4 that a non-technical founder can read?",
    snippet:
      "My founder keeps asking me to \"just check the dashboard\" but GA4's UI makes that a 10-minute task. Want something that shows the 5 numbers that matter on one screen.",
    url: "https://reddit.com/r/webdev/comments/8h9i0j",
    author: "contractor_lee",
    score: 71,
    status: "NOT_RELEVANT",
    matchedOn: ["dashboard"],
    createdAt: daysAgo(4, 9),
  },
  {
    id: "lead-9",
    projectId: "proj-devmetrics",
    redditId: "t3_9i0j1k",
    subreddit: "SaaS",
    title: "Metrics I actually care about are buried three menus deep in every tool I've tried",
    snippet:
      "MRR growth, churned users this week, top referral source. That's it. Why do I need a custom SQL query in Amplitude to see that?",
    url: "https://reddit.com/r/SaaS/comments/9i0j1k",
    author: "bootstrapped_omar",
    score: 89,
    status: "NEW",
    matchedOn: ["metrics", "dashboard"],
    createdAt: daysAgo(5, 7),
  },

  // --- InvoiceFlow ---
  {
    id: "lead-10",
    projectId: "proj-invoiceflow",
    redditId: "t3_a1b2c3",
    subreddit: "freelance",
    title: "Chasing a client for payment for the 4th time this month, I'm done doing this manually",
    snippet:
      "Sent the invoice, sent a reminder, sent another reminder, now I have to have The Conversation again. Is there a tool that just automatically nags clients so I don't have to be the bad guy every time?",
    url: "https://reddit.com/r/freelance/comments/a1b2c3",
    author: "designer_freelance_jo",
    score: 96,
    status: "NEW",
    matchedOn: ["late payment", "invoice"],
    createdAt: hoursAgo(2),
  },
  {
    id: "lead-11",
    projectId: "proj-invoiceflow",
    redditId: "t3_b2c3d4",
    subreddit: "smallbusiness",
    title: "How do you all track which invoices are overdue without a spreadsheet nightmare",
    snippet:
      "I have 14 active clients and my \"invoice tracker\" is a Google Sheet that's already out of date. Need something that just tells me who owes me money right now.",
    url: "https://reddit.com/r/smallbusiness/comments/b2c3d4",
    author: "consultant_grace",
    score: 90,
    status: "NEW",
    matchedOn: ["invoice", "invoicing"],
    createdAt: hoursAgo(11),
  },
  {
    id: "lead-12",
    projectId: "proj-invoiceflow",
    redditId: "t3_c3d4e5",
    subreddit: "Entrepreneur",
    title: "Lost $4k this year to late-paying clients because I forgot to follow up",
    snippet:
      "It's not that they refuse to pay, it's that I get busy and forget to chase it, and by the time I remember it's awkward to bring up. Automating the reminder would save me so much money and stress.",
    url: "https://reddit.com/r/Entrepreneur/comments/c3d4e5",
    author: "agency_owner_wes",
    score: 93,
    status: "USEFUL",
    matchedOn: ["late payment"],
    createdAt: daysAgo(1, 6),
  },
  {
    id: "lead-13",
    projectId: "proj-invoiceflow",
    redditId: "t3_d4e5f6",
    subreddit: "freelance",
    title: "Invoicing software recommendations that don't cost $30/mo for basically a PDF generator",
    snippet:
      "I make maybe 6 invoices a month. Every \"invoicing platform\" wants a monthly subscription for what's basically a template and an email. Feels like a scam at my volume.",
    url: "https://reddit.com/r/freelance/comments/d4e5f6",
    author: "photog_nina",
    score: 84,
    status: "NEW",
    matchedOn: ["invoicing", "billing"],
    createdAt: daysAgo(1, 16),
  },
  {
    id: "lead-14",
    projectId: "proj-invoiceflow",
    redditId: "t3_e5f6g7",
    subreddit: "smallbusiness",
    title: "How awkward do you find it chasing payment from a client you like?",
    snippet:
      "Had to send a \"just following up\" email to a client I actually enjoy working with and it made me feel weird for the rest of the day. Wish this part could just be automated so it's not personal.",
    url: "https://reddit.com/r/smallbusiness/comments/e5f6g7",
    author: "copywriter_hana",
    score: 77,
    status: "CONTACTED",
    matchedOn: ["chasing payment"],
    createdAt: daysAgo(2, 9),
  },
  {
    id: "lead-15",
    projectId: "proj-invoiceflow",
    redditId: "t3_f6g7h8",
    subreddit: "Entrepreneur",
    title: "Built a Zapier hack to remind me about unpaid invoices, still feels fragile",
    snippet:
      "Cobbled together Zapier + Google Sheets to ping me about overdue invoices, but it breaks every time I change my invoice format. Would pay for something that just works out of the box.",
    url: "https://reddit.com/r/Entrepreneur/comments/f6g7h8",
    author: "consultant_farid",
    score: 80,
    status: "NEW",
    matchedOn: ["invoice", "billing"],
    createdAt: daysAgo(3, 13),
  },
  {
    id: "lead-16",
    projectId: "proj-invoiceflow",
    redditId: "t3_g7h8i9",
    subreddit: "freelance",
    title: "Client \"forgot\" to pay again, this is the third time with this one",
    snippet:
      "At what point do I just build automatic late fees into my contract? I hate having to be the enforcer every single month for the same client.",
    url: "https://reddit.com/r/freelance/comments/g7h8i9",
    author: "va_services_ren",
    score: 87,
    status: "NEW",
    matchedOn: ["late payment"],
    createdAt: daysAgo(4, 10),
  },
  {
    id: "lead-17",
    projectId: "proj-invoiceflow",
    redditId: "t3_h8i9j0",
    subreddit: "smallbusiness",
    title: "Anyone else's cash flow a mess purely because of slow invoice payments?",
    snippet:
      "My work is fully booked, revenue on paper looks great, but half my invoices are 30+ days overdue at any given time. Cash flow planning is impossible like this.",
    url: "https://reddit.com/r/smallbusiness/comments/h8i9j0",
    author: "studio_owner_luz",
    score: 73,
    status: "NOT_RELEVANT",
    matchedOn: ["invoice"],
    createdAt: daysAgo(6, 8),
  },

  // --- PingWatch (paused project, sparser + older leads) ---
  {
    id: "lead-18",
    projectId: "proj-pingwatch",
    redditId: "t3_i9j0k1",
    subreddit: "sysadmin",
    title: "Found out about downtime from a customer email, not our monitoring",
    snippet:
      "Our \"monitoring\" is a guy refreshing the status page. Found out about a 40-minute outage last night because a customer emailed asking if we'd shut down. Need real alerting, yesterday.",
    url: "https://reddit.com/r/sysadmin/comments/i9j0k1",
    author: "oncall_never_sleeps",
    score: 92,
    status: "NEW",
    matchedOn: ["downtime", "monitoring"],
    createdAt: daysAgo(9, 4),
  },
  {
    id: "lead-19",
    projectId: "proj-pingwatch",
    redditId: "t3_j0k1l2",
    subreddit: "devops",
    title: "Uptime monitoring tools that don't require a PagerDuty-level setup",
    snippet:
      "Team of 3, one app. I don't need on-call rotations and escalation policies, I just need a text when the site is down. Everything on the market is built for a 200-person eng org.",
    url: "https://reddit.com/r/devops/comments/j0k1l2",
    author: "smallteam_sre",
    score: 86,
    status: "USEFUL",
    matchedOn: ["uptime", "monitoring"],
    createdAt: daysAgo(10, 15),
  },
  {
    id: "lead-20",
    projectId: "proj-pingwatch",
    redditId: "t3_k1l2m3",
    subreddit: "webdev",
    title: "Server went down for 6 hours over the weekend, nobody noticed until Monday",
    snippet:
      "No alerting set up because \"we'll do it later.\" Lost an entire weekend of signups. Setting up real alerts this week no matter what it costs.",
    url: "https://reddit.com/r/webdev/comments/k1l2m3",
    author: "weekend_launch_theo",
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
    subredditsPerProject: 4,
    scansPerDay: 1,
  },
  usage: {
    projects: mockProjects.length,
    maxSubredditsInAnyProject: Math.max(...mockProjects.map((p) => p.subreddits.length)),
    scansToday: 1,
  },
};
