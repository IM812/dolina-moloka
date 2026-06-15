import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Контакты — Долина молока",
  description: "Свяжитесь с нами для оформления заказа или получения информации о продукции.",
};

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-secondary py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground text-balance">Контакты</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-xl mx-auto">
            Мы всегда рады ответить на ваши вопросы и помочь с выбором
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact cards */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 flex flex-col gap-5">
              <h2 className="text-lg font-semibold text-foreground">Свяжитесь с нами</h2>
              <Separator className="bg-border" />
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Phone className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Телефон</p>
                  <a href="tel:+79166950988" className="font-semibold text-foreground hover:text-primary transition-colors">
                    +7-916-695-09-88
                  </a>
                  <p className="text-xs text-muted-foreground">Принимаем заказы: Max / Telegram</p>
                </div>
              </div>

              {/* Messengers */}
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <MessageCircle className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Max / Telegram</p>
                  <div className="flex gap-3 mt-1">
                    <a
                      href="https://vk.me/+79166950988"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-2"
                    >
                      Написать в Max
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Ссылка на Telegram появится позже</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Mail className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <a href="mailto:dolinamoloka50@gmail.com" className="font-semibold text-foreground hover:text-primary transition-colors">
                    dolinamoloka50@gmail.com
                  </a>
                  <p className="text-xs text-muted-foreground">Ответим в течение 1 рабочего дня</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address + hours */}
          <div className="flex flex-col gap-5">
            <Card className="border-border shadow-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="size-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <MapPin className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Адрес фермы</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Московская область, г.о. Дмитровский,
                    <br />
                    дер. Саввино (возле МТК &laquo;Саввино&raquo;)
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Самовывоз возможен по предварительной договорённости
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="size-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Clock className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Время работы</h2>
                  <div className="flex flex-col gap-1.5 mt-2 text-sm">
                    {[
                      { days: "Пн–Пт", hours: "9:00 – 17:00" },
                      { days: "Сб–Вс", hours: "9:00 – 15:00" },
                    ].map(({ days, hours }) => (
                      <div key={days} className="flex justify-between gap-8">
                        <span className="text-muted-foreground">{days}</span>
                        <span className="font-medium text-foreground">{hours}</span>
                      </div>
                    ))}
                    <Separator className="bg-border my-1" />
                    <p className="text-xs text-muted-foreground">
                      Заказы принимаем круглосуточно через сайт
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm bg-accent">
              <CardContent className="p-6">
                <p className="text-sm text-foreground font-medium">
                  Доставка по Москве и области
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Дни доставки: среда и суббота. Минимальный заказ 600 ₽.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
