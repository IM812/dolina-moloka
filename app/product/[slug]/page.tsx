import { notFound } from "next/navigation";
import { products } from "@/lib/mock-data";
import { ProductDetailClient } from "@/components/products/product-detail-client";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Продукт не найден" };
  return {
    title: `${product.name} — Долина молока`,
    description: product.description,
  };
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) notFound();

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  return <ProductDetailClient product={product} related={related} />;
}
