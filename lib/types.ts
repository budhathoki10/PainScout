export type DigestFrequency = "DAILY" | "TWICE_DAILY";
export type LeadStatus = "NEW" | "USEFUL" | "NOT_RELEVANT" | "CONTACTED";
export type PlanTier = "FREE" | "PRO";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";

export interface Project {
  id: string;
  userId: string;
  name: string;
  keywords: string[];
  frequency: DigestFrequency;
  deliveryHour: number;
  paused: boolean;
  createdAt: string;
}

export interface Lead {
  id: string;
  projectId: string;
  postUri: string;
  authorHandle: string;
  text: string;
  url: string;
  score: number;
  status: LeadStatus;
  matchedOn: string[];
  createdAt: string;
}

export interface DigestLogEntry {
  id: string;
  projectId: string;
  sentAt: string;
  leadCount: number;
  opened: boolean;
}

export interface AnalyticsPoint {
  date: string;
  matches: number;
  useful: number;
  notRelevant: number;
}

export interface BillingInfo {
  plan: PlanTier;
  status: SubscriptionStatus;
  renewsOn: string | null;
  limits: {
    projects: number;
    keywordsPerProject: number;
    scansPerDay: number;
  };
  usage: {
    projects: number;
    maxKeywordsInProject: number;
    scansToday: number;
  };
}

export interface AccountInfo {
  name: string;
  email: string;
  image: string | null;
  timezone: string;
  emailDigestOn: boolean;
}
