import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types";

export async function FeaturedProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("category");

  if (error) console.error("[featured-products] supabase error:", error);

  const products: Product[] = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    fullDescription: p.full_description ?? "",
    price: p.price,
    image: p.image_url ?? "/products/placeholder.png",
    weight: p.volume ?? "",
    composition: p.composition ?? "",
    storageConditions: p.storage_conditions ?? "",
    category: p.category,
    inStock: p.in_stock,
  }));

  return (
    <section className="py-10 sm:py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-end justify-between mb-8 sm:mb-10 flex-wrap gap-4">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-3">
              Ассортимент
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Наша продукция
            </h2>
          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}
