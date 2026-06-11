import Link from "next/link";
import { Milk, Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border mt-20">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Milk className="size-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg text-foreground">
                Долина молока
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Натуральная молочная продукция прямо с фермы. Без консервантов,
              без добавок.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Магазин</h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/", label: "Главная" },
                { href: "/catalog", label: "Каталог" },
                { href: "/cart", label: "Корзина" },
                { href: "/orders", label: "Мои заказы" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Документы</h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/privacy", label: "Политика конфиденциальности" },
                { href: "/offer", label: "Публичная оферта" },
                { href: "/contacts", label: "Контакты" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Контакты</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="size-4 text-primary flex-shrink-0" />
                <a href="tel:+74951234567" className="hover:text-primary transition-colors">
                  +7 (495) 123-45-67
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="size-4 text-primary flex-shrink-0" />
                <a href="mailto:hello@dolina-moloka.ru" className="hover:text-primary transition-colors">
                  hello@dolina-moloka.ru
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary flex-shrink-0 mt-0.5" />
                <span>г. Москва, ул. Тверская, 15</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              {["VK", "TG"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="size-9 rounded-xl bg-accent flex items-center justify-center text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="mb-6 bg-border" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Долина молока. Все права защищены.</span>
          <span>ИНН 1234567890 / ОГРН 1231234567890</span>
        </div>
      </div>
    </footer>
  );
}
