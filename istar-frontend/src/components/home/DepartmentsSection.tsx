"use client";

import { useRef, useState, MouseEvent } from "react";
import { motion, useInView } from "framer-motion";
import {
  Music,
  Mic,
  Footprints,
  Megaphone,
  Camera,
  Heart,
  Palette,
  Film,
  Users,
  Radio,
  Tv,
  Award,
  LucideIcon,
} from "lucide-react";
import { DepartmentSectionConfig, DepartmentItem } from "@/types/landing";

const ICON_MAP: Record<string, LucideIcon> = {
  Music,
  Mic,
  Footprints,
  Megaphone,
  Camera,
  Heart,
  Palette,
  Film,
  Users,
  Radio,
  Tv,
  Award,
};

const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "dept-1",
    icon: "Music",
    name: "Âm nhạc",
    description:
      "Trau dồi kỹ năng thanh nhạc, nhạc cụ và biểu diễn. Tạo ra những giai điệu chạm đến trái tim khán giả.",
    gradient: "from-[#255798] to-[#4d8ee8]",
    glowColor: "rgba(37, 87, 152, 0.2)",
  },
  {
    id: "dept-2",
    icon: "Mic",
    name: "Rap",
    description:
      "Sáng tác lời rap, freestyle và biểu diễn trên sân khấu. Thể hiện cá tính qua từng câu từ mạnh mẽ.",
    gradient: "from-[#EC4899] to-[#F472B6]",
    glowColor: "rgba(236, 72, 153, 0.15)",
  },
  {
    id: "dept-3",
    icon: "Footprints",
    name: "Vũ đạo",
    description:
      "Khám phá đa dạng thể loại dance từ K-pop, hip-hop đến contemporary. Biến cơ thể thành ngôn ngữ nghệ thuật.",
    gradient: "from-[#F59E0B] to-[#FBBF24]",
    glowColor: "rgba(245, 158, 11, 0.15)",
  },
  {
    id: "dept-4",
    icon: "Megaphone",
    name: "Truyền thông và Tổ chức sự kiện",
    description:
      "Lên kế hoạch, tổ chức sự kiện và xây dựng hình ảnh CLB. Sáng tạo nội dung và kết nối cộng đồng.",
    gradient: "from-[#10B981] to-[#34D399]",
    glowColor: "rgba(16, 185, 129, 0.15)",
  },
];

const ease3D = [0.16, 1, 0.3, 1] as const;

function DepartmentCard({
  dept,
  index,
}: {
  dept: DepartmentItem;
  index: number;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const IconComponent = ICON_MAP[dept.icon] || Music;

  const gradient = dept.gradient || "from-[#255798] to-[#4d8ee8]";
  const glowColor = dept.glowColor || "rgba(37, 87, 152, 0.2)";

  /* Alternating 3D entrance: even cards rotate from left, odd from right */
  const rotateYStart = index % 2 === 0 ? -8 : 8;

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
      initial={{ opacity: 0, y: 32, rotateY: rotateYStart, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: ease3D,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 lg:p-8 transition-all duration-500 hover:border-white/[0.12] overflow-hidden hover:-translate-y-1"
      style={{
        boxShadow: isHovered
          ? `0 0 60px ${glowColor}, 0 25px 50px rgba(0,0,0,0.4)`
          : "0 4px 20px rgba(0,0,0,0.2)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Spotlight effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 70%)`
            : "none",
        }}
      />

      {/* Top gradient line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Content */}
      <div className="relative z-10">
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 md:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}
        >
          <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>

        <h3 className="text-lg md:text-xl font-semibold text-[#EDEDEF] mb-2 md:mb-3 tracking-tight">
          {dept.name}
        </h3>

        <p className="text-xs md:text-sm text-[#8A8F98] leading-relaxed">
          {dept.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function DepartmentsSection({
  config,
}: {
  config?: DepartmentSectionConfig;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const title = config?.title || "Bốn ban — Một iStar";
  const subtitle =
    config?.subtitle ||
    "Mỗi ban mang một màu sắc riêng, nhưng tất cả đều hướng đến mục tiêu chung: tỏa sáng trên sân khấu nghệ thuật.";
  const departments =
    config?.items && config.items.length >= 2
      ? config.items
      : DEFAULT_DEPARTMENTS;

  const getGridColsClass = (count: number) => {
    if (count === 2) return "lg:grid-cols-2 max-w-4xl mx-auto";
    if (count === 3) return "lg:grid-cols-3 max-w-6xl mx-auto";
    if (count === 4) return "lg:grid-cols-4";
    return "lg:grid-cols-3";
  };

  return (
    <section id="departments" className="relative py-10 md:py-12 px-4 sm:px-6">
      {/* Section divider */}
      <div className="section-divider w-full max-w-7xl mx-auto mb-10 md:mb-16 lg:mb-20" />

      <div ref={ref} className="max-w-7xl mx-auto">
        {/* Section Header — 3D "tilt up" entrance */}
        <motion.div
          initial={{ opacity: 0, y: 24, rotateX: 10 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.9, ease: ease3D }}
          style={{ perspective: "800px", transformOrigin: "center bottom" }}
          className="text-center mb-8 md:mb-14"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-[#255798] mb-4 block">
            Các ban hoạt động
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight gradient-text leading-[1.2] pb-2 pt-1 mb-5 md:mb-6">
            {title}
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-[#8A8F98] leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Cards Grid — perspective container */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 ${getGridColsClass(
            departments.length
          )}`}
          style={{ perspective: "1000px" }}
        >
          {departments.map((dept, i) => (
            <DepartmentCard key={dept.id || dept.name} dept={dept} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
