"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "header" | "footer" | "hero";
  className?: string;
}

/**
 * Inline SVG brand identity for "Долина молока".
 * Renders cleanly on any background — no white JPG halo.
 * - header: compact horizontal, navy mark + wordmark
 * - footer: larger stacked version on dark/light bg
 * - hero: white monochrome for use over images
 */
export function BrandLogo({ variant = "header", className }: BrandLogoProps) {
  const isHero = variant === "hero";
  const isFooter = variant === "footer";

  const markColor = isHero ? "#ffffff" : "#1a3c6e";
  const accentColor = isHero ? "rgba(255,255,255,0.7)" : "#6FA9FF";
  const textColor = isHero ? "#ffffff" : "#1a3c6e";
  const subColor = isHero ? "rgba(255,255,255,0.65)" : "#5a8abf";
  const dividerColor = isHero ? "rgba(255,255,255,0.35)" : "#6FA9FF";

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center group select-none", className)}
      aria-label="Долина молока — на главную"
    >
      <motion.div
        className="flex items-center gap-3"
        whileHover="hover"
        initial="rest"
      >
        {/* Illustrated mark: water-drop with pastoral scene */}
        <motion.svg
          viewBox="0 0 56 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "flex-shrink-0",
            isFooter ? "w-12 h-16" : "w-9 h-12"
          )}
          variants={{
            rest: { rotate: 0 },
            hover: { rotate: -4, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {/* Drop outline */}
          <path
            d="M28 2C28 2 6 28 6 44C6 56.15 15.85 66 28 66C40.15 66 50 56.15 50 44C50 28 28 2 28 2Z"
            fill={accentColor}
            fillOpacity={isHero ? 0.18 : 0.13}
            stroke={markColor}
            strokeWidth="1.8"
          />
          {/* Rolling hills inside drop */}
          <path
            d="M10 50 Q18 40 26 44 Q34 48 44 42 L46 50 Q34 52 26 48 Q18 54 10 50Z"
            fill={markColor}
            fillOpacity="0.15"
          />
          <path
            d="M10 52 Q20 44 28 47 Q36 50 46 44 L46 54 Q36 56 28 52 Q18 58 10 54Z"
            fill={markColor}
            fillOpacity="0.25"
          />
          {/* Milk stream / river path */}
          <path
            d="M24 65 Q26 56 28 50 Q30 44 28 40"
            stroke={markColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            fillOpacity="0"
          />
          {/* Cow silhouette (simplified) */}
          <ellipse cx="22" cy="38" rx="4.5" ry="2.5" fill={markColor} fillOpacity="0.55" />
          <rect x="19.5" y="40" width="1.5" height="3" rx="0.75" fill={markColor} fillOpacity="0.55" />
          <rect x="22" y="40" width="1.5" height="3" rx="0.75" fill={markColor} fillOpacity="0.55" />
          <rect x="24" y="40" width="1.5" height="3" rx="0.75" fill={markColor} fillOpacity="0.55" />
          <ellipse cx="26" cy="38" rx="2" ry="1.8" fill={markColor} fillOpacity="0.55" />
          {/* Tree */}
          <rect x="34" y="36" width="1.5" height="6" rx="0.75" fill={markColor} fillOpacity="0.45" />
          <ellipse cx="34.75" cy="34" rx="3" ry="4" fill={markColor} fillOpacity="0.35" />
          {/* Milk splash at bottom */}
          <path
            d="M16 60 Q20 55 24 58 Q28 61 32 57 Q36 53 40 58"
            stroke={markColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
          {/* Top drop highlight */}
          <ellipse cx="22" cy="20" rx="2.5" ry="4" fill={markColor} fillOpacity="0.12" transform="rotate(-20 22 20)" />
        </motion.svg>

        {/* Wordmark */}
        <div className={cn("flex flex-col leading-none", isFooter && "gap-1")}>
          <motion.span
            className={cn(
              "font-heading font-bold tracking-tight text-balance",
              isFooter ? "text-2xl" : "text-xl",
            )}
            style={{ color: textColor }}
            variants={{
              rest: {},
              hover: { x: 2, transition: { duration: 0.25 } },
            }}
          >
            Долина молока
          </motion.span>

          {/* Divider + tagline */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn("block h-px flex-1", isFooter ? "w-8" : "w-5")}
              style={{ backgroundColor: dividerColor, opacity: 0.6 }}
            />
            <span
              className={cn(
                "font-sans uppercase tracking-widest font-medium",
                isFooter ? "text-[9px]" : "text-[7.5px]"
              )}
              style={{ color: subColor }}
            >
              Натурально. Свежо.
            </span>
            <span
              className={cn("block h-px flex-1", isFooter ? "w-8" : "w-5")}
              style={{ backgroundColor: dividerColor, opacity: 0.6 }}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
