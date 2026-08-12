import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewsCard, type NewsCardItem } from "@/components/news/news-card";

export async function NewsSection() {
  let data: NewsCardItem[] | null = null;

  try {
    const supabase = await createClient();
    const res = await supabase
      .from("news")
      .select("id,title,excerpt,image_url,category,published_at")
      .eq("is_active", true)
      .eq("show_on_homepage", true)
      .order("published_at", { ascending: false })
      .limit(3);
    if (res.error) console.error("[news-section] supabase error:", res.error);
    data = res.data;
  } catch (err) {
    console.error("[news-section] unexpected error:", err);
  }

  const news = data ?? [];
  if (news.length === 0) return null;

  return (
    <section className="py-10 sm:py-20 md:py-28 bg-secondary/40">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-end justify-between mb-8 sm:mb-10 flex-wrap gap-4">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-3">
              Новости фермы
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Что у нас нового
            </h2>
          </div>
          <Link
            href="/news"
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Все новости
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {news.map((item, i) => (
            <NewsCard key={item.id} item={item} priority={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
