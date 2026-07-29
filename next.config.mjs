/** @type {import('next').NextConfig} */
// env updated: production supabase bxowzklgseywyhugobci
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Запрет встраивания в iframe (защита от clickjacking)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Запрет снифинга MIME-типов
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Строгий HTTPS на 2 года
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          // Ограничение реферера
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Отключаем ненужные браузерные API
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // CSP в режиме отчёта — сначала собираем нарушения, потом включаем принудительно
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "img-src 'self' data: blob: https:",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "font-src 'self' data:",
              "frame-src 'self' https://*.paykeeper.ru",
              "connect-src 'self' https://*.supabase.co https://*.paykeeper.ru https://nanokassa.ru",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.paykeeper.ru",
            ].join("; "),
          },
        ],
      },
      {
        // Админка и API не должны попадать в поисковики
        source: "/(admin|api)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1920],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "dolinamoloka.server.paykeeper.ru",
      },
    ],
  },
}

export default nextConfig
