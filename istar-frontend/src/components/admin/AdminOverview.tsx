"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Users,
  CalendarRange,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  CheckCircle2,
  Mic,
  Calendar,
  AlertCircle,
} from "lucide-react";
import adminDashboardService from "@/services/adminDashboardService";
import { DashboardStats } from "@/types/dashboard";
import IsometricBarChart3D from "./dashboard/charts/IsometricBarChart3D";
import DepthDonutChart3D from "./dashboard/charts/DepthDonutChart3D";
import GlowingAreaChart from "./dashboard/charts/GlowingAreaChart";
import SchoolRankingCard from "./dashboard/charts/SchoolRankingCard";

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
});

// Resilient default fallback stats to guarantee layout integrity
const DEFAULT_STATS: DashboardStats = {
  overview: {
    totalApplications: 0,
    pendingApplications: 0,
    interviewedApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    noShowApplications: 0,
    totalMembers: 0,
    applicationsToday: 0,
    activeCampaignId: null,
    activeCampaignTitle: "Chưa có chiến dịch tuyển thành viên nào đang mở",
    activeCampaignStartDate: null,
    activeCampaignEndDate: null,
    activeCampaignIsActive: false,
  },
  statusBreakdown: [
    { status: "SUBMITTED", label: "Đã nộp đơn", count: 0, percentage: 0, color: "#3b82f6" },
    { status: "CHECKED_IN", label: "Chờ phỏng vấn", count: 0, percentage: 0, color: "#f59e0b" },
    { status: "INTERVIEWING", label: "Đang phỏng vấn", count: 0, percentage: 0, color: "#a855f7" },
    { status: "INTERVIEWED", label: "Đã phỏng vấn", count: 0, percentage: 0, color: "#06b6d4" },
    { status: "APPROVED", label: "Trúng tuyển", count: 0, percentage: 0, color: "#10b981" },
    { status: "REJECTED", label: "Từ chối", count: 0, percentage: 0, color: "#f43f5e" },
    { status: "NO_SHOW", label: "Vắng mặt", count: 0, percentage: 0, color: "#71717a" },
  ],
  departmentStats: [
    { department: "MUSIC", name: "Ban Âm nhạc", total: 0, interviewed: 0, approved: 0, rejected: 0, avgScore: "—", percentage: 0 },
    { department: "RAP", name: "Ban Rap", total: 0, interviewed: 0, approved: 0, rejected: 0, avgScore: "—", percentage: 0 },
    { department: "MEDIA_AND_EVENT", name: "Ban TT&TCSK", total: 0, interviewed: 0, approved: 0, rejected: 0, avgScore: "—", percentage: 0 },
    { department: "DANCE", name: "Ban Vũ đạo", total: 0, interviewed: 0, approved: 0, rejected: 0, avgScore: "—", percentage: 0 },
  ],
  dailyTrend: [
    { date: "07/09", fullDate: "2026-09-07", count: 0, approvedCount: 0 },
    { date: "08/09", fullDate: "2026-09-08", count: 0, approvedCount: 0 },
    { date: "09/09", fullDate: "2026-09-09", count: 0, approvedCount: 0 },
    { date: "10/09", fullDate: "2026-09-10", count: 0, approvedCount: 0 },
    { date: "11/09", fullDate: "2026-09-11", count: 0, approvedCount: 0 },
    { date: "12/09", fullDate: "2026-09-12", count: 0, approvedCount: 0 },
    { date: "13/09", fullDate: "2026-09-13", count: 0, approvedCount: 0 },
  ],
  schoolRankings: [],
  courseDistribution: [],
};

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      setError(null);
      const data = await adminDashboardService.getDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      console.error("Lỗi tải dữ liệu dashboard:", err);
      setError("Không thể đồng bộ số liệu mới nhất từ máy chủ. Đang hiển thị bộ đệm an toàn.");
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const activeStats = stats || DEFAULT_STATS;
  const overview = activeStats.overview;

  const statCards = [
    {
      label: "Tổng đơn ứng tuyển",
      value: overview ? overview.totalApplications : "—",
      subLabel: "Toàn bộ chiến dịch",
      icon: FileText,
      color: "#255798",
      glow: "rgba(37, 87, 152, 0.25)",
      href: "/admin/applications",
    },
    {
      label: "Đang xử lý / Phỏng vấn",
      value: overview ? overview.pendingApplications : "—",
      subLabel: "Chờ PV & Đang PV",
      icon: Clock,
      color: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.2)",
      href: "/admin/interview",
    },
    {
      label: "Ứng viên trúng tuyển",
      value: overview ? overview.approvedApplications : "—",
      subLabel: "Đã phê duyệt tham gia",
      icon: CheckCircle2,
      color: "#10b981",
      glow: "rgba(16, 185, 129, 0.2)",
      href: "/admin/applications?status=APPROVED",
    },
    {
      label: "Đơn nộp hôm nay",
      value: overview ? overview.applicationsToday : "—",
      subLabel: "Trong ngày hôm nay",
      icon: TrendingUp,
      color: "#8b5cf6",
      glow: "rgba(139, 92, 246, 0.2)",
      href: "/admin/applications",
    },
  ];

  const quickActions = [
    {
      title: "Đơn ứng tuyển",
      description: "Xem, duyệt và quản lý toàn diện danh sách hồ sơ ứng viên.",
      href: "/admin/applications",
      icon: FileText,
      cta: "Xem danh sách",
      badge: overview ? `${overview.totalApplications} đơn` : undefined,
    },
    {
      title: "Phỏng vấn & Điểm danh",
      description: "Không gian chấm điểm trực tiếp, điều phối hàng chờ và điểm danh.",
      href: "/admin/interview",
      icon: Mic,
      cta: "Bàn phỏng vấn",
      badge: overview ? `${overview.pendingApplications} chờ PV` : undefined,
    },
    {
      title: "Đợt tuyển thành viên",
      description: "Khởi tạo, kích hoạt và kiểm soát các chiến dịch tuyển chọn.",
      href: "/admin/recruitments",
      icon: CalendarRange,
      cta: "Quản lý đợt",
      badge: overview?.activeCampaignIsActive ? "Đang mở" : "Chưa mở",
    },
    {
      title: "Quản lý thành viên",
      description: "Quản trị danh sách nhân sự CLB, phân bổ ban và phân quyền.",
      href: "/admin/users",
      icon: Users,
      cta: "Quản lý nhân sự",
      badge: overview ? `${overview.totalMembers} user` : undefined,
    },
  ];

  return (
    <div className="max-w-[1720px] w-full mx-auto space-y-6">
      {/* Page Header */}
      <motion.div
        {...fadeUp(0)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-[#255798]/20 text-[#4d8ee8] border border-[#255798]/30 shadow-sm">
              <LayoutDashboard className="w-3.5 h-3.5 text-[#4d8ee8]" />
              Executive Analytics Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
            Bảng điều khiển tổng quan
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8F98] mt-1">
            Theo dõi thời gian thực dữ liệu tuyển dụng, nhân sự và phân tích đa chiều CLB iStar
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchStats(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.03] hover:bg-white/[0.08] text-[#EDEDEF] border border-white/[0.08] transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#4d8ee8]" : ""}`} />
            <span>{refreshing ? "Đang đồng bộ..." : "Làm mới số liệu"}</span>
          </button>
        </div>
      </motion.div>

      {/* Error Alert Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchStats(true)}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </motion.div>
      )}

      {/* Active Campaign Spotlight Banner */}
      {overview?.activeCampaignId && (
        <motion.div
          {...fadeUp(0.05)}
          className="relative overflow-hidden rounded-2xl border border-[#255798]/30 bg-gradient-to-r from-[#255798]/15 via-[#14161F]/90 to-[#0A0B0E] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#255798]/20 border border-[#255798]/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,87,152,0.3)]">
              <CalendarRange className="w-5 h-5 text-[#4d8ee8]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Chiến dịch đang hoạt động
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                {overview.activeCampaignTitle}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[#8A8F98] mt-0.5">
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#8A8F98]" />
                  {overview.activeCampaignStartDate || "—"} ➜ {overview.activeCampaignEndDate || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/interview"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#255798] hover:bg-[#1e467a] shadow-[0_0_16px_rgba(37,87,152,0.4)] transition-all"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Vào Bàn phỏng vấn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            {...fadeUp(0.1 + i * 0.05)}
            className="relative group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.14] overflow-hidden flex flex-col justify-between h-full"
          >
            {/* Glow accent */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at bottom left, ${card.glow}, transparent 70%)`,
              }}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                  style={{ background: `${card.color}20` }}
                >
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <Link
                  href={card.href}
                  className="text-xs text-[#8A8F98] hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span>Chi tiết</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div>
                <p className="text-xs text-[#8A8F98] font-medium mb-1">{card.label}</p>
                {loading && !stats ? (
                  <div className="w-20 h-8 bg-white/[0.05] rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold font-mono text-white tracking-tight">
                    {card.value}
                  </p>
                )}
                <p className="text-[11px] text-[#8A8F98] mt-1">{card.subLabel}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 1 Charts: 3D Isometric Bar Chart & 3D Depth Donut Ring */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <motion.div {...fadeUp(0.2)} className="h-full flex flex-col">
          <IsometricBarChart3D data={activeStats.departmentStats} />
        </motion.div>
        <motion.div {...fadeUp(0.25)} className="h-full flex flex-col">
          <DepthDonutChart3D
            data={activeStats.statusBreakdown}
            totalApplications={overview?.totalApplications || 0}
          />
        </motion.div>
      </div>

      {/* Row 2 Charts: Glowing Spline Curve & School Demographics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <motion.div {...fadeUp(0.3)} className="h-full flex flex-col">
          <GlowingAreaChart data={activeStats.dailyTrend} />
        </motion.div>
        <motion.div {...fadeUp(0.35)} className="h-full flex flex-col">
          <SchoolRankingCard
            schools={activeStats.schoolRankings}
            courses={activeStats.courseDistribution}
          />
        </motion.div>
      </div>

      {/* Quick Action Navigation Cards */}
      <motion.div {...fadeUp(0.4)} className="pt-2">
        <h3 className="text-sm font-semibold text-[#8A8F98] uppercase tracking-wider mb-4">
          Lối tắt tác nghiệp hệ thống
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative flex flex-col justify-between p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.14] hover:-translate-y-1 h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#255798]/15 border border-[#255798]/30 flex items-center justify-center">
                    <action.icon className="w-5 h-5 text-[#4d8ee8]" />
                  </div>
                  {action.badge && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/[0.04] border border-white/[0.08] text-[#8A8F98]">
                      {action.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#4d8ee8] transition-colors mb-1">
                  {action.title}
                </h4>
                <p className="text-xs text-[#8A8F98] line-clamp-2">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-semibold text-[#4d8ee8] group-hover:text-white transition-colors">
                <span>{action.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
