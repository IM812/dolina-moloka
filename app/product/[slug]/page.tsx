import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetailClient } from "@/components/products/product-detail-client";
import type { Metadata } from "next";
import type { Product } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

function mapProduct(p: any): Product {
  return {
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
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("name, description").eq("slug", slug).single();
  if (!data) return { title: "Продукт не найден" };
  return {
    title: `${data.name} — Долина молока`,
    description: data.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: raw } = await supabase.from("products").select("*").eq("slug", slug).single();
  if (!raw) notFound();

  const product = mapProduct(raw);

  // Related: same category first
  const { data: relatedRaw } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("slug", slug)
    .limit(4);

  let related = (relatedRaw ?? []).map(mapProduct);

  if (related.length < 4) {
    const { data: othersRaw } = await supabase
      .from("products")
      .select("*")
      .neq("category", product.category)
      .neq("slug", slug)
      .limit(4 - related.length);
    related = [...related, ...(othersRaw ?? []).map(mapProduct)];
  }

  return <ProductDetailClient product={product} related={related} />;
}
