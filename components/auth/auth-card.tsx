import Link from "next/link";
import { ScanEye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
}

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <Card className="gap-0 py-0 shadow-sm [--card-spacing:--spacing(10)]">
      <CardHeader className="justify-items-center gap-0 pt-10 pb-2 text-center">
        <Link
          href="/"
          className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
        >
          <ScanEye className="size-7" strokeWidth={2.2} />
        </Link>
        <CardTitle className="mt-5 text-2xl">{title}</CardTitle>
        <CardDescription className="mt-1.5 text-base text-pretty">{description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-6 pb-10">{children}</CardContent>

      <div className="border-t border-border bg-muted/30 px-10 py-5 text-center text-sm text-muted-foreground">
        {footerText}{" "}
        <Link href={footerLinkHref} className="font-medium text-foreground hover:underline">
          {footerLinkLabel}
        </Link>
      </div>
    </Card>
  );
}
