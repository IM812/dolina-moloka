"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function QualityBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative h-[60vh] min-h-[420px] overflow-hidden flex items-center justify-center">
      {/* Parallax image */}
      <motion.div style={{ y }} className="absolute inset-[-12%] z-0">
        <Image
          src="/quality-bg.png"
          alt="Контроль качества"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55 z-10" />

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 text-center px-5 max-w-3xl mx-auto"
      >
        <p className="text-white/60 text-xs sm:text-sm tracking-[0.25em] uppercase mb-4 sm:mb-5">Наш стандарт</p>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-[1.15] text-balance">
          Каждый продукт проходит контроль качества
          до того, как попадёт к вам на стол.
        </h2>
      </motion.div>
    </section>
  );
}
