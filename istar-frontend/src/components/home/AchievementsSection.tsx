"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const achievements = [
  {
    year: "2024",
    title: "Giải Nhất — Liên hoan các nhóm nhảy",
    description: "Cuộc thi quy mô toàn quốc dành cho các nhóm nhảy sinh viên.",
  },
  {
    year: "2024",
    title: "Giải Ba — Giọng hát hay sinh viên toàn quốc",
    description: "Đại diện HaUI tỏa sáng tại đấu trường âm nhạc sinh viên.",
  },
  {
    year: "2023",
    title: "Giải Nhất — HaUI's Got Talent",
    description: "Chiến thắng thuyết phục tại cuộc thi tài năng lớn nhất trường.",
  },
  {
    year: "2023",
    title: "Giải Nhì — Rap Battle Liên trường",
    description: "Thể hiện đẳng cấp rap trong cuộc thi liên trường Hà Nội.",
  },
  {
    year: "2022",
    title: "Giải Nhất — Cuộc thi Vũ đạo Sinh viên HN",
    description: "Đại diện xuất sắc của HaUI tại sân chơi vũ đạo thủ đô.",
  },
  {
    year: "2022",
    title: "CLB xuất sắc tiêu biểu — HaUI",
    description: "Được nhà trường vinh danh CLB hoạt động xuất sắc nhất năm.",
  },
  {
    year: "2021",
    title: "Giải Đặc biệt — Liên hoan Văn nghệ HaUI",
    description: "Giải thưởng cao nhất dành cho tiết mục tổng hợp nghệ thuật.",
  },
];

export default function AchievementsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const goTo = useCallback(
    (index: number, dir: number) => {
      setDirection(dir);
      setCurrentIndex(((index % achievements.length) + achievements.length) % achievements.length);
    },
    []
  );

  const next = useCallback(() => goTo(currentIndex + 1, 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1, -1), [currentIndex, goTo]);

  // Auto-play
  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next]);

  const resetAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 5000);
  }, [next]);

  const handleNext = () => {
    next();
    resetAutoPlay();
  };
  const handlePrev = () => {
    prev();
    resetAutoPlay();
  };
  const handleDot = (i: number) => {
    goTo(i, i > currentIndex ? 1 : -1);
    resetAutoPlay();
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const current = achievements[currentIndex];

  return (
    <section id="achievements" className="relative py-12 px-6">
      {/* Section divider */}
      <div className="section-divider w-full max-w-7xl mx-auto mb-12 md:mb-16 lg:mb-20" />

      <div ref={ref} className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-[#255798] mb-4 block">
            Thành tích nổi bật
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight gradient-text mb-6">
            Những dấu ấn rực rỡ
          </h2>
          <p className="max-w-2xl mx-auto text-base text-[#8A8F98] leading-relaxed">
            Hành trình hơn 10 năm với hàng chục giải thưởng lớn nhỏ, minh chứng cho
            tài năng và sự cống hiến của các thế hệ thành viên iStar.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Main Flex Parent for Arrows and Card */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
            {/* Prev Navigation Arrow */}
            <button
              onClick={handlePrev}
              className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl border border-white/[0.08] bg-[#050506]/80 backdrop-blur-sm flex items-center justify-center text-[#8A8F98] hover:text-[#EDEDEF] hover:border-white/[0.2] transition-all duration-300 hover:bg-white/[0.08] hover:scale-105 active:scale-95"
              aria-label="Previous achievement"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Carousel Card */}
            <div className="relative flex-1 max-w-5xl rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden h-[380px] sm:h-[520px] md:h-[660px]">
              {/* Background glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center top, rgba(37,87,152,0.15), transparent 70%)",
                }}
              />

              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex flex-col items-center justify-start text-center p-3.5 sm:p-5 md:p-7 h-full w-full gap-2 sm:gap-3"
                >
                  {/* Achievement Image Placeholder - Tỉ lệ 3/4 co giãn đúng chuẩn */}
                  <div className="w-full aspect-[3/4] max-h-[240px] sm:max-h-[360px] md:max-h-[480px] rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden relative group shadow-lg flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8A8F98]/40">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-50 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                      <span className="text-xs text-[#8A8F98]/60 font-medium">Hình ảnh thành tích</span>
                    </div>
                  </div>

                  {/* Text Content Block */}
                  <div className="flex flex-col items-center w-full mt-0.5 sm:mt-1">
                    {/* Year badge */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#255798]/15 text-[#3b82f6] text-[11px] sm:text-xs font-medium mb-1.5 border border-[#255798]/30">
                      {current.year}
                    </span>

                    {/* Title */}
                    <h3 className="text-sm sm:text-lg md:text-xl font-bold text-[#EDEDEF] mb-1 tracking-tight px-1 line-clamp-1 w-full text-center">
                      {current.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#8A8F98] leading-relaxed max-w-md px-1 line-clamp-2 w-full text-center">
                      {current.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next Navigation Arrow */}
            <button
              onClick={handleNext}
              className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl border border-white/[0.08] bg-[#050506]/80 backdrop-blur-sm flex items-center justify-center text-[#8A8F98] hover:text-[#EDEDEF] hover:border-white/[0.2] transition-all duration-300 hover:bg-white/[0.08] hover:scale-105 active:scale-95"
              aria-label="Next achievement"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {achievements.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDot(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex
                  ? "w-8 bg-[#255798]"
                  : "w-1.5 bg-white/[0.15] hover:bg-white/[0.3]"
                  }`}
                aria-label={`Go to achievement ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="text-center mt-3">
            <span className="text-xs text-[#8A8F98]/60 tabular-nums">
              {String(currentIndex + 1).padStart(2, "0")} / {String(achievements.length).padStart(2, "0")}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
