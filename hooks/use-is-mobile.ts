"use client";

import { useState, useEffect } from "react";

/**
 * Returns true when the viewport is narrower than 768px (md breakpoint).
 * Defaults to false on SSR so the desktop experience is rendered first.
 * Used to completely skip Framer Motion whileInView animations on mobile —
 * these cause double-fire repaints on mobile Safari and Telegram webview.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
