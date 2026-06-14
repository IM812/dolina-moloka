import { createClient } from "@/lib/supabase/server";
import { CatalogClient } from "@/components/products/catalog-client";
import type { Product } from "@/types";

export const revalidate = 60;

export default async function CatalogPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("category");

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

  if (error) console.error("[catalog] supabase error:", error);

  return <CatalogClient products={products} />;
}
