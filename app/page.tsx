import { HeroSection } from "@/components/home/hero-section";
import { StorySection } from "@/components/home/story-section";
import { AdvantagesSection } from "@/components/home/advantages-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { PromotionsBanner } from "@/components/home/promotions-banner";
import { AboutSection } from "@/components/home/about-section";
import { QualityBanner } from "@/components/home/quality-banner";
import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PromotionsBanner />
      <StorySection />
      <AdvantagesSection />
      <CategoriesSection />
      <FeaturedProducts />
      <AboutSection />
      <QualityBanner />
      <FaqSection />
      <CtaSection />
    </>
  );
}
