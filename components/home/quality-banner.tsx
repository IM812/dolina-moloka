import Image from "next/image";

export function QualityBanner() {
  return (
    <section className="relative h-[50vh] min-h-[320px] sm:min-h-[420px] overflow-hidden flex items-center justify-center">
      {/* Background image — static, no parallax JS */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/quality-bg.png"
          alt="Контроль качества"
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55 z-10" />

      {/* Text */}
      <div className="relative z-20 text-center px-5 max-w-3xl mx-auto">
        <p className="text-white/60 text-xs sm:text-sm tracking-[0.25em] uppercase mb-4 sm:mb-5">Наш стандарт</p>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-[1.15] text-balance">
          Каждый продукт проходит контроль качества
          до того, как попадёт к вам на стол.
        </h2>
      </div>
    </section>
  );
}
