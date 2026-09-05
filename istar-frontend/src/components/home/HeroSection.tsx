"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-22 pb-10 md:pt-24 md:pb-16 overflow-hidden">
      {/* Spotlight effect — radial gradient behind the heading */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(37,87,152,0.18) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 md:mb-8 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-[#8A8F98]"
        >
          <span>Trường Công nghệ Thông tin và Truyền thông</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-5 md:mb-6"
        >
          <span className="gradient-text">Câu lạc bộ</span>
          <br />
          <span className="gradient-text">Nghệ thuật </span><span className="gradient-text-accent">iStar</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto text-base sm:text-lg text-[#8A8F98] leading-relaxed mb-8 md:mb-10"
        >
          Nơi hội tụ những tài năng nghệ thuật — từ âm nhạc, rap, vũ đạo đến
          truyền thông và tổ chức sự kiện. Cùng nhau cháy hết mình trên mọi sân
          khấu.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/apply"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-[#255798] rounded-lg hover:bg-[#316ebf] transition-all duration-300 shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_16px_rgba(37,87,152,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_0_1px_rgba(37,87,152,0.6),0_8px_32px_rgba(37,87,152,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Ứng tuyển ngay
          </Link>
          <Link
            href="/#about"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-[#8A8F98] hover:text-[#EDEDEF] rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-0.5"
          >
            Tìm hiểu thêm
          </Link>
        </motion.div>
      </div>

      {/* Photo placeholder frame */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-10 md:mt-16 w-full max-w-4xl mx-auto aspect-[16/9] rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden group"
      >
        {/* Inset highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

        {/* Placeholder content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8A8F98]/40">
          <svg
            className="w-16 h-16 mb-4 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span className="text-sm">Ảnh tập thể câu lạc bộ</span>
        </div>

        {/* Corner border accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#255798]/40 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#255798]/40 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#255798]/40 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#255798]/40 rounded-br-2xl" />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-5 h-5 text-[#8A8F98]/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
