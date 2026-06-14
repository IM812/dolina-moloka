"use client";

import { useEffect, useState } from "react";

export type Promotion = {
  id: string;
  title: string;
  description: string | null;
  badge_text: string | null;
  discount_percent: number | null;
  active_from: string | null;
  active_until: string | null;
  is_active: boolean;
  show_on_homepage: boolean;
};

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then((data) => setPromotions(data.promotions ?? []))
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false));
  }, []);

  return { promotions, loading };
}

/** Returns the best (highest savings) currently active promotion with a discount_percent */
export function getBestDiscount(
  promotions: Promotion[],
  subtotal: number
): { promotion: Promotion | null; discountAmount: number; finalTotal: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const active = promotions.filter((p) => {
    if (!p.is_active || !p.discount_percent) return false;
    if (p.active_from) {
      const from = new Date(p.active_from);
      from.setHours(0, 0, 0, 0);
      if (today < from) return false;
    }
    if (p.active_until) {
      const until = new Date(p.active_until);
      until.setHours(23, 59, 59, 999);
      if (today > until) return false;
    }
    return true;
  });

  if (active.length === 0) {
    return { promotion: null, discountAmount: 0, finalTotal: subtotal };
  }

  // Pick the one giving the biggest absolute savings
  const best = active.reduce((prev, cur) =>
    (cur.discount_percent ?? 0) > (prev.discount_percent ?? 0) ? cur : prev
  );

  const discountAmount = Math.round(subtotal * (best.discount_percent! / 100));
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return { promotion: best, discountAmount, finalTotal };
}
