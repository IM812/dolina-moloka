"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "header" | "footer" | "hero";
  className?: string;
}

/**
 * Brand logo — mobile-safe version.
 *
 * The JPG has a white background. On desktop we use mix-blend-mode:multiply
 * so the white dissolves into the cream page. On mobile, Safari's WebKit
 * breaks blend modes when the parent has backdrop-filter (backdrop-blur),
 * so we wrap the image in a white rounded box that looks intentional
 * instead of broken.
 */
export function BrandLogo({ variant = "header", className }: BrandLogoProps) {
  const isHero = variant === "hero";
  const isFooter = variant === "footer";

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center select-none", className)}
      aria-label="Долина молока — на главную"
    >
      {/* Desktop: multiply blend removes white bg seamlessly.
          Mobile: white rounded card — looks clean, no glitch. */}
      <div
        className={cn(
          "relative transition-opacity duration-200 active:opacity-70",
          // Mobile: white pill card so the logo reads cleanly
          !isHero && "rounded-xl bg-white p-1 md:bg-transparent md:p-0 md:[&>img]:[mix-blend-mode:multiply]"
        )}
      >
        <Image
          src="/logo.jpg"
          alt="Долина молока"
          width={isFooter ? 200 : 150}
          height={isFooter ? 80 : 60}
          priority={!isFooter}
          className={cn(
            "block w-auto object-contain border-0",
            isFooter ? "h-[72px]" : "h-[52px] md:h-[56px]",
            isHero && "brightness-0 invert opacity-90"
          )}
        />
      </div>
    </Link>
  );
}
