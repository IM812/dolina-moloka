import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewsCard, type NewsCardItem } from "@/components/news/news-card";
import { Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Новости фермы | Долина Молока",
  description: "Свежие новости, события и истории с фермы Долина Молока.",
};

export default async function NewsPage() {
  let data: NewsCardItem[] | null = null;

  try {
    const supabase = await createClient();
    const res = await supabase
      .from("news")
      .select("id,title,excerpt,image_url,category,published_at")
      .eq("is_active", true)
      .order("published_at", { ascending: false });
    if (res.error) console.error("[news-page] supabase error:", res.error);
    data = res.data;
  } catch (err) {
    console.error("[news-page] unexpected error:", err);
  }

  const news = data ?? [];

  return (
    <main className="py-10 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="mb-8 sm:mb-12">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-3">
            Долина Молока
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
            Новости фермы
          </h1>
        </div>

        {news.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 border border-dashed border-border rounded-2xl">
            <Newspaper className="size-10 text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-muted-foreground text-sm sm:text-base">
              Пока новостей нет. Загляните позже — мы обязательно расскажем о новом на ферме.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {news.map((item, i) => (
              <NewsCard key={item.id} item={item} priority={i < 3} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
