import { FeatureGrid } from "@/components/home/feature-grid";
import { HeroSection } from "@/components/home/hero-section";
import { ProcessSection } from "@/components/home/process-section";
import { SocialProofSection } from "@/components/home/social-proof-section";

export default function Home() {
  return (
    <main className="relative min-h-screen text-foreground">
      <HeroSection />
      <FeatureGrid />
      <ProcessSection />
      <SocialProofSection />
    </main>
  );
}
