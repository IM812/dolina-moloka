import { CreditCard, Smartphone, ShieldCheck, Lock } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Оплата — Долина Молока",
  description: "Оплата банковской картой Visa, Mastercard, Мир и через СБП. Безопасный интернет-эквайринг.",
};

const methods = [
  {
    icon: <CreditCard className="size-6 text-primary" />,
    title: "Банковской картой",
    desc: "Принимаем карты Visa, Mastercard и Мир. Оплата производится через защищённую платёжную страницу банка. Данные карты передаются в зашифрованном виде по протоколу TLS и не сохраняются на сервере магазина.",
  },
  {
    icon: <Smartphone className="size-6 text-primary" />,
    title: "СБП — Система быстрых платежей",
    desc: "Оплата по QR-коду через мобильное приложение вашего банка. Перевод зачисляется мгновенно. Комиссия для покупателя отсутствует.",
  },
];

const security = [
  "Платёж проходит через защищённое соединение HTTPS / TLS",
  "Данные карты не передаются магазину и не хранятся на сервере",
  "Карты Visa и Mastercard защищены технологией 3-D Secure (Verified by Visa / Mastercard SecureCode)",
  "Карты МИР защищены технологией MirAccept",
  "Эквайринг осуществляет ПАО «Промсвязьбанк» (ПСБ)",
];

const returnPolicy = [
  "Возврат денежных средств осуществляется на карту, с которой была произведена оплата",
  "Срок возврата — от 3 до 30 рабочих дней в зависимости от банка-эмитента",
  "Для оформления возврата свяжитесь с нами по телефону или электронной почте",
];

export default function OplataPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-5 sm:px-6 max-w-4xl py-12 sm:py-20">

        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">
            Безопасная оплата
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
            Способы оплаты
          </h1>
        </div>

        {/* Payment methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {methods.map(({ icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl px-6 py-7 flex flex-col gap-4">
              <div className="size-12 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Card logos */}
        <div className="bg-secondary border border-border rounded-2xl px-6 py-7 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Принимаем к оплате
          </p>
          <div className="flex flex-col gap-5">
            <Image
              src="/payment/logos.png"
              alt="Visa, Mastercard, Мир"
              width={280}
              height={52}
              className="object-contain"
              unoptimized
            />
            <div className="flex items-center gap-3">
              <Image
                src="/payment/sbp.svg"
                alt="СБП — Система быстрых платежей"
                width={72}
                height={28}
                className="object-contain"
                unoptimized
              />
              <span className="text-sm text-muted-foreground">Система быстрых платежей</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-foreground text-background rounded-2xl px-6 py-7 mb-4">
          <div className="flex items-center gap-2.5 mb-5">
            <ShieldCheck className="size-5 text-primary shrink-0" />
            <p className="font-semibold text-background">Безопасность платежей</p>
          </div>
          <ul className="flex flex-col gap-3">
            {security.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-background/75 leading-relaxed">
                <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Return policy */}
        <div className="bg-card border border-border rounded-2xl px-6 py-7 mb-8">
          <div className="flex items-center gap-2.5 mb-5">
            <Lock className="size-5 text-primary shrink-0" />
            <p className="font-semibold text-foreground">Возврат средств</p>
          </div>
          <ul className="flex flex-col gap-3">
            {returnPolicy.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            По вопросам оплаты обращайтесь:
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm font-medium text-foreground">
            <span>+7-916-695-09-88</span>
            <span>dolinamoloka50@gmail.com</span>
          </div>
        </div>

      </div>
    </main>
  );
}
