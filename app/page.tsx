import { HeroSection } from "@/components/home/hero-section";
import { StorySection } from "@/components/home/story-section";
import { AdvantagesSection } from "@/components/home/advantages-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { AboutSection } from "@/components/home/about-section";
import { QualityBanner } from "@/components/home/quality-banner";
import { CtaSection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <AdvantagesSection />
      <CategoriesSection />
      <FeaturedProducts />
      <AboutSection />
      <QualityBanner />
      <CtaSection />
    </>
  );
}
