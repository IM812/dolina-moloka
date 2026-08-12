import { HeroSection } from "@/components/home/hero-section";
import { StorySection } from "@/components/home/story-section";
import { AdvantagesSection } from "@/components/home/advantages-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewsSection } from "@/components/home/news-section";
import { AboutSection } from "@/components/home/about-section";
import { QualityBanner } from "@/components/home/quality-banner";
import { CtaSection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <AdvantagesSection />
      <FeaturedProducts />
      <NewsSection />
      <AboutSection />
      <QualityBanner />
      <CtaSection />
    </>
  );
}
