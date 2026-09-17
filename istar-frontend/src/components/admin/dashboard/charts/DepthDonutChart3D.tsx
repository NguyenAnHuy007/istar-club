"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBreakdownItem } from "@/types/dashboard";
import { PieChart, CheckCircle2 } from "lucide-react";

interface DepthDonutChart3DProps {
  data?: StatusBreakdownItem[];
  totalApplications: number;
}

export default function DepthDonutChart3D({
  data = [],
  totalApplications = 0,
}: DepthDonutChart3DProps) {
  const [hoveredStatus, setHoveredStatus] = useState<StatusBreakdownItem | null>(null);

  // Filter items with count > 0 for chart drawing, or fallback
  const activeItems = data.filter((item) => item.count > 0);
  const total = totalApplications > 0 ? totalApplications : 1;

  // Donut geometry constants (refined to 190px for balanced height)
  const size = 190;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray and strokeDashoffset for each slice
  let cumulativePercent = 0;
  const slices = activeItems.map((item) => {
    const fraction = item.count / total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercent * circumference;
    cumulativePercent += fraction;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Create an 8-item balanced list by appending a summary card so grid is always 4x2 or 2x4
  const allLegendItems: StatusBreakdownItem[] = [
    ...data,
    {
      status: "TOTAL",
      label: "Tổng hồ sơ",
      count: totalApplications,
      percentage: 100,
      color: "#4d8ee8",
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.4)] relative flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              3D Depth Ring
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>7 trạng thái</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#4d8ee8]" />
          Phân Bổ Trạng Thái Ứng Viên
        </h3>
        <p className="text-xs text-[#8A8F98] mt-0.5">
          Tỷ lệ chuyển đổi qua các giai đoạn trong đợt tuyển
        </p>
      </div>

      {/* 3D Donut Canvas Area */}
      <div className="relative flex items-center justify-center my-3">
        {/* Layer 1: Ambient Glow Underlying Circle */}
        <div
          className="absolute w-40 h-40 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{
            background: hoveredStatus ? hoveredStatus.color : "rgba(37, 87, 152, 0.4)",
            transition: "background 0.4s ease",
          }}
        />

        {/* Layer 2: 3D Perspective SVG Stage */}
        <div className="relative" style={{ perspective: "600px" }}>
          {/* Base 3D Drop Shadow Ring */}
          <svg
            width={size}
            height={size}
            className="absolute top-2 left-0 opacity-40 blur-[2px] pointer-events-none"
            style={{ transform: "rotate(-90deg) scale(0.98)" }}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#000000"
              strokeWidth={strokeWidth + 4}
            />
          </svg>

          {/* Main Segmented Donut Ring */}
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 overflow-visible transition-transform duration-300"
            style={{
              filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.6))",
            }}
          >
            {/* Background Empty Ring Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={strokeWidth}
            />

            {/* Render Data Slices */}
            {slices.map((slice) => {
              const isHovered = hoveredStatus?.status === slice.status;
              return (
                <circle
                  key={slice.status}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 5 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 12px ${slice.color}) brightness(1.2)`
                      : "none",
                  }}
                  onMouseEnter={() => setHoveredStatus(slice)}
                  onMouseLeave={() => setHoveredStatus(null)}
                />
              );
            })}
          </svg>

          {/* Center Hole Info / Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <AnimatePresence mode="wait">
              {hoveredStatus ? (
                <motion.div
                  key={hoveredStatus.status}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center px-2"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full mb-1"
                    style={{ background: hoveredStatus.color }}
                  />
                  <p className="text-xl font-bold font-mono text-white leading-tight">
                    {hoveredStatus.count}
                  </p>
                  <p className="text-[11px] font-medium text-[#EDEDEF] truncate max-w-[90px]">
                    {hoveredStatus.label}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {hoveredStatus.percentage}%
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="total"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center px-2"
                >
                  <p className="text-2xl font-bold font-mono text-white leading-none mb-1">
                    {totalApplications}
                  </p>
                  <p className="text-[10px] text-[#8A8F98] tracking-wider uppercase font-mono">
                    Tổng hồ sơ
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Symmetrical 8-Slot Status Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-2 pt-3 border-t border-white/[0.06]">
        {allLegendItems.map((item) => {
          const isHovered = hoveredStatus?.status === item.status;
          const isTotalSlot = item.status === "TOTAL";
          return (
            <div
              key={item.status}
              className={`h-9 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                isTotalSlot
                  ? "bg-[#255798]/10 border-[#255798]/30 hover:bg-[#255798]/20"
                  : isHovered
                  ? "bg-white/[0.08] border-white/30"
                  : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
              }`}
              onMouseEnter={() => !isTotalSlot && setHoveredStatus(item)}
              onMouseLeave={() => !isTotalSlot && setHoveredStatus(null)}
            >
              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span
                  className={`text-xs truncate ${
                    isTotalSlot ? "font-semibold text-white" : "text-[#EDEDEF]"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className={`text-xs font-mono font-bold ${
                    isTotalSlot ? "text-[#4d8ee8]" : "text-white"
                  }`}
                >
                  {item.count}
                </span>
                <span className="text-[10px] font-mono text-[#8A8F98]">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
