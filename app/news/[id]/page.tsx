import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type NewsDetail = {
  id: string;
  title: string;
  excerpt: string;
  image_url: string | null;
  category: string | null;
  published_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function getNewsItem(id: string): Promise<NewsDetail | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news")
      .select("id,title,excerpt,image_url,category,published_at")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
    if (error) {
      console.error("[news-detail] supabase error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("[news-detail] unexpected error:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getNewsItem(id);
  if (!item) return { title: "Новость не найдена | Долина Молока" };
  return {
    title: `${item.title} | Долина Молока`,
    description: item.excerpt,
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getNewsItem(id);
  if (!item) notFound();

  return (
    <main className="py-10 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="size-4" />
          Все новости
        </Link>

        <div className="mb-6">
          {item.category && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] bg-secondary text-foreground px-2.5 py-1 rounded-full inline-block mb-4">
              {item.category}
            </span>
          )}
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-balance mb-3">
            {item.title}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
          </div>
        </div>

        {item.image_url && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-secondary mb-8">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <p className="text-base sm:text-lg text-foreground/90 leading-relaxed whitespace-pre-line">
          {item.excerpt}
        </p>
      </div>
    </main>
  );
}
