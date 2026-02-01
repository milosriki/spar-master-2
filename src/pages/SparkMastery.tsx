import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { LeadMagnetSection } from "@/components/landing/LeadMagnetSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const SparkMastery = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <HeroSection />
      <BenefitsSection />
      <LeadMagnetSection />
      <SocialProofSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default SparkMastery;
