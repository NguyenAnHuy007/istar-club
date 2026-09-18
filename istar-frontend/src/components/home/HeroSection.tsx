"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { HeroConfig } from "@/types/landing";

interface HeroSectionProps {
  config?: HeroConfig;
}

/* Shared spring-style easing for a smooth 3D feel */
const ease3D = [0.16, 1, 0.3, 1] as const;

export default function HeroSection({ config }: HeroSectionProps) {
  const badgeText = config?.badge || "Trường Công nghệ Thông tin và Truyền thông - HaUI";
  const subtitleText =
    config?.subtitle ||
    "Nơi hội tụ những tài năng nghệ thuật — từ âm nhạc, rap, vũ đạo đến truyền thông và tổ chức sự kiện. Cùng nhau cháy hết mình trên mọi sân khấu.";
  const primaryText = config?.primaryButtonText || "Ứng tuyển ngay";
  const primaryUrl = config?.primaryButtonUrl || "/apply";
  const secondaryText = config?.secondaryButtonText || "Tìm hiểu thêm";
  const secondaryUrl = config?.secondaryButtonUrl || "/#about";

  return (
    <section className="relative flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-6 md:pt-24 md:pb-16 overflow-hidden">
      {/* Spotlight effect — radial gradient behind the heading */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[400px] md:h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(37,87,152,0.18) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto text-center" style={{ perspective: "1200px" }}>
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 16, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: ease3D }}
          className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 mb-5 md:mb-8 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] sm:text-xs text-[#8A8F98]"
        >
          <span>{badgeText}</span>
        </motion.div>

        {/* Headline — 3D "flip up" entrance */}
        <motion.h1
          initial={{ opacity: 0, y: 30, rotateX: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: ease3D }}
          style={{ transformOrigin: "center bottom" }}
          className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-4 md:mb-6"
        >
          <span className="gradient-text">Câu lạc bộ</span>
          <br />
          <span className="gradient-text">Nghệ thuật </span><span className="gradient-text-accent">iStar</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: ease3D }}
          className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#8A8F98] leading-relaxed mb-7 md:mb-10 px-2 sm:px-0"
        >
          {subtitleText}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: ease3D }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2 sm:px-0"
        >
          <Link
            href={primaryUrl}
            className="w-full sm:w-44 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-[#255798] rounded-lg hover:bg-[#316ebf] transition-all duration-300 shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_16px_rgba(37,87,152,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_0_1px_rgba(37,87,152,0.6),0_8px_32px_rgba(37,87,152,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {primaryText}
          </Link>
          <Link
            href={secondaryUrl}
            className="w-full sm:w-44 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-[#8A8F98] hover:text-[#EDEDEF] rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {secondaryText}
          </Link>
        </motion.div>
      </div>

      {/* Photo frame — 3D "rise from surface" */}
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.7, ease: ease3D }}
        style={{ perspective: "1200px", transformOrigin: "center bottom" }}
        className="relative mt-8 md:mt-12 w-full max-w-5xl mx-auto aspect-[16/9] md:aspect-[24/9] rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden group"
      >
        {/* Inset highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

        {/* Dynamic Photo or Placeholder */}
        {config?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.imageUrl}
            alt="Ảnh tập thể câu lạc bộ"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8A8F98]/40">
            <svg
              className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-xs sm:text-sm">Ảnh tập thể câu lạc bộ</span>
          </div>
        )}

        {/* Corner border accents — smaller on mobile */}
        <div className="absolute top-0 left-0 w-10 h-10 md:w-16 md:h-16 border-t-2 border-l-2 border-[#255798]/40 rounded-tl-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-10 h-10 md:w-16 md:h-16 border-t-2 border-r-2 border-[#255798]/40 rounded-tr-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-10 h-10 md:w-16 md:h-16 border-b-2 border-l-2 border-[#255798]/40 rounded-bl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-10 h-10 md:w-16 md:h-16 border-b-2 border-r-2 border-[#255798]/40 rounded-br-2xl pointer-events-none" />
      </motion.div>

      {/* Scroll indicator — flow layout (not absolute), breathing CSS animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="mt-6 md:mt-8 flex justify-center"
      >
        <div
          className="w-8 h-8 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center"
          style={{ animation: "breathe 2.5s ease-in-out infinite" }}
        >
          <ArrowDown className="w-4 h-4 text-[#8A8F98]/60" />
        </div>
      </motion.div>
    </section>
  );
}
