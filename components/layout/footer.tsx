import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BrandLogo } from "@/components/layout/brand-logo";

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border mt-12 sm:mt-20">
      <div className="container mx-auto px-5 sm:px-4 max-w-7xl py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <BrandLogo variant="footer" className="mb-5" />
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
                <a href="tel:+79166950988" className="hover:text-primary transition-colors">
                  +7-916-695-09-88
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="size-4 text-primary flex-shrink-0" />
                <a href="mailto:inevolin228@mail.ru" className="hover:text-primary transition-colors">
                  inevolin228@mail.ru
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Моск. обл., г.о. Дмитровский, дер. Саввино</span>
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
          <span>ИП Прямова Анна Александровна. ИНН 504209373809 / ОГРНИП 309504234800012</span>
        </div>
      </div>
    </footer>
  );
}
