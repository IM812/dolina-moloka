import { HeroSection } from "@/components/home/hero-section";
import { ProductCard } from "@/components/products/product-card";
import { AdvantagesSection } from "@/components/home/advantages-section";
import { HowToOrderSection } from "@/components/home/how-to-order-section";
import { DeliverySection } from "@/components/home/delivery-section";

import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";
import { products } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Featured products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                Наши продукты
              </h2>
              <p className="text-muted-foreground mt-2">
                Свежая молочка с фермы каждую неделю
              </p>
            </div>
            <Link href="/catalog" className="hidden sm:block">
              <Button variant="outline" className="gap-2 border-border">
                Весь каталог
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex justify-center sm:hidden">
            <Link href="/catalog">
              <Button variant="outline" className="gap-2 border-border w-full">
                Весь каталог
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <AdvantagesSection />
      <HowToOrderSection />
      <DeliverySection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
