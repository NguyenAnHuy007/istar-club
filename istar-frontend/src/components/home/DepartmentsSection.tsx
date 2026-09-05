"use client";

import { useRef, useState, MouseEvent } from "react";
import { motion, useInView } from "framer-motion";
import { Music, Mic, Footprints, Megaphone } from "lucide-react";

const departments = [
  {
    icon: Music,
    name: "Âm nhạc",
    description:
      "Trau dồi kỹ năng thanh nhạc, nhạc cụ và biểu diễn. Tạo ra những giai điệu chạm đến trái tim khán giả.",
    gradient: "from-[#255798] to-[#4d8ee8]",
    glowColor: "rgba(37, 87, 152, 0.2)",
  },
  {
    icon: Mic,
    name: "Rap",
    description:
      "Sáng tác lời rap, freestyle và biểu diễn trên sân khấu. Thể hiện cá tính qua từng câu từ mạnh mẽ.",
    gradient: "from-[#EC4899] to-[#F472B6]",
    glowColor: "rgba(236, 72, 153, 0.15)",
  },
  {
    icon: Footprints,
    name: "Vũ đạo",
    description:
      "Khám phá đa dạng thể loại dance từ K-pop, hip-hop đến contemporary. Biến cơ thể thành ngôn ngữ nghệ thuật.",
    gradient: "from-[#F59E0B] to-[#FBBF24]",
    glowColor: "rgba(245, 158, 11, 0.15)",
  },
  {
    icon: Megaphone,
    name: "Truyền thông & Sự kiện",
    description:
      "Lên kế hoạch, tổ chức sự kiện và xây dựng hình ảnh CLB. Sáng tạo nội dung và kết nối cộng đồng.",
    gradient: "from-[#10B981] to-[#34D399]",
    glowColor: "rgba(16, 185, 129, 0.15)",
  },
];

function DepartmentCard({
  dept,
  index,
}: {
  dept: (typeof departments)[0];
  index: number;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 transition-all duration-500 hover:border-white/[0.12] overflow-hidden"
      style={{
        boxShadow: isHovered
          ? `0 0 60px ${dept.glowColor}, 0 25px 50px rgba(0,0,0,0.4)`
          : "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      {/* Spotlight effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${dept.glowColor}, transparent 70%)`
            : "none",
        }}
      />

      {/* Top gradient line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${dept.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Content */}
      <div className="relative z-10">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dept.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}
        >
          <dept.icon className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-xl font-semibold text-[#EDEDEF] mb-3 tracking-tight">
          {dept.name}
        </h3>

        <p className="text-sm text-[#8A8F98] leading-relaxed">
          {dept.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function DepartmentsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="departments" className="relative py-12 px-6">
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
            Các ban hoạt động
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight gradient-text mb-6">
            Bốn ban — Một iStar
          </h2>
          <p className="max-w-2xl mx-auto text-base text-[#8A8F98] leading-relaxed">
            Mỗi ban mang một màu sắc riêng, nhưng tất cả đều hướng đến mục tiêu
            chung: tỏa sáng trên sân khấu nghệ thuật.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {departments.map((dept, i) => (
            <DepartmentCard key={dept.name} dept={dept} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
