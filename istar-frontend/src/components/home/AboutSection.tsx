"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Calendar, Heart, Mic2 } from "lucide-react";

const stats = [
  { icon: Users, label: "Thành viên", value: "200+" },
  { icon: Calendar, label: "Năm hoạt động", value: "10+" },
  { icon: Heart, label: "Sự kiện/năm", value: "20+" },
  { icon: Mic2, label: "Giải thưởng", value: "30+" },
];

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-12 px-6">
      {/* Section divider */}
      <div className="section-divider w-full max-w-7xl mx-auto mb-12 md:mb-16 lg:mb-20" />

      <div ref={ref} className="max-w-7xl mx-auto">
        {/* Main Grid: Left (Header + Text) | Right (Bento) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12 md:mb-16 items-start">
          {/* Left Column: Header + Text */}
          <div className="flex flex-col">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 md:mb-8"
            >
              <span className="text-xs font-medium uppercase tracking-widest text-[#255798] mb-4 block">
                Về chúng tôi
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight gradient-text mb-6 leading-tight">
                Nơi nghệ thuật <br className="hidden lg:block" />
                gặp gỡ đam mê
              </h2>
            </motion.div>

            {/* Text Column */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <p className="text-base sm:text-lg text-[#8A8F98] leading-relaxed">
                Câu lạc bộ iStar được thành lập vào năm 2013, trực thuộc trường Công
                nghệ Thông tin & Truyền thông — Đại học Công nghiệp Hà Nội. iStar là
                ngôi nhà chung cho những bạn trẻ yêu nghệ thuật, nơi mỗi cá nhân được
                tỏa sáng theo cách riêng của mình.
              </p>
              <p className="text-base sm:text-lg text-[#8A8F98] leading-relaxed">
                Trải qua hơn 10 năm hoạt động, iStar đã tổ chức và tham gia hàng trăm
                sự kiện lớn nhỏ trong và ngoài trường, từ các đêm nhạc hội, cuộc thi
                tài năng đến các chương trình thiện nguyện. Câu lạc bộ liên tục phát
                triển cả về quy mô lẫn chất lượng, trở thành một trong những CLB nghệ
                thuật hàng đầu tại HaUI.
              </p>
              <p className="text-base sm:text-lg text-[#8A8F98] leading-relaxed">
                Với phương châm &ldquo;Tỏa sáng theo cách của bạn&rdquo;, iStar không
                chỉ là nơi rèn luyện kỹ năng nghệ thuật mà còn là môi trường để các
                thành viên phát triển bản thân, xây dựng tình bạn và tạo nên những kỷ
                niệm đẹp trong thời sinh viên.
              </p>
            </motion.div>
          </div>

          {/* Bento Image Grid */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-3"
          >
            {/* Large image */}
            <div className="col-span-2 aspect-[16/9] rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center text-[#8A8F98]/30">
                <div className="text-center">
                  <Mic2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">Đêm nhạc hội</span>
                </div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#255798]/15 to-transparent" />
            </div>

            {/* Two smaller images */}
            <div className="aspect-square rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center text-[#8A8F98]/30">
                <div className="text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">Hoạt động</span>
                </div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#0284c7]/15 to-transparent" />
            </div>

            <div className="aspect-square rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center text-[#8A8F98]/30">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">Tập thể</span>
                </div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#2563EB]/15 to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center py-6 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300"
            >
              <stat.icon className="w-5 h-5 text-[#255798] mx-auto mb-3" />
              <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-[#8A8F98]">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
