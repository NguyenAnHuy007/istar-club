"use client";

import React from "react";
import { SchoolStatItem, CourseDistributionItem } from "@/types/dashboard";
import { GraduationCap, BookOpen } from "lucide-react";

interface SchoolRankingCardProps {
  schools?: SchoolStatItem[];
  courses?: CourseDistributionItem[];
}

export default function SchoolRankingCard({
  schools = [],
  courses = [],
}: SchoolRankingCardProps) {
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          bg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          label: "1",
        };
      case 1:
        return {
          bg: "bg-slate-300/20 text-slate-200 border-slate-300/40",
          label: "2",
        };
      case 2:
        return {
          bg: "bg-amber-700/20 text-amber-400 border-amber-700/40",
          label: "3",
        };
      default:
        return {
          bg: "bg-white/[0.04] text-[#8A8F98] border-white/[0.08]",
          label: String(index + 1),
        };
    }
  };

  const displayedSchools = schools.slice(0, 4);
  const totalStudents = schools.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Demographics
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nguồn sinh viên HaUI</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#4d8ee8]" />
          Top Trường / Khoa &amp; Khóa Sinh Viên
        </h3>
        <p className="text-xs text-[#8A8F98] mt-0.5">
          Phân bố nguồn ứng viên tiềm năng nộp hồ sơ vào iStar
        </p>
      </div>

      {/* Schools Ranked List */}
      <div className="space-y-2.5 my-3">
        {displayedSchools.length === 0 ? (
          <p className="text-xs text-[#8A8F98] py-4 text-center">
            Chưa có dữ liệu trường học.
          </p>
        ) : (
          displayedSchools.map((item, idx) => {
            const badge = getRankBadge(idx);
            return (
              <div
                key={item.school}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border shrink-0 ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-white font-medium truncate" title={item.school}>
                      {item.school}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-right">
                    <span className="font-mono font-bold text-white">{item.count}</span>
                    <span className="text-[10px] font-mono text-[#8A8F98]">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    style={{ width: `${Math.min(item.percentage * 2.2, 100)}%` }}
                    className="h-full bg-gradient-to-r from-[#255798] to-[#4d8ee8] rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Courses Distribution Section */}
      <div className="pt-3 border-t border-white/[0.06]">
        <h4 className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#4d8ee8]" />
          Phân bố theo Khóa học
        </h4>
        <div className="flex flex-wrap gap-2">
          {courses.length === 0 ? (
            <span className="text-xs text-[#8A8F98]">Chưa có dữ liệu</span>
          ) : (
            courses.map((c) => (
              <span
                key={c.course}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono bg-white/[0.03] text-[#EDEDEF] border border-white/[0.08] hover:border-[#255798]/50 transition-colors"
              >
                <span className="font-bold text-white">{c.course}</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#255798]/25 text-[#4d8ee8]">
                  {c.count}
                </span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Footer Insight */}
      <div className="pt-3 mt-2 flex items-center justify-between text-xs text-[#8A8F98] border-t border-white/[0.04]">
        <span className="flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tổng hồ sơ ghi nhận:</span>
          <strong className="text-white font-mono">{totalStudents}</strong>
        </span>
        <span className="text-[11px] text-[#8A8F98] hidden sm:inline">
          Đại học Công nghiệp Hà Nội
        </span>
      </div>
    </div>
  );
}
