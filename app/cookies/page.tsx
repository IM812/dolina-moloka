export const metadata = {
  title: "Политика cookies — Долина молока",
  description: "Информация об использовании файлов cookie на сайте Долина молока.",
};

const sections = [
  {
    title: "1. Что такое cookies",
    text: "Cookies — это небольшие текстовые файлы, которые сохраняются в браузере при посещении нашего сайта. Они позволяют запоминать ваши предпочтения и корзину между сессиями.",
  },
  {
    title: "2. Какие cookies мы используем",
    text: "Мы используем следующие типы cookies: необходимые (для работы корзины и форм заказа), аналитические (для понимания, как пользователи взаимодействуют с сайтом) и функциональные (для запоминания выбранных параметров). Мы не используем рекламные cookies и не передаём данные рекламным сетям.",
  },
  {
    title: "3. Срок хранения",
    text: "Необходимые cookies хранятся в течение сессии или до 1 года. Аналитические cookies — до 2 лет. Вы можете удалить cookies в настройках своего браузера в любое время.",
  },
  {
    title: "4. Управление cookies",
    text: "При первом посещении сайта вы можете принять или отклонить использование необязательных cookies. Если вы отклоните их, базовые функции сайта (корзина, оформление заказа) по-прежнему будут работать.",
  },
  {
    title: "5. Cookies третьих сторон",
    text: "На нашем сайте могут использоваться сервисы аналитики (например, Яндекс.Метрика). Эти сервисы устанавливают собственные cookies в соответствии со своими политиками конфиденциальности.",
  },
  {
    title: "6. Контакты",
    text: "По вопросам использования cookies обращайтесь: dolinamoloka50@gmail.com.",
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Политика cookies</h1>
        <p className="text-muted-foreground text-sm mb-8">Последнее обновление: 1 июня 2026 г.</p>

        <div className="flex flex-col gap-6 text-foreground">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-foreground mb-1.5">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
