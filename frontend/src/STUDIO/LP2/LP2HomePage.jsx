import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { BenefitsSection } from "./BenefitsSection";
import { UseCasesSection } from "./UseCasesSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { PricingSection } from "./PricingSection";
import { FinalCTASection } from "./FinalCTASection";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { StatsSection } from "./StatsSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { Header2 } from "./Header2";
import React, { useRef, useContext } from "react";
import { AuthContext } from "../../Navbar/AuthContext";

export default function LP2HomePage() {
  const pricingRef = useRef(null);
  const { isLoggedIn } = useContext(AuthContext); // get login status

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {isLoggedIn ? <Header2 /> : <Header />} {/* conditional header */}
      <HeroSection onScrollToPricing={scrollToPricing} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <UseCasesSection />
      <TestimonialsSection />
      <div ref={pricingRef}>
        <PricingSection />
      </div>
      <FinalCTASection onScrollToPricing={scrollToPricing} />
      <Footer />
    </div>
  );
}
