"use client";

import useSWR from "swr";
import { Tag, Clock, Percent, Gift, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type Promotion = {
  id: string;
  title: string;
  description: string | null;
  badge_text: string | null;
  image_url: string | null;
  discount_percent: number | null;
  active_from: string | null;
  active_until: string | null;
  is_active: boolean;
  show_on_homepage: boolean;
  created_at: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function daysLeft(until: string | null): number | null {
  if (!until) return null;
  const diff = new Date(until).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function PromotionCard({ promo }: { promo: Promotion }) {
  const days = daysLeft(promo.active_until);
  const isEnding = days !== null && days <= 5;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
      {/* Top color bar */}
      <div className="h-1.5 bg-primary w-full" />

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          {promo.badge_text && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">
              {promo.discount_percent ? <Percent className="size-3" /> : <Gift className="size-3" />}
              {promo.badge_text}
            </span>
          )}
          {isEnding && days !== null && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
              <Clock className="size-3" />
              {days === 0 ? "Последний день" : `Осталось ${days} дн.`}
            </span>
          )}
        </div>

        {/* Title + description */}
        <div className="flex-1">
          <h3 className="font-heading text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {promo.title}
          </h3>
          {promo.description && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {promo.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="text-xs text-muted-foreground">
            {promo.active_from && promo.active_until ? (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatDate(promo.active_from)} — {formatDate(promo.active_until)}
              </span>
            ) : promo.active_until ? (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                до {formatDate(promo.active_until)}
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Бессрочная</span>
            )}
          </div>
          <Button
            render={<Link href="/catalog" />}
            size="sm"
            variant="outline"
            className="gap-1.5 border-border text-xs h-8"
          >
            В каталог
            <ArrowRight className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function PromotionCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="h-1.5 bg-secondary w-full" />
      <div className="p-6 flex flex-col gap-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-4 border-t border-border flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const { data, isLoading } = useSWR<{ promotions: Promotion[] }>("/api/promotions", fetcher);
  const promotions = data?.promotions ?? [];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-secondary border-b border-border py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Tag className="size-5 text-primary" />
            </div>
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
              Специальные предложения
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-3">
            Акции и скидки
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
            Выгодные предложения на нашу продукцию. Следите за обновлениями — новые акции появляются регулярно.
          </p>
        </div>
      </section>

      {/* Promotions grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <PromotionCardSkeleton key={i} />)}
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-24">
              <div className="size-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Tag className="size-7 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Акций пока нет</h2>
              <p className="text-muted-foreground">Следите за обновлениями — скоро появятся выгодные предложения</p>
              <Button render={<Link href="/catalog" />} className="gap-2 mt-6">
                Перейти в каталог <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <PromotionCard key={promo.id} promo={promo} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
