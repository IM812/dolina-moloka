import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Долина молока — фермерская молочная продукция",
  description:
    "Натуральная молочная продукция с фермы. Молоко, творог, сметана, масло, кефир, сыр и йогурт. Доставка и самовывоз.",
  keywords: "молоко, творог, сметана, кефир, масло, сыр, йогурт, фермерские продукты",
  openGraph: {
    title: "Долина молока",
    description: "Натуральная молочная продукция прямо с фермы",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-right" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
