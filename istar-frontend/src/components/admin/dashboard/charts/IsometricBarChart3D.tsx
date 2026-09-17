"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DepartmentStatItem } from "@/types/dashboard";
import { BarChart3, TrendingUp } from "lucide-react";

interface IsometricBarChart3DProps {
  data?: DepartmentStatItem[];
}

export default function IsometricBarChart3D({ data = [] }: IsometricBarChart3DProps) {
  const [hoveredDept, setHoveredDept] = useState<DepartmentStatItem | null>(null);

  const safeData = data.length > 0 ? data : [
    { department: "MUSIC", name: "Ban Âm nhạc", total: 0, interviewed: 0, approved: 0, rejected: 0, avgScore: "—", percentage: 0 },
    { department: "RAP", name: "Ban Rap", total: 0, interviewed: 0, approved: 0, rejected: 0, avgScore: "—", percentage: 0 },
    { department: "MEDIA_AND_EVENT", name: "Ban TT&TCSK", total: 0, interviewed: 0, approved: 0, rejected: 0, avgScore: "—", percentage: 0 },
    { department: "DANCE", name: "Ban Vũ đạo", total: 0, interviewed: 0, approved: 0, rejected: 0, avgScore: "—", percentage: 0 },
  ];

  const maxVal = Math.max(...safeData.map((d) => d.total), 1);

  // Department colors tailored for brand aesthetic
  const deptColors: Record<string, { front: string; side: string; top: string; glow: string }> = {
    MUSIC: {
      front: "#255798",
      side: "#163a69",
      top: "#4d8ee8",
      glow: "rgba(37, 87, 152, 0.4)",
    },
    RAP: {
      front: "#f59e0b",
      side: "#b45309",
      top: "#fbbf24",
      glow: "rgba(245, 158, 11, 0.35)",
    },
    MEDIA_AND_EVENT: {
      front: "#10b981",
      side: "#047857",
      top: "#34d399",
      glow: "rgba(16, 185, 129, 0.35)",
    },
    DANCE: {
      front: "#8b5cf6",
      side: "#6d28d9",
      top: "#a78bfa",
      glow: "rgba(139, 92, 246, 0.35)",
    },
  };

  // Well-calibrated isometric bar dimensions to never collide with header
  const maxBarHeight = 110; // px (calibrated to stay safely within stage)
  const barWidth = 44;
  const depthX = 14;
  const depthY = 10;

  const totalAllApps = safeData.reduce((sum, d) => sum + d.total, 0);
  const totalApprovedApps = safeData.reduce((sum, d) => sum + d.approved, 0);
  const totalRate = totalAllApps > 0 ? Math.round((totalApprovedApps / totalAllApps) * 100) : 0;

  return (
    <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-[#255798]/20 text-[#4d8ee8] border border-[#255798]/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4d8ee8] animate-pulse" />
              3D Metric Analysis
            </span>
          </div>

          {/* Legend pills */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#8A8F98]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08]">
              <span className="w-2 h-2 rounded bg-[#255798]" />
              Tổng nộp
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08]">
              <span className="w-2 h-2 rounded bg-emerald-500" />
              Trúng tuyển
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#4d8ee8]" />
          Tương Quan Nguyện Vọng 4 Ban
        </h3>
        <p className="text-xs text-[#8A8F98] mt-0.5">
          Số lượng đơn ứng tuyển &amp; tỷ lệ trúng tuyển theo khối ban
        </p>
      </div>

      {/* 3D Isometric Chart Stage */}
      <div className="relative w-full h-[220px] flex items-end justify-around px-2 sm:px-6 pt-8 pb-3 border-b border-white/[0.06] my-4">
        {/* Stage Grid Baseline */}
        <div className="absolute inset-x-4 bottom-12 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Dynamic Bars */}
        {safeData.map((dept, index) => {
          const colors = deptColors[dept.department] || {
            front: "#255798",
            side: "#163a69",
            top: "#4d8ee8",
            glow: "rgba(37,87,152,0.3)",
          };

          const heightPercent = dept.total > 0 ? dept.total / maxVal : 0;
          const barHeightPx = dept.total > 0 ? Math.max(26, Math.round(heightPercent * maxBarHeight)) : 10;
          const approvedPercent = dept.total > 0 ? dept.approved / dept.total : 0;
          const approvedHeightPx = Math.round(barHeightPx * approvedPercent);

          const isHovered = hoveredDept?.department === dept.department;

          return (
            <div
              key={dept.department}
              className="relative flex flex-col items-center group cursor-pointer select-none"
              onMouseEnter={() => setHoveredDept(dept)}
              onMouseLeave={() => setHoveredDept(null)}
            >
              {/* Tooltip on Hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: -8, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute -top-24 z-30 pointer-events-none px-3 py-2 rounded-xl bg-[#14161F]/95 backdrop-blur-md border border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.8)] text-center min-w-[130px]"
                  >
                    <p className="text-xs font-bold text-white mb-0.5">{dept.name}</p>
                    <div className="text-[11px] space-y-0.5 text-[#8A8F98]">
                      <p>
                        Tổng nộp: <strong className="text-white">{dept.total}</strong>
                      </p>
                      <p>
                        Đã duyệt: <strong className="text-emerald-400">{dept.approved}</strong>
                      </p>
                      <p>
                        Điểm TB: <strong className="text-amber-300">{dept.avgScore}</strong>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Value Label Above Bar */}
              <motion.div
                animate={{ y: isHovered ? -4 : 0 }}
                className="text-xs font-mono font-bold text-white mb-1.5"
              >
                {dept.total}
              </motion.div>

              {/* 3D Pillar SVG */}
              <svg
                width={barWidth + depthX + 4}
                height={barHeightPx + depthY + 4}
                viewBox={`0 0 ${barWidth + depthX + 4} ${barHeightPx + depthY + 4}`}
                className="overflow-visible transition-transform duration-300"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 16px ${colors.glow})` : "none",
                  transform: isHovered ? "translateY(-4px) scale(1.03)" : "none",
                }}
              >
                <defs>
                  {/* Front Gradient */}
                  <linearGradient id={`grad-front-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={colors.top} />
                    <stop offset="100%" stopColor={colors.front} />
                  </linearGradient>

                  {/* Side Gradient */}
                  <linearGradient id={`grad-side-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors.front} />
                    <stop offset="100%" stopColor={colors.side} />
                  </linearGradient>

                  {/* Approved Overlay Gradient */}
                  <linearGradient id={`grad-approved-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                {/* 1. Side Face (Extrusion to the Right) */}
                <polygon
                  points={`
                    ${barWidth},${depthY} 
                    ${barWidth + depthX},0 
                    ${barWidth + depthX},${barHeightPx} 
                    ${barWidth},${barHeightPx + depthY}
                  `}
                  fill={`url(#grad-side-${index})`}
                  opacity={0.85}
                />

                {/* 2. Front Face */}
                <rect
                  x="0"
                  y={depthY}
                  width={barWidth}
                  height={barHeightPx}
                  fill={`url(#grad-front-${index})`}
                  rx="1"
                />

                {/* 3. Approved portion sub-bar (Front & Side) */}
                {approvedHeightPx > 0 && (
                  <>
                    <rect
                      x="0"
                      y={barHeightPx + depthY - approvedHeightPx}
                      width={barWidth}
                      height={approvedHeightPx}
                      fill={`url(#grad-approved-${index})`}
                      opacity={0.9}
                    />
                    <polygon
                      points={`
                        ${barWidth},${barHeightPx + depthY - approvedHeightPx}
                        ${barWidth + depthX},${barHeightPx - approvedHeightPx}
                        ${barWidth + depthX},${barHeightPx}
                        ${barWidth},${barHeightPx + depthY}
                      `}
                      fill="#047857"
                      opacity={0.9}
                    />
                  </>
                )}

                {/* 4. Top Face (Cap) */}
                <polygon
                  points={`
                    0,${depthY} 
                    ${depthX},0 
                    ${barWidth + depthX},0 
                    ${barWidth},${depthY}
                  `}
                  fill={colors.top}
                />
              </svg>

              {/* Bottom Department Name & Avg Score */}
              <div className="text-center mt-2.5 select-none">
                <p className="text-xs font-semibold text-[#EDEDEF] group-hover:text-[#4d8ee8] transition-colors whitespace-nowrap">
                  {dept.name}
                </p>
                <p className="text-[11px] font-mono text-[#8A8F98] mt-0.5">
                  ĐTB: <span className="text-amber-300 font-bold">{dept.avgScore}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Insight */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#8A8F98]">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tỷ lệ trúng tuyển toàn diện:</span>
          <strong className="text-white font-mono">{totalRate}%</strong>
        </span>
        <span className="text-[11px] text-[#8A8F98] hidden sm:inline">
          Di chuột vào cột để xem chi tiết
        </span>
      </div>
    </div>
  );
}
