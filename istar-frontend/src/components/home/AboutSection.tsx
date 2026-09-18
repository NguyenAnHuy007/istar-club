"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Calendar, Heart, Mic2 } from "lucide-react";
import { AboutConfig } from "@/types/landing";

const getYearsOfOperation = () => {
  const startDate = new Date(2017, 10, 1);
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  const monthDiff = now.getMonth() - startDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < startDate.getDate())) {
    years--;
  }
  return Math.max(0, years);
};

const stats = [
  { icon: Users, label: "Thành viên", value: "80+" },
  { icon: Calendar, label: "Năm hoạt động", value: `${getYearsOfOperation()}+` },
  { icon: Heart, label: "Sự kiện/năm", value: "20+" },
  { icon: Mic2, label: "Sản phẩm nghệ thuật", value: "20+" },
];

const DEFAULT_PARAGRAPHS = [
  "Câu lạc bộ iStar được thành lập vào năm 2013, trực thuộc trường Công nghệ Thông tin & Truyền thông — Đại học Công nghiệp Hà Nội. iStar là ngôi nhà chung cho những bạn trẻ yêu nghệ thuật, nơi mỗi cá nhân được tỏa sáng theo cách riêng của mình.",
  "Trải qua hơn 10 năm hoạt động, iStar đã tổ chức và tham gia hàng trăm sự kiện lớn nhỏ trong và ngoài trường, từ các đêm nhạc hội, cuộc thi tài năng đến các chương trình thiện nguyện. Câu lạc bộ liên tục phát triển cả về quy mô lẫn chất lượng, trở thành một trong những CLB nghệ thuật hàng đầu tại HaUI.",
  `Với phương châm \u201cTỏa sáng theo cách của bạn\u201d, iStar không chỉ là nơi rèn luyện kỹ năng nghệ thuật mà còn là môi trường để các thành viên phát triển bản thân, xây dựng tình bạn và tạo nên những kỷ niệm đẹp trong thời sinh viên.`,
];

const ease3D = [0.16, 1, 0.3, 1] as const;

interface AboutSectionProps {
  config?: AboutConfig;
}

export default function AboutSection({ config }: AboutSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const badgeText = config?.badge || "Về chúng tôi";
  const titleText = config?.title || "Nơi nghệ thuật gặp gỡ đam mê";
  const paragraphs =
    config?.paragraphs && config.paragraphs.length > 0
      ? config.paragraphs
      : DEFAULT_PARAGRAPHS;

  return (
    <section id="about" className="relative py-10 md:py-12 px-4 sm:px-6">
      {/* Section divider */}
      <div className="section-divider w-full max-w-7xl mx-auto mb-10 md:mb-16 lg:mb-20" />

      <div ref={ref} className="max-w-7xl mx-auto">
        {/* Main Grid: Left (Header + Text) | Right (Bento) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-10 md:mb-16 items-start">
          {/* Left Column: Header + Text */}
          <div className="flex flex-col" style={{ perspective: "800px" }}>
            {/* Section Header — 3D "rotate in from left" */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotateY: -6 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ duration: 0.9, ease: ease3D }}
              style={{ transformOrigin: "left center" }}
              className="mb-5 md:mb-8"
            >
              <span className="text-xs font-medium uppercase tracking-widest text-[#255798] mb-4 block">
                {badgeText}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight gradient-text leading-tight">
                {titleText}
              </h2>
            </motion.div>

            {/* Text Column */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotateY: -4 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15, ease: ease3D }}
              style={{ transformOrigin: "left center" }}
              className="space-y-5 md:space-y-6"
            >
              {paragraphs.map((p, idx) => (
                <p key={idx} className="text-sm sm:text-base md:text-lg text-[#8A8F98] leading-relaxed">
                  {p}
                </p>
              ))}
            </motion.div>
          </div>

          {/* Bento Image Grid — stagger 3D entrances */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3" style={{ perspective: "1000px" }}>
            {/* Large image */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotateX: 5, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: ease3D }}
              style={{ transformOrigin: "center bottom" }}
              className="col-span-2 aspect-[16/9] rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden relative group"
            >
              {config?.imageLarge?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.imageLarge.url}
                  alt={config.imageLarge.label || "Đêm nhạc hội"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center text-[#8A8F98]/30">
                    <div className="text-center">
                      <Mic2 className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 opacity-50" />
                      <span className="text-xs">{config?.imageLarge?.label || "Đêm nhạc hội"}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#255798]/15 to-transparent" />
                </>
              )}
            </motion.div>

            {/* Two smaller images */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotateX: 4, scale: 0.93 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.35, ease: ease3D }}
              style={{ transformOrigin: "center bottom" }}
              className="aspect-square rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden relative group"
            >
              {config?.imageSmall1?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.imageSmall1.url}
                  alt={config.imageSmall1.label || "Hoạt động"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center text-[#8A8F98]/30">
                    <div className="text-center">
                      <Heart className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                      <span className="text-xs">{config?.imageSmall1?.label || "Hoạt động"}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#0284c7]/15 to-transparent" />
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, rotateX: 4, scale: 0.93 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.45, ease: ease3D }}
              style={{ transformOrigin: "center bottom" }}
              className="aspect-square rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden relative group"
            >
              {config?.imageSmall2?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.imageSmall2.url}
                  alt={config.imageSmall2.label || "Tập thể"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center text-[#8A8F98]/30">
                    <div className="text-center">
                      <Users className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                      <span className="text-xs">{config?.imageSmall2?.label || "Tập thể"}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#2563EB]/15 to-transparent" />
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Stats Row — stagger "fly up from depth" */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" style={{ perspective: "800px" }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1 * i, ease: ease3D }}
              className="text-center py-5 px-3 md:py-6 md:px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300"
            >
              <stat.icon className="w-5 h-5 text-[#255798] mx-auto mb-3" />
              <div className="text-xl md:text-2xl lg:text-3xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-[11px] md:text-xs text-[#8A8F98]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
