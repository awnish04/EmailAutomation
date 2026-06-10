import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/sections/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { IntegrationsSection } from "@/components/sections/Integrationssection"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { FaqSection } from "@/components/sections/faq-section"
import { CtaSection } from "@/components/sections/cta-section"
import { FooterSection } from "@/components/sections/footer-section"

export default function Home() {
  return (
    <>
      {/* ── Fixed navigation ── */}
      <Navbar />

      <main className="w-full">
        {/* 1. Hero — world map background + headline + CTAs */}
        <HeroSection />

        {/* 2. Stats bar — animated numbers */}
        <StatsSection />

        {/* 3. Features — 6 feature cards */}
        <FeaturesSection />

        {/* 4. How it works — email flow diagram + activity log + AI hub */}
        <IntegrationsSection />

        {/* 5. Testimonials — dual-row marquee */}
        <TestimonialsSection />

        {/* 6. Pricing — 3 tiers + monthly/annual toggle */}
        <PricingSection />

        {/* 7. FAQ — accordion */}
        <FaqSection />

        {/* 8. CTA — final conversion section */}
        <CtaSection />
      </main>

      {/* 9. Footer — 4-column with social links */}
      <FooterSection />
    </>
  )
}
