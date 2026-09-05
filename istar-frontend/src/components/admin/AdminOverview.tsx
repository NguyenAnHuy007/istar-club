"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const statCards = [
  {
    label: "Tổng đơn ứng tuyển",
    value: "128",
    icon: FileText,
    color: "#255798",
    glow: "rgba(37, 87, 152, 0.25)",
  },
  {
    label: "Đơn chờ duyệt",
    value: "24",
    icon: Clock,
    color: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.2)",
  },
  {
    label: "Thành viên",
    value: "86",
    icon: Users,
    color: "#10b981",
    glow: "rgba(16, 185, 129, 0.2)",
  },
  {
    label: "Đơn mới hôm nay",
    value: "7",
    icon: TrendingUp,
    color: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.2)",
  },
];

const quickActions = [
  {
    title: "Đơn ứng tuyển",
    description:
      "Xem, duyệt và quản lý danh sách đơn ứng tuyển của ứng viên.",
    href: "/admin/applications",
    icon: FileText,
    cta: "Xem danh sách",
  },
  {
    title: "Người dùng",
    description:
      "Quản lý tài khoản thành viên, phân quyền và thông tin người dùng.",
    href: "/admin/users",
    icon: Users,
    cta: "Quản lý",
  },
];

export default function AdminOverview() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
          Tổng quan
        </h1>
        <p className="text-sm text-[#8A8F98]">
          Chào mừng trở lại! Đây là bảng điều khiển quản trị iStar.
        </p>
      </motion.div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            {...fadeUp(0.1 + i * 0.08)}
            className="relative group rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.12]"
          >
            {/* Glow accent */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at bottom left, ${card.glow}, transparent 70%)`,
              }}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}20` }}
                >
                  <card.icon
                    className="w-[18px] h-[18px]"
                    style={{ color: card.color }}
                  />
                </div>
              </div>

              <p className="text-2xl font-bold text-[#EDEDEF] mb-1">
                {card.value}
              </p>
              <p className="text-xs text-[#8A8F98]">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <motion.div {...fadeUp(0.45)} className="mb-6">
        <div className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#255798]" />
          Quản lý nhanh
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, i) => (
          <motion.div key={action.href} {...fadeUp(0.5 + i * 0.1)}>
            <Link
              href={action.href}
              className="group block rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-[#255798]/30 hover:shadow-[0_0_40px_rgba(37,87,152,0.08)]"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#255798]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#255798]/25 transition-colors duration-300">
                  <action.icon className="w-5 h-5 text-[#4d8ee8]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#EDEDEF] mb-1.5 group-hover:text-white transition-colors duration-200">
                    {action.title}
                  </h3>
                  <p className="text-sm text-[#8A8F98] leading-relaxed mb-4">
                    {action.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#255798] group-hover:text-[#4d8ee8] transition-colors duration-200">
                    {action.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
