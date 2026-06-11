import { HeroSection } from "@/components/home/hero-section";
import { TrustStats } from "@/components/home/trust-stats";
import { StorySection } from "@/components/home/story-section";
import { AdvantagesSection } from "@/components/home/advantages-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { QualityBanner } from "@/components/home/quality-banner";
import { MarqueeReviews } from "@/components/home/marquee-reviews";
import { HowToOrderSection } from "@/components/home/how-to-order-section";
import { DeliverySection } from "@/components/home/delivery-section";
import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStats />
      <StorySection />
      <AdvantagesSection />
      <CategoriesSection />
      <FeaturedProducts />
      <QualityBanner />
      <MarqueeReviews />
      <HowToOrderSection />
      <DeliverySection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
