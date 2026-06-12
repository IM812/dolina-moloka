"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "header" | "footer" | "hero";
  className?: string;
}

/**
 * Brand logo using the real "Долина молока" image.
 * - header / footer: mix-blend-mode multiply removes the white background
 *   so the logo integrates seamlessly on cream/light surfaces.
 * - hero: shown over a dark photo — invert(1) + brightness to turn it white.
 * Framer Motion adds a subtle scale + lift on hover.
 */
export function BrandLogo({ variant = "header", className }: BrandLogoProps) {
  const isHero = variant === "hero";
  const isFooter = variant === "footer";

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center select-none group", className)}
      aria-label="Долина молока — на главную"
    >
      <motion.div
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Subtle glow behind the mark — only on light backgrounds */}
        {!isHero && (
          <div
            className={cn(
              "absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
              isFooter ? "-inset-3" : "-inset-2"
            )}
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(111,169,255,0.18) 0%, transparent 70%)",
            }}
          />
        )}

        <div
          className={cn(
            "relative",
            // Transparent wrapper — no background, no border
            isHero ? "" : ""
          )}
        >
          <Image
            src="/logo.jpg"
            alt="Долина молока"
            width={isFooter ? 220 : 160}
            height={isFooter ? 88 : 64}
            priority
            className={cn(
              "block w-auto object-contain transition-all duration-300 border-0 outline-none",
              isFooter ? "h-[88px]" : "h-[64px]",
              isHero && "brightness-0 invert opacity-95"
            )}
            style={!isHero ? { mixBlendMode: "multiply" } : undefined}
          />
        </div>
      </motion.div>
    </Link>
  );
}
