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
  { href: "/delivery", label: "Доставка" },
  { href: "/oplata", label: "Оплата" },
  { href: "/orders", label: "Заказы" },
  { href: "/documents", label: "Документы" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemsCount = useCartStore((s) => s.getItemsCount());
  // Корзина хранится в localStorage, поэтому на сервере она всегда пуста.
  // Показываем счётчик только после монтирования — иначе React ругается
  // на несовпадение серверной и клиентской разметки и перерисовывает шапку.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            {/* Кнопка-ссылка рендерится как <a>: <button> внутри <a> — невалидная
                вложенность, и Safari на iOS не открывает такую ссылку по тапу. */}
            <Button
              render={<Link href="/cart" aria-label="Корзина" />}
              variant="outline"
              size="icon"
              className="relative size-10 border-border"
            >
              <ShoppingCart className="size-4" />
              {mounted && itemsCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 size-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
                  {itemsCount > 99 ? "99+" : itemsCount}
                </Badge>
              )}
            </Button>

            <button
              type="button"
              className="md:hidden size-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Меню"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          // max-h-96 обрезал последний пункт («Корзина») на узких экранах, а
          // overflow-hidden не давал до него доскроллить. Теперь высота считается
          // от вьюпорта (dvh учитывает адресную строку Safari), а список скроллится.
          "md:hidden border-b border-border bg-background transition-all duration-200",
          mobileOpen
            ? "max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain border-t"
            : "max-h-0 overflow-hidden border-t-0"
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
            {/* mounted — иначе разметка сервера и клиента расходится и React
                перемонтирует шапку, теряя обработчик кнопки меню */}
            {mounted && itemsCount > 0 && (
              <Badge className="bg-primary text-primary-foreground border-0 text-xs">{itemsCount}</Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
