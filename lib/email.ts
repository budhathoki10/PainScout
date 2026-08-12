import { Resend } from "resend";
import DigestEmail, { type DigestEmailLead } from "@/components/emails/digest-email";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set. Add it to .env to enable digest delivery (see README).");
  }
  return new Resend(apiKey);
}

export interface SendDigestArgs {
  to: string;
  projectName: string;
  leads: DigestEmailLead[];
  dashboardUrl: string;
}

export async function sendDigestEmail({ to, projectName, leads, dashboardUrl }: SendDigestArgs) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "Pain Scout <digest@resend.dev>";

  return resend.emails.send({
    from,
    to,
    subject: `${leads.length} new lead${leads.length === 1 ? "" : "s"} for ${projectName}`,
    react: DigestEmail({ projectName, leads, dashboardUrl }),
  });
}
