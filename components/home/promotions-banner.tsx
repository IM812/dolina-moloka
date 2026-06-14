"use client";

import useSWR from "swr";
import Link from "next/link";
import { Tag, ArrowRight, Clock, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Promotion = {
  id: string;
  title: string;
  badge_text: string | null;
  discount_percent: number | null;
  active_until: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function daysLeft(until: string | null): number | null {
  if (!until) return null;
  const diff = new Date(until).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function PromotionsBanner() {
  const { data } = useSWR<{ promotions: Promotion[] }>("/api/promotions?homepage=1", fetcher);
  const [dismissed, setDismissed] = useState(false);

  const promotions = data?.promotions ?? [];
  if (dismissed || promotions.length === 0) return null;

  const first = promotions[0];
  const days = daysLeft(first.active_until);
  const isEnding = days !== null && days <= 5;

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="relative bg-primary rounded-2xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 size-48 rounded-full bg-white" />
            <div className="absolute -bottom-12 left-1/3 size-32 rounded-full bg-white" />
          </div>

          <div className="relative flex items-center justify-between gap-4 px-6 py-5 md:px-8 md:py-6 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Tag className="size-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {first.badge_text && (
                    <span className="text-xs font-bold bg-white text-primary px-2.5 py-0.5 rounded-full">
                      {first.badge_text}
                    </span>
                  )}
                  {isEnding && days !== null && (
                    <span className="text-xs font-medium bg-white/20 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="size-3" />
                      {days === 0 ? "Последний день" : `Ещё ${days} дн.`}
                    </span>
                  )}
                  {promotions.length > 1 && (
                    <span className="text-xs font-medium bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                      +{promotions.length - 1} ещё
                    </span>
                  )}
                </div>
                <p className="text-white font-semibold text-base md:text-lg mt-0.5 leading-snug">
                  {first.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/promotions"
                className="flex items-center gap-2 bg-white text-primary hover:bg-white/90 transition-colors px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                Все акции
                <ArrowRight className="size-4" />
              </Link>
              <button
                onClick={() => setDismissed(true)}
                className="size-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
                aria-label="Скрыть"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
