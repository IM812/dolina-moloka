import { CreditCard, Smartphone, Banknote, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Оплата — Долина Молока",
  description: "Способы оплаты заказов молочной продукции. Оплата картой онлайн, СБП, наличными при получении.",
};

const methods = [
  {
    icon: <CreditCard className="size-6 text-primary" />,
    title: "Банковская карта онлайн",
    desc: "Visa, Mastercard, Мир. Оплата проходит при оформлении заказа на сайте. Данные карты защищены шифрованием.",
  },
  {
    icon: <Smartphone className="size-6 text-primary" />,
    title: "СБП — Система быстрых платежей",
    desc: "Оплатите по QR-коду или ссылке через приложение любого банка. Мгновенное зачисление, без комиссии.",
  },
  {
    icon: <Banknote className="size-6 text-primary" />,
    title: "Наличными при получении",
    desc: "Оплата наличными при получении заказа на точке выдачи. Подготовьте точную сумму для удобства.",
  },
];

const guarantees = [
  "Все платежи проходят через защищённое соединение HTTPS",
  "Данные карты не хранятся на нашем сервере",
  "Возврат средств в течение 3 рабочих дней при отмене заказа",
  "При проблемах с оплатой — свяжитесь с нами по телефону",
];

export default function OplataPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-5 sm:px-6 max-w-7xl py-12 sm:py-20">

        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">
            Удобно и безопасно
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
              Способы оплаты
            </h1>
            <Link href="/catalog" className="shrink-0">
              <Button className="gap-2 rounded-full h-11 px-6 bg-primary text-primary-foreground">
                Перейти к заказу
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Payment methods */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden mb-6">
          {methods.map(({ icon, title, desc }) => (
            <div key={title} className="bg-background px-5 py-6 sm:px-8 sm:py-10 flex flex-col gap-4">
              <div className="size-12 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Logos + guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
          {/* Logos block */}
          <div className="bg-secondary border border-border rounded-2xl px-5 py-6 flex flex-col gap-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Принимаем карты</p>
            <Image
              src="/payment/logos.png"
              alt="Visa, Mastercard, Мир"
              width={320}
              height={60}
              className="object-contain"
            />
            <div className="flex items-center gap-3">
              <Image
                src="/payment/sbp.svg"
                alt="СБП"
                width={80}
                height={32}
                className="object-contain"
              />
              <span className="text-sm text-muted-foreground">Система быстрых платежей</span>
            </div>
          </div>

          {/* Guarantees */}
          <div className="bg-foreground text-background rounded-2xl px-5 py-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary shrink-0" />
              <p className="text-sm font-semibold text-background">Гарантии безопасности</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {guarantees.map((g) => (
                <li key={g} className="flex items-start gap-2.5 text-sm text-background/75">
                  <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/* Return policy */}
          <div className="flex items-center gap-4 bg-primary/8 border border-primary/15 rounded-2xl px-5 py-5">
            <div className="size-2.5 rounded-full bg-primary shrink-0" />
            <p className="text-sm text-foreground">Возврат товара в течение 24 часов при нарушении условий хранения</p>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-4 bg-foreground text-background rounded-2xl px-5 py-5">
            <div className="size-2.5 rounded-full bg-primary shrink-0" />
            <p className="text-sm text-background/80">По вопросам оплаты: <span className="font-semibold text-background">+7-916-695-09-88</span></p>
          </div>
        </div>

      </div>
    </main>
  );
}
