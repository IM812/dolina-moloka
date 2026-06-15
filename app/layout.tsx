import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Долина молока — фермерская молочная продукция",
  description:
    "Натуральная молочная продукция с фермы. Молоко, творог, сметана, масло, кефир, сыр и йогурт. Доставка и самовывоз.",
  keywords: "молоко, творог, сметана, кефир, масло, сыр, йогурт, фермерские продукты",
  // metadataBase должен быть в punycode — иначе Next.js percent-кодирует кириллицу в OG-тегах
  metadataBase: new URL("https://xn--e1afmapc4aix.xn--p1ai"),
  alternates: {
    canonical: "https://xn--e1afmapc4aix.xn--p1ai",
  },
  openGraph: {
    title: "Долина молока",
    description: "Натуральная молочная продукция прямо с фермы",
    type: "website",
    url: "https://xn--e1afmapc4aix.xn--p1ai",
    siteName: "Долина молока",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} bg-background`}
    >
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <Toaster position="top-right" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
