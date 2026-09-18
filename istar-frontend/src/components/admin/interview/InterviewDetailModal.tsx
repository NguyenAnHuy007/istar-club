"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  RotateCcw,
  Edit3,
  Save,
  Award,
  AlertCircle,
  UserPlus,
  ExternalLink,
  Eye,
  CalendarRange,
} from "lucide-react";
import Image from "next/image";
import ImageViewerModal from "@/components/common/ImageViewerModal";
import { Facebook } from "@/components/common/Icons";
import { isAxiosError } from "axios";
import SelectWithOther from "@/components/common/SelectWithOther";
import adminApplicationService from "@/services/adminApplicationService";
import interviewService from "@/services/interviewService";
import FilterDatePicker from "@/components/admin/common/FilterDatePicker";
import {
  ApplicationFormDto,
  ApplicationStatus,
  getApplicationStatusConfig,
  DEPARTMENT_CONFIG,
  AdminApplicationUpdateRequest,
} from "@/types/application";
import { useAuth } from "@/context/AuthContext";
import { Department, Area } from "@/types/user";
import { useCommonCodes } from "@/hooks/useCommonCodes";

interface InterviewDetailModalProps {
  isOpen: boolean;
  application: ApplicationFormDto | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function InterviewDetailModal({
  isOpen,
  application,
  onClose,
  onRefresh,
}: InterviewDetailModalProps) {
  const { user, isAdmin, isReceptionist, isInterviewer } = useAuth();

  // Edit Candidate State
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState<AdminApplicationUpdateRequest>({});
  const { coursesList, schoolOptions } = useCommonCodes();
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const isCandidateEditableByRole = isAdmin || (
    isReceptionist && (
      application?.status === ApplicationStatus.SUBMITTED ||
      application?.status === ApplicationStatus.CHECKED_IN ||
      application?.status === ApplicationStatus.NO_SHOW
    )
  );
  const canEditAvatar = isCandidateEditableByRole;

  // Scoring state per department: Record<departmentId, { score: number | ""; notes: string; isSubmitting: boolean }>
  const [scoringState, setScoringState] = useState<
    Record<number, { score: string; notes: string; isSubmitting: boolean }>
  >({});

  // Initialize editForm and scoringState when application changes
  useEffect(() => {
    if (application) {
      setEditForm({
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phoneNumber: application.phoneNumber || "",
        birthday: application.birthday || "",
        address: application.address || "",
        facebookUrl: application.facebookUrl || "",
        school: application.school || "",
        majorClass: application.majorClass || "",
        course: application.course || "",
        area: application.area || Area.NINH_BINH,
      });

      const initialScoring: Record<number, { score: string; notes: string; isSubmitting: boolean }> = {};
      application.applicationDepartments?.forEach((dept) => {
        initialScoring[dept.id] = {
          score: dept.interviewScore !== undefined && dept.interviewScore !== null ? String(dept.interviewScore) : "",
          notes: dept.interviewNotes || "",
          isSubmitting: false,
        };
      });
      setScoringState(initialScoring);
      setIsEditing(false);
      setActionMessage(null);
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const fullName = `${application.lastName || ""} ${application.firstName || ""}`.trim() || "Chưa có tên";
  const statusCfg = getApplicationStatusConfig(application.status);

  // Check if current user is allowed to score a specific department
  const canScoreDept = (deptCode: Department) => {
    if (isAdmin) return true;
    if (!isInterviewer) return false;
    // Check if interviewer belongs to this department
    const userDepts = user?.userDepartments?.map((ud) => ud.department) || [];
    return userDepts.includes(deptCode);
  };

  // --- RECEPTION ACTIONS ---
  const handleCheckIn = async () => {
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await interviewService.checkIn(application.id);
      setActionMessage({ type: "success", text: "Đã điểm danh ứng viên thành công!" });
      onRefresh();
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi điểm danh ứng viên" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoShow = async () => {
    if (!confirm("Xác nhận đánh dấu ứng viên VẮNG MẶT?")) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await interviewService.noShow(application.id);
      setActionMessage({ type: "success", text: "Đã đánh dấu vắng mặt cho ứng viên!" });
      onRefresh();
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi báo vắng mặt" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevertSubmitted = async () => {
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await interviewService.revertSubmitted(application.id);
      setActionMessage({ type: "success", text: "Đã hoàn tác về trạng thái Đã nộp đơn!" });
      onRefresh();
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi hoàn tác trạng thái" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CANDIDATE EDIT ACTIONS ---
  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.updateApplication(application.id, editForm);
      setIsEditing(false);
      setActionMessage({ type: "success", text: "Cập nhật thông tin ứng viên thành công!" });
      onRefresh();
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi cập nhật thông tin" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- INTERVIEW SCORING ACTIONS ---
  const handleStartDeptInterview = async (deptId: number) => {
    try {
      await interviewService.startInterview(deptId);
      setActionMessage({ type: "success", text: "Đã bắt đầu phỏng vấn ban này!" });
      onRefresh();
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi nhận phỏng vấn" });
    }
  };

  const handleSaveScore = async (deptId: number) => {
    const current = scoringState[deptId];
    if (!current) return;

    const scoreNum = parseFloat(current.score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      setActionMessage({ type: "error", text: "Vui lòng nhập điểm phỏng vấn từ 0 đến 10" });
      return;
    }

    if (!current.notes.trim()) {
      setActionMessage({ type: "error", text: "Vui lòng nhập nhận xét phỏng vấn" });
      return;
    }

    setScoringState((prev) => ({
      ...prev,
      [deptId]: { ...prev[deptId], isSubmitting: true },
    }));
    setActionMessage(null);

    try {
      await interviewService.completeInterview(deptId, {
        interviewScore: scoreNum,
        interviewNotes: current.notes.trim(),
      });
      setActionMessage({
        type: "success",
        text: "Đã lưu kết quả phỏng vấn thành công! (Nếu tất cả ban đã xong, đơn sẽ tự động chuyển sang Đã phỏng vấn)",
      });
      onRefresh();
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi lưu kết quả phỏng vấn" });
    } finally {
      setScoringState((prev) => ({
        ...prev,
        [deptId]: { ...prev[deptId], isSubmitting: false },
      }));
    }
  };

  // --- ADMIN APPROVE / REJECT ACTIONS ---
  const handleApprove = async () => {
    if (!confirm(`Xác nhận DUYỆT TRÚNG TUYỂN cho ứng viên ${fullName}?`)) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.approveApplication(application.id);
      setActionMessage({ type: "success", text: "Duyệt trúng tuyển ứng viên thành công!" });
      onRefresh();
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi duyệt đơn" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!confirm(`Xác nhận TỪ CHỐI ứng viên ${fullName}?`)) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.rejectApplication(application.id);
      setActionMessage({ type: "success", text: "Đã từ chối đơn ứng tuyển." });
      onRefresh();
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi từ chối đơn" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!confirm(`Tạo tài khoản thành viên mới cho ứng viên ${fullName}?`)) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.createAccount(application.id);
      setActionMessage({ type: "success", text: "Đã tạo tài khoản thành viên thành công!" });
      onRefresh();
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi tạo tài khoản" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-[#EDEDEF] overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-white/[0.06] bg-white/[0.01]">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div
                onClick={() => setIsImageViewerOpen(true)}
                className="relative group shrink-0 cursor-pointer"
                title="Bấm để xem ảnh phóng to"
              >
                {application.avatarUrl ? (
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-[#255798]/40 shadow-[0_0_12px_rgba(37,87,152,0.3)] group-hover:border-[#4d8ee8]/70 transition-all">
                    <Image
                      src={application.avatarUrl}
                      alt={fullName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#255798] to-[#4d8ee8] flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-[0_0_20px_rgba(37,87,152,0.4)] border-2 border-white/10 group-hover:border-[#4d8ee8]/50 transition-all">
                    {application.firstName ? application.firstName.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                  <Eye className="w-4 h-4 text-white mb-0.5" />
                  <span className="text-[9px] font-medium text-white/90">Xem ảnh</span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-white truncate">{fullName}</h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCfg.badgeBg} ${statusCfg.badgeBorder} ${statusCfg.textColor}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                    {statusCfg.label}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#8A8F98] mt-0.5">
                  <span>Đơn #{application.id}</span>
                  {application.createdAt && (
                    <>
                      <span>•</span>
                      <span>Nộp: {new Date(application.createdAt).toLocaleDateString("vi-VN")}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 self-end sm:self-auto">
              {/* Quick Actions in Header (Check-in / Vắng mặt / Hoàn tác) */}
              {(isAdmin || isReceptionist) && !isEditing && (
                <>
                  {(application.status === ApplicationStatus.SUBMITTED ||
                    application.status === ApplicationStatus.NO_SHOW) && (
                    <button
                      type="button"
                      onClick={handleCheckIn}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Check-in</span>
                    </button>
                  )}
                  {(application.status === ApplicationStatus.SUBMITTED ||
                    application.status === ApplicationStatus.CHECKED_IN) && (
                    <button
                      type="button"
                      onClick={handleNoShow}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-300 bg-zinc-500/15 border border-zinc-500/30 hover:bg-zinc-500/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Vắng mặt</span>
                    </button>
                  )}
                  {(application.status === ApplicationStatus.CHECKED_IN ||
                    application.status === ApplicationStatus.NO_SHOW) && (
                    <button
                      type="button"
                      onClick={handleRevertSubmitted}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Hoàn tác</span>
                    </button>
                  )}
                </>
              )}

              {/* Edit button for Receptionist & Admin */}
              {isCandidateEditableByRole && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa thông tin</span>
                </button>
              )}

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white bg-[#255798] hover:bg-[#316ebf] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-white bg-white/[0.04] border border-white/[0.08] cursor-pointer"
                  >
                    Hủy
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Đóng</span>
              </button>
            </div>
          </div>

          {/* Floating Action Alert Toast — Zero layout shift */}
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-lg w-full px-4 pointer-events-none">
            <AnimatePresence>
              {actionMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.94 }}
                  transition={{ duration: 0.25 }}
                  className={`pointer-events-auto p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs backdrop-blur-xl shadow-2xl ${
                    actionMessage.type === "success"
                      ? "bg-[#0b1612]/95 border-emerald-500/30 text-emerald-300 shadow-[0_8px_30px_rgba(16,185,129,0.2)]"
                      : "bg-[#180c0e]/95 border-rose-500/30 text-rose-300 shadow-[0_8px_30px_rgba(244,63,94,0.2)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {actionMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span className="font-medium truncate">{actionMessage.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActionMessage(null)}
                    className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
                    title="Đóng"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* SECTION 1: Personal & HaUI Education Info */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#4d8ee8]" />
                1. Thông tin cá nhân & Học vấn
              </h3>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="block text-xs text-[#8A8F98] mb-1">Họ đệm</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none"
                      value={editForm.lastName || ""}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8A8F98] mb-1">Tên</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none"
                      value={editForm.firstName || ""}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8A8F98] mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none"
                      value={editForm.email || ""}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8A8F98] mb-1">SĐT</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none"
                      value={editForm.phoneNumber || ""}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8A8F98] mb-1">Ngày sinh</label>
                    <FilterDatePicker
                      id="edit-interview-birthday"
                      value={editForm.birthday || ""}
                      onChange={(date) => setEditForm({ ...editForm, birthday: date })}
                      placeholder="Chọn ngày sinh..."
                      maxDate={new Date().toISOString().substring(0, 10)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8A8F98] mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none"
                      value={editForm.address || ""}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8A8F98] mb-1">Trường / Khoa</label>
                    <SelectWithOther
                      value={editForm.school || ""}
                      onChange={(val) => setEditForm({ ...editForm, school: val })}
                      options={schoolOptions}
                      placeholder="Chọn trường/khoa"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8A8F98] mb-1">Ngành / Lớp</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none"
                      value={editForm.majorClass || ""}
                      onChange={(e) => setEditForm({ ...editForm, majorClass: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8A8F98] mb-1">Khóa</label>
                    <SelectWithOther
                      value={editForm.course || ""}
                      onChange={(val) => setEditForm({ ...editForm, course: val })}
                      options={coursesList}
                      placeholder="Chọn khóa"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs text-[#8A8F98] mb-1">Link Facebook cá nhân</label>
                    <div className="relative">
                      <input
                        type="url"
                        className="w-full px-3 py-2 text-sm pl-9 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none"
                        value={editForm.facebookUrl || ""}
                        onChange={(e) => setEditForm({ ...editForm, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/..."
                      />
                      <Facebook className="w-4 h-4 text-[#1877F2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs text-[#8A8F98] mb-1">Cơ sở phỏng vấn</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, area: Area.NINH_BINH })}
                        className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                          (editForm.area || application.area || Area.NINH_BINH) === Area.NINH_BINH
                            ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30"
                            : "bg-white/[0.02] border-white/[0.08] text-[#8A8F98] hover:border-white/20"
                        }`}
                      >
                        Cơ sở 3 (Ninh Bình)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, area: Area.HANOI })}
                        className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                          (editForm.area || application.area) === Area.HANOI
                            ? "bg-blue-500/15 border-blue-500/50 text-blue-300 ring-1 ring-blue-500/30"
                            : "bg-white/[0.02] border-white/[0.08] text-[#8A8F98] hover:border-white/20"
                        }`}
                      >
                        Cơ sở 1 (Hà Nội)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98] shrink-0">Email:</span>
                    <span className="text-[#EDEDEF] font-medium truncate">{application.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98] shrink-0">SĐT:</span>
                    <span className="text-[#EDEDEF] font-medium font-mono">
                      {application.phoneNumber || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Calendar className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98] shrink-0">Ngày sinh:</span>
                    <span className="text-[#EDEDEF] font-medium">
                      {application.birthday ? new Date(application.birthday).toLocaleDateString("vi-VN") : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98] shrink-0">Cơ sở:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      application.area === Area.HANOI
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                    }`}>
                      {application.area === Area.HANOI ? "Cơ sở 1 (Hà Nội)" : "Cơ sở 3 (Ninh Bình)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GraduationCap className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98] shrink-0">Trường/Khoa:</span>
                    <span className="text-[#EDEDEF] font-medium truncate">{application.school || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono text-[#8A8F98] shrink-0">Lớp:</span>
                    <span className="text-[#EDEDEF] font-medium truncate">{application.majorClass || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono text-[#8A8F98] shrink-0">Khóa:</span>
                    <span className="text-[#4d8ee8] font-semibold">{application.course || "—"}</span>
                  </div>
                  {application.recruitmentName && (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CalendarRange className="w-4 h-4 text-[#4d8ee8] shrink-0" />
                      <span className="text-[#8A8F98] shrink-0">Đợt tuyển:</span>
                      <span className="text-[#4d8ee8] font-medium truncate">{application.recruitmentName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98] shrink-0">Địa chỉ:</span>
                    <span className="text-[#EDEDEF] truncate">{application.address || "—"}</span>
                  </div>
                  {application.facebookUrl && (
                    <div className="flex items-center gap-2.5 sm:col-span-2 lg:col-span-3 min-w-0">
                      <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
                      <span className="text-[#8A8F98] shrink-0">Facebook:</span>
                      <a
                        href={application.facebookUrl.startsWith("http") ? application.facebookUrl : `https://${application.facebookUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4d8ee8] hover:text-[#7bb0f8] hover:underline flex items-center gap-1.5 font-medium truncate"
                      >
                        <span className="truncate">{application.facebookUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  )}

                  {/* Ban ứng tuyển */}
                  {application.applicationDepartments && application.applicationDepartments.length > 0 && (
                    <div className="sm:col-span-2 lg:col-span-3 pt-3 border-t border-white/[0.04] flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#8A8F98] font-medium mr-1">Ban ứng tuyển:</span>
                      {application.applicationDepartments.map((ad) => {
                        const cfg = DEPARTMENT_CONFIG[ad.department];
                        return (
                          <span
                            key={ad.id}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg?.badgeBg || "bg-white/10"} ${cfg?.badgeBorder || "border-white/20"} ${cfg?.textColor || "text-white"}`}
                          >
                            {cfg?.name || ad.department}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Mốc thời gian */}
                  {(application.checkedInAt || application.interviewedAt) && (
                    <div className="sm:col-span-2 lg:col-span-3 pt-2.5 border-t border-white/[0.04] flex flex-wrap items-center gap-4 text-xs text-[#8A8F98]">
                      <span className="font-medium text-[#8A8F98]">Mốc thời gian:</span>
                      {application.checkedInAt && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Check-in: {new Date(application.checkedInAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</span>
                        </span>
                      )}
                      {application.interviewedAt && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Hoàn thành PV: {new Date(application.interviewedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 2: Reception Check-in Status (chỉ hiện dạng thẻ riêng cho ADMIN khi có hành động khả dụng) */}
            {isAdmin && !isEditing && (
              application.status === ApplicationStatus.SUBMITTED ||
              application.status === ApplicationStatus.CHECKED_IN ||
              application.status === ApplicationStatus.NO_SHOW
            ) && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      2. Thao tác Trạng thái &amp; Điểm danh
                    </h3>
                    <p className="text-xs text-[#8A8F98] mt-1">
                      Trạng thái hiện tại:{" "}
                      <span className={`font-medium ${statusCfg.textColor}`}>
                        {statusCfg.label}
                      </span>
                    </p>
                  </div>

                  {/* Receptionist and Admin Operations */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Button Check-in */}
                    {(application.status === ApplicationStatus.SUBMITTED ||
                      application.status === ApplicationStatus.NO_SHOW) && (
                      <button
                        type="button"
                        onClick={handleCheckIn}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Điểm danh (Check-in)</span>
                      </button>
                    )}

                    {/* Button No-Show */}
                    {(application.status === ApplicationStatus.SUBMITTED ||
                      application.status === ApplicationStatus.CHECKED_IN) && (
                      <button
                        type="button"
                        onClick={handleNoShow}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-zinc-800 border border-white/[0.08] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Báo vắng mặt</span>
                      </button>
                    )}

                    {/* Button Revert to Submitted */}
                    {(application.status === ApplicationStatus.CHECKED_IN ||
                      application.status === ApplicationStatus.NO_SHOW) && (
                      <button
                        type="button"
                        onClick={handleRevertSubmitted}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Về Đã nộp đơn</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: Department Evaluation & Scoring (chỉ hiển thị khi không phải lễ tân) */}
            {(!isReceptionist || isAdmin) && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#4d8ee8]" />
                  3. Đánh giá & Chấm điểm theo Ban
                </h3>
                <span className="text-xs text-[#8A8F98]">
                  Số ban: {application.applicationDepartments?.length || 0}
                </span>
              </div>

              <div className="space-y-4">
                {application.applicationDepartments?.map((dept) => {
                  const cfg = DEPARTMENT_CONFIG[dept.department] || {
                    name: dept.department,
                    badgeBg: "bg-white/10",
                    badgeBorder: "border-white/20",
                    textColor: "text-white",
                  };
                  const isAllowed = canScoreDept(dept.department);
                  const isInterviewed = dept.status === ApplicationStatus.INTERVIEWED;
                  const deptScoring = scoringState[dept.id] || { score: "", notes: "", isSubmitting: false };

                  return (
                    <div
                      key={dept.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3"
                    >
                      {/* Dept Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.textColor}`}
                          >
                            {cfg.name}
                          </span>
                          <span className="text-xs text-[#8A8F98]">
                            Trạng thái:{" "}
                            <span
                              className={
                                isInterviewed
                                  ? "text-cyan-400 font-medium"
                                  : dept.status === ApplicationStatus.INTERVIEWING
                                  ? "text-purple-400 font-medium"
                                  : "text-[#EDEDEF]"
                              }
                            >
                              {dept.status === ApplicationStatus.INTERVIEWED
                                ? "Đã phỏng vấn"
                                : dept.status === ApplicationStatus.INTERVIEWING
                                ? "Đang phỏng vấn"
                                : dept.status === ApplicationStatus.CHECKED_IN
                                ? "Chờ phỏng vấn"
                                : "Đã nộp đơn"}
                            </span>
                          </span>
                        </div>

                        {dept.interviewerName && (
                          <span className="text-xs text-[#8A8F98]">
                            Phỏng vấn bởi:{" "}
                            <span className="text-white font-medium">{dept.interviewerName}</span>
                          </span>
                        )}
                      </div>

                      {/* Scoring Inputs or Display */}
                      {isAllowed ? (
                        <div className="pt-2 border-t border-white/[0.05] space-y-3">
                          {dept.status === ApplicationStatus.CHECKED_IN && (
                            <button
                              type="button"
                              onClick={() => handleStartDeptInterview(dept.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-purple-300 bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 transition-colors cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Bắt đầu phỏng vấn</span>
                            </button>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-1">
                              <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                                Điểm (0 - 10) <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="8.5"
                                value={deptScoring.score}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "" || raw === "-") {
                                    setScoringState((prev) => ({
                                      ...prev,
                                      [dept.id]: { ...prev[dept.id], score: raw },
                                    }));
                                  } else {
                                    const num = parseFloat(raw);
                                    if (!isNaN(num)) {
                                      const clamped = Math.min(10, Math.max(0, num));
                                      setScoringState((prev) => ({
                                        ...prev,
                                        [dept.id]: { ...prev[dept.id], score: String(clamped) },
                                      }));
                                    }
                                  }
                                }}
                                className="no-spinner w-full px-3 py-2 text-sm font-mono font-semibold rounded-lg bg-white/[0.04] border border-white/[0.1] text-white focus:border-[#4d8ee8] focus:outline-none"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                                Nhận xét chi tiết <span className="text-rose-400">*</span>
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Ghi nhận xét về chuyên môn, thái độ, kỹ năng..."
                                value={deptScoring.notes}
                                ref={(el) => {
                                  if (el) {
                                    el.style.height = "auto";
                                    el.style.height = `${Math.max(el.scrollHeight, 56)}px`;
                                  }
                                }}
                                onInput={(e) => {
                                  const target = e.currentTarget;
                                  target.style.height = "auto";
                                  target.style.height = `${Math.max(target.scrollHeight, 56)}px`;
                                }}
                                onChange={(e) =>
                                  setScoringState((prev) => ({
                                    ...prev,
                                    [dept.id]: { ...prev[dept.id], notes: e.target.value },
                                  }))
                                }
                                className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.04] border border-white/[0.1] text-white focus:border-[#4d8ee8] focus:outline-none resize-y overflow-y-auto min-h-[56px]"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleSaveScore(dept.id)}
                              disabled={deptScoring.isSubmitting}
                              className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg text-white bg-[#255798] hover:bg-[#316ebf] shadow-[0_0_12px_rgba(37,87,152,0.3)] transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{deptScoring.isSubmitting ? "Đang lưu..." : "Lưu kết quả phỏng vấn"}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Read-only view for other departments
                        <div className="pt-2 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div className="sm:col-span-1">
                            <span className="text-[#8A8F98] block">Điểm số:</span>
                            <span className="text-sm font-semibold font-mono text-[#4d8ee8]">
                              {dept.interviewScore !== undefined && dept.interviewScore !== null
                                ? `${dept.interviewScore} / 10`
                                : "Chưa chấm"}
                            </span>
                          </div>
                          <div className="sm:col-span-3">
                            <span className="text-[#8A8F98] block mb-1">Nhận xét:</span>
                            <textarea
                              readOnly
                              value={dept.interviewNotes || "Chưa có nhận xét"}
                              ref={(el) => {
                                if (el) {
                                  el.style.height = "auto";
                                  el.style.height = `${Math.max(el.scrollHeight, 40)}px`;
                                }
                              }}
                              className="w-full px-2.5 py-1.5 text-xs text-[#EDEDEF] italic rounded-lg bg-white/[0.03] border border-white/[0.06] focus:outline-none resize-y overflow-y-auto cursor-default min-h-[40px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            {/* SECTION 4: Final Selection Review (Admin Only) */}
            {isAdmin && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      4. Hội đồng Xét duyệt Tuyển chọn (Chỉ Quản trị viên)
                    </h3>
                    <p className="text-xs text-[#8A8F98] mt-1">
                      Sau khi ứng viên hoàn thành phỏng vấn các ban, Quản trị viên đưa ra quyết định tuyển dụng.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {application.status !== ApplicationStatus.APPROVED && (
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Duyệt đơn</span>
                      </button>
                    )}

                    {application.status !== ApplicationStatus.REJECTED && (
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-rose-300 hover:text-white bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Từ chối đơn</span>
                      </button>
                    )}

                    {application.status === ApplicationStatus.APPROVED && (
                      <button
                        type="button"
                        onClick={handleCreateAccount}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-white bg-[#255798] hover:bg-[#316ebf] shadow-[0_0_15px_rgba(37,87,152,0.35)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Tạo tài khoản thành viên</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Lightbox Image Viewer */}
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        imageUrl={application.avatarUrl || null}
        candidateName={fullName}
        applicationId={application.id}
        canEdit={canEditAvatar}
        onAvatarUpdated={() => {
          onRefresh();
        }}
      />
    </AnimatePresence>
  );
}
