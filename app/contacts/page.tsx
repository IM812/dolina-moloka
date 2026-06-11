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
              {[
                {
                  icon: <Phone className="size-5 text-primary" />,
                  label: "Телефон",
                  value: "+7 (800) 123-45-67",
                  sub: "Бесплатно по России",
                },
                {
                  icon: <MessageCircle className="size-5 text-primary" />,
                  label: "WhatsApp / Telegram",
                  value: "+7 (900) 000-00-00",
                  sub: "Принимаем заказы в мессенджерах",
                },
                {
                  icon: <Mail className="size-5 text-primary" />,
                  label: "E-mail",
                  value: "info@dolina-moloka.ru",
                  sub: "Ответим в течение 1 рабочего дня",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-semibold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
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
                    Московская область, Сергиево-Посадский район,
                    <br />
                    д. Молочная, д. 1
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Самовывоз возможен по предварительной записи
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
                      { days: "Пн–Пт", hours: "8:00 – 20:00" },
                      { days: "Сб–Вс", hours: "9:00 – 18:00" },
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
                  Принимаем заказы на доставку по всей России
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Сроки доставки: 1–3 рабочих дня в зависимости от региона. Минимальный заказ 500 ₽.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
