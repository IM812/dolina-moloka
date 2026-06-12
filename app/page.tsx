import { HeroSection } from "@/components/home/hero-section";
import { StorySection } from "@/components/home/story-section";
import { AdvantagesSection } from "@/components/home/advantages-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { QualityBanner } from "@/components/home/quality-banner";
import { HowToOrderSection } from "@/components/home/how-to-order-section";
import { DeliverySection } from "@/components/home/delivery-section";
import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <AdvantagesSection />
      <CategoriesSection />
      <FeaturedProducts />
      <QualityBanner />
      <HowToOrderSection />
      <DeliverySection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
