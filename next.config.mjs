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
        ],
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
