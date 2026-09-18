"use client";

import React from "react";
import {
  BarChart3,
  RotateCcw,
  Award,
  PieChart,
  GraduationCap as SchoolIcon,
} from "lucide-react";
import { Area } from "@/types/user";
import { StatusBreakdownItem, DepartmentStatItem } from "@/types/dashboard";
import DepthDonutChart3D from "@/components/admin/dashboard/charts/DepthDonutChart3D";
import IsometricBarChart3D from "@/components/admin/dashboard/charts/IsometricBarChart3D";

export interface InterviewStatsData {
  total: number;
  checkedIn: number;
  interviewing: number;
  interviewed: number;
  approved: number;
  rejected: number;
  noShow: number;
  submitted: number;
  excellent: number;
  good: number;
  average: number;
  belowAverage: number;
  unScored: number;
  deptStats: {
    department: string;
    name: string;
    total: number;
    interviewed: number;
    avgScore: string;
  }[];
  sortedSchools: [string, number][];
  statusBreakdown: StatusBreakdownItem[];
  deptChartData: DepartmentStatItem[];
}

interface InterviewStatsTabProps {
  statsData: InterviewStatsData;
  selectedArea: Area | null;
  statsLoading: boolean;
  isAdmin: boolean;
  isReceptionist: boolean;
  onRefreshStats: () => void;
}

export default function InterviewStatsTab({
  statsData,
  selectedArea,
  statsLoading,
  isAdmin,
  isReceptionist,
  onRefreshStats,
}: InterviewStatsTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Description */}
      <div className="p-5 rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#255798]/20 border border-[#255798]/40 flex items-center justify-center text-[#4d8ee8]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Báo cáo Thống kê & Phân tích Đợt tuyển
            </h3>
            <p className="text-xs text-[#8A8F98]">
              Dữ liệu tổng hợp toàn bộ ứng viên chiến dịch tuyển chọn{" "}
              {selectedArea === Area.HANOI
                ? "(Cơ sở 1 - Hà Nội)"
                : selectedArea === Area.NINH_BINH
                ? "(Cơ sở 3 - Ninh Bình)"
                : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefreshStats}
          disabled={statsLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#EDEDEF] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer shadow-sm"
        >
          <RotateCcw
            className={`w-3.5 h-3.5 text-[#4d8ee8] ${
              statsLoading ? "animate-spin" : ""
            }`}
          />
          <span>Cập nhật số liệu</span>
        </button>
      </div>

      {/* 3D SVG Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* 3D Donut Chart for Status Breakdown */}
        <DepthDonutChart3D
          data={statsData.statusBreakdown}
          totalApplications={statsData.total}
        />

        {/* 3D Isometric Bar Chart for Department Breakdown */}
        <IsometricBarChart3D data={statsData.deptChartData} />
      </div>

      {/* Detailed Spectrum & Department Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Summary Cards */}
        <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.4)] space-y-4">
          <h4 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-[#4d8ee8]" />
            Số lượng & Điểm trung bình theo Ban
          </h4>

          <div className="space-y-3">
            {statsData.deptStats.map((d) => {
              const percent =
                statsData.total > 0
                  ? Math.round((d.total / statsData.total) * 100)
                  : 0;
              return (
                <div
                  key={d.department}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2 hover:border-white/[0.1] transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{d.name}</span>
                    <span className="text-[#8A8F98]">
                      Đã phỏng vấn:{" "}
                      <strong className="text-cyan-300">{d.interviewed}</strong> /{" "}
                      {d.total} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      style={{
                        width: `${
                          d.total > 0 ? (d.interviewed / d.total) * 100 : 0
                        }%`,
                      }}
                      className="h-full bg-gradient-to-r from-[#255798] to-[#4d8ee8] rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8A8F98] pt-1">
                    <span>Điểm trung bình ban:</span>
                    <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/[0.08]">
                      {d.avgScore} / 10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Spectrum Distribution */}
        <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.4)] space-y-4">
          <h4 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-3.5 h-3.5 text-[#4d8ee8]" />
            Phổ điểm Đánh giá Phỏng vấn
          </h4>

          <div className="space-y-3">
            {/* Xuất sắc */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#8A8F98]">
                <span className="text-emerald-400 font-medium">
                  Xuất sắc (8.5 - 10.0)
                </span>
                <span className="font-mono font-bold text-white">
                  {statsData.excellent} ứng viên
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  style={{
                    width: `${
                      statsData.total > 0
                        ? (statsData.excellent / statsData.total) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            {/* Giỏi */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#8A8F98]">
                <span className="text-cyan-400 font-medium">Giỏi (7.0 - 8.4)</span>
                <span className="font-mono font-bold text-white">
                  {statsData.good} ứng viên
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  style={{
                    width: `${
                      statsData.total > 0
                        ? (statsData.good / statsData.total) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-cyan-400 rounded-full"
                />
              </div>
            </div>

            {/* Khá */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#8A8F98]">
                <span className="text-amber-400 font-medium">
                  Khá (5.0 - 6.9)
                </span>
                <span className="font-mono font-bold text-white">
                  {statsData.average} ứng viên
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  style={{
                    width: `${
                      statsData.total > 0
                        ? (statsData.average / statsData.total) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-amber-400 rounded-full"
                />
              </div>
            </div>

            {/* Dưới TB */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#8A8F98]">
                <span className="text-rose-400 font-medium">
                  Dưới trung bình (&lt; 5.0)
                </span>
                <span className="font-mono font-bold text-white">
                  {statsData.belowAverage} ứng viên
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  style={{
                    width: `${
                      statsData.total > 0
                        ? (statsData.belowAverage / statsData.total) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-rose-500 rounded-full"
                />
              </div>
            </div>

            {/* Chưa có điểm */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#8A8F98]">
                <span className="text-zinc-400 font-medium">
                  Chưa có điểm / Chưa phỏng vấn
                </span>
                <span className="font-mono font-bold text-white">
                  {statsData.unScored} ứng viên
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  style={{
                    width: `${
                      statsData.total > 0
                        ? (statsData.unScored / statsData.total) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-zinc-600 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* School Representation (Admin & Receptionist) */}
      {(isAdmin || isReceptionist) && statsData.sortedSchools.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.4)] space-y-4">
          <h4 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-2">
            <SchoolIcon className="w-3.5 h-3.5 text-[#4d8ee8]" />
            Trường / Khoa có số lượng ứng viên đông nhất
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {statsData.sortedSchools.map(([school, count]) => {
              const pct =
                statsData.total > 0
                  ? Math.round((count / statsData.total) * 100)
                  : 0;
              return (
                <div
                  key={school}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between hover:border-white/[0.1] transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p
                      className="text-xs font-medium text-white truncate"
                      title={school}
                    >
                      {school}
                    </p>
                    <p className="text-[11px] text-[#8A8F98] mt-0.5">
                      {pct}% tổng số ứng viên
                    </p>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#4d8ee8] shrink-0 bg-[#255798]/15 px-2.5 py-1 rounded-lg border border-[#255798]/30">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
