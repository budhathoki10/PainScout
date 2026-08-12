import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { ValueStrip } from "@/components/landing/value-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <ValueStrip />
        <HowItWorks />
        <Pricing />
      </main>
      <LandingFooter />
    </div>
  );
}
