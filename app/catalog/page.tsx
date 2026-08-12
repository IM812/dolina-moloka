import { createClient } from "@/lib/supabase/server";
import { CatalogClient } from "@/components/products/catalog-client";
import type { Product } from "@/types";

export const revalidate = 60;

export default async function CatalogPage() {
  let data: any[] | null = null;

  try {
    const supabase = await createClient();
    const res = await supabase.from("products").select("*").order("category");
    if (res.error) console.error("[catalog] supabase error:", res.error);
    data = res.data;
  } catch (err) {
    // Временный сбой сети/соединения с Supabase — показываем пустой каталог,
    // а не роняем всю страницу.
    console.error("[catalog] unexpected error:", err);
  }

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

  return <CatalogClient products={products} />;
}
