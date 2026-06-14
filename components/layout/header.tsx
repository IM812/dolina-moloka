"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/layout/brand-logo";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/promotions", label: "Акции" },
  { href: "/delivery", label: "Доставка" },
  { href: "/orders", label: "Заказы" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemsCount = useCartStore((s) => s.getItemsCount());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 bg-background/90 backdrop-blur-xl",
        scrolled ? "shadow-sm border-b border-border" : "border-b border-transparent"
      )}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <BrandLogo variant="header" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart + Burger */}
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="outline" size="icon" className="relative size-10 border-border">
                <ShoppingCart className="size-4" />
                {itemsCount > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 size-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
                    {itemsCount > 99 ? "99+" : itemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <button
              className="md:hidden size-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Меню"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden border-b border-border bg-background overflow-hidden transition-all duration-200",
          mobileOpen ? "max-h-96 border-t" : "max-h-0 border-t-0"
        )}
      >
        <nav className="container mx-auto px-4 py-3 flex flex-col gap-1 max-w-7xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2">
            <ShoppingCart className="size-4" />
            Корзина
            {itemsCount > 0 && (
              <Badge className="bg-primary text-primary-foreground border-0 text-xs">{itemsCount}</Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
