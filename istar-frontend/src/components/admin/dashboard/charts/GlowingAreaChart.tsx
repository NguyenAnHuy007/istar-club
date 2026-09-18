"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DailyTrendItem } from "@/types/dashboard";
import { LineChart, TrendingUp } from "lucide-react";

interface GlowingAreaChartProps {
  data?: DailyTrendItem[];
}

export default function GlowingAreaChart({ data = [] }: GlowingAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const safeData = data.length > 0 ? data : [
    { date: "07/09", fullDate: "2026-09-07", count: 0, approvedCount: 0 },
    { date: "08/09", fullDate: "2026-09-08", count: 0, approvedCount: 0 },
    { date: "09/09", fullDate: "2026-09-09", count: 0, approvedCount: 0 },
    { date: "10/09", fullDate: "2026-09-10", count: 0, approvedCount: 0 },
    { date: "11/09", fullDate: "2026-09-11", count: 0, approvedCount: 0 },
    { date: "12/09", fullDate: "2026-09-12", count: 0, approvedCount: 0 },
    { date: "13/09", fullDate: "2026-09-13", count: 0, approvedCount: 0 },
  ];

  const width = 600;
  const height = 180;
  const paddingX = 35;
  const paddingY = 22;

  const maxVal = Math.max(...safeData.map((d) => d.count), 5);

  // Calculate points
  const points = safeData.map((item, index) => {
    const x = paddingX + (index / (safeData.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (item.count / maxVal) * (height - paddingY * 2);
    return { x, y, ...item };
  });

  // Generate smooth cubic bezier SVG path
  const generateSmoothPath = () => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    return d;
  };

  const linePath = generateSmoothPath();
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const totalSubmitted = safeData.reduce((sum, d) => sum + d.count, 0);
  const avgPerDay = (totalSubmitted / 7).toFixed(1);

  return (
    <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.4)] relative flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
              Spline Glow Curve
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-purple-300 font-mono bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 px-2.5 py-1 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>7 ngày: <strong className="text-white">{totalSubmitted} đơn</strong></span>
          </div>
        </div>

        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <LineChart className="w-4 h-4 text-[#4d8ee8]" />
          Xu Hướng Nộp Đơn 7 Ngày Gần Nhất
        </h3>
        <p className="text-xs text-[#8A8F98] mt-0.5">
          Biểu đồ đường cong phản ánh mật độ ứng viên đăng ký
        </p>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden my-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="glowingAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#255798" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#255798" stopOpacity="0" />
            </linearGradient>

            {/* Line Glow Filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = height - paddingY - ratio * (height - paddingY * 2);
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#glowingAreaGrad)" />

          {/* Glowing Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="3"
            filter="url(#neonGlow)"
            strokeLinecap="round"
          />

          {/* Interactive Cursor Line when Hovered */}
          {hoveredIndex !== null && (
            <line
              x1={points[hoveredIndex].x}
              y1={paddingY}
              x2={points[hoveredIndex].x}
              y2={height - paddingY}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeDasharray="2 2"
            />
          )}

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={pt.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Outer halo */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="9"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                )}
                {/* Main dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "5" : "3.5"}
                  fill={isHovered ? "#ffffff" : "#8b5cf6"}
                  stroke="#14161F"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                left: `${(points[hoveredIndex].x / width) * 100}%`,
                top: `${(points[hoveredIndex].y / height) * 100}%`,
                transform: "translate(-50%, -120%)",
              }}
              className="z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-[#14161F]/95 backdrop-blur-md border border-purple-500/30 shadow-[0_8px_24px_rgba(0,0,0,0.8)] text-center whitespace-nowrap"
            >
              <p className="text-[10px] text-[#8A8F98]">{points[hoveredIndex].date}</p>
              <p className="text-xs font-mono font-bold text-white">
                {points[hoveredIndex].count} đơn nộp
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* X-Axis Date Labels */}
      <div className="flex items-center justify-between px-3 text-[11px] font-mono text-[#8A8F98] pt-2 border-t border-white/[0.06]">
        {safeData.map((item, idx) => (
          <span
            key={item.date}
            className={`transition-colors ${
              hoveredIndex === idx ? "text-[#4d8ee8] font-bold" : ""
            }`}
          >
            {item.date}
          </span>
        ))}
      </div>

      {/* Footer Insight */}
      <div className="pt-3 mt-2 flex items-center justify-between text-xs text-[#8A8F98] border-t border-white/[0.04]">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          <span>Trung bình:</span>
          <strong className="text-white font-mono">{avgPerDay} đơn/ngày</strong>
        </span>
        <span className="text-[11px] text-[#8A8F98] hidden sm:inline">
          Cập nhật theo thời gian thực
        </span>
      </div>
    </div>
  );
}
