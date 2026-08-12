import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface DigestEmailLead {
  authorHandle: string;
  text: string;
  url: string;
  score: number;
}

interface DigestEmailProps {
  projectName: string;
  leads: DigestEmailLead[];
  dashboardUrl: string;
}

const ACCENT = "#059669";
const INK = "#18181b";
const MUTED = "#71717a";
const BORDER = "#e4e4e7";

export default function DigestEmail({ projectName, leads, dashboardUrl }: DigestEmailProps) {
  const previewText = `${leads.length} new lead${leads.length === 1 ? "" : "s"} for ${projectName}`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 560, padding: 32, margin: "0 auto" }}>
          <Text style={{ fontSize: 13, fontWeight: 700, color: ACCENT, letterSpacing: 0.4, textTransform: "uppercase", margin: "0 0 8px" }}>
            Pain Scout
          </Text>
          <Heading style={{ fontSize: 20, color: INK, margin: "0 0 4px" }}>
            {leads.length} new lead{leads.length === 1 ? "" : "s"} for {projectName}
          </Heading>
          <Text style={{ fontSize: 14, color: MUTED, margin: "0 0 24px" }}>
            Today&apos;s top matches, ranked by relevance.
          </Text>

          {leads.map((lead, i) => (
            <Section key={i} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: ACCENT, fontWeight: 600, margin: "0 0 4px" }}>
                @{lead.authorHandle} · {lead.score}% match
              </Text>
              <Link href={lead.url} style={{ fontSize: 15, fontWeight: 600, color: INK, textDecoration: "none" }}>
                {lead.text}
              </Link>
              {i < leads.length - 1 && <Hr style={{ borderColor: BORDER, margin: "20px 0 0" }} />}
            </Section>
          ))}

          <Hr style={{ borderColor: BORDER, margin: "8px 0 20px" }} />
          <Link
            href={dashboardUrl}
            style={{
              display: "inline-block",
              backgroundColor: ACCENT,
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 18px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Open dashboard
          </Link>
          <Text style={{ fontSize: 12, color: MUTED, marginTop: 24 }}>
            You&apos;re receiving this because you have an active project on Pain Scout.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
