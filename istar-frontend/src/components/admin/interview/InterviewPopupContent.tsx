"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  MapPin,
  HelpCircle,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  RotateCcw,
  Edit3,
  Save,
  Award,
  AlertCircle,
  Loader2,
  X,
  Mic,
  Camera,
  Eye,
  CalendarRange,
  Clock,
} from "lucide-react";
import ImageViewerModal from "@/components/common/ImageViewerModal";
import { Facebook } from "@/components/common/Icons";
import { isAxiosError } from "axios";
import SelectWithOther from "@/components/common/SelectWithOther";
import CustomSelect from "@/components/common/CustomSelect";
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
import { notifyOpener } from "@/utils/broadcast";
import { useCommonCodes } from "@/hooks/useCommonCodes";

interface InterviewPopupContentProps {
  applicationId: number;
}

export default function InterviewPopupContent({ applicationId }: InterviewPopupContentProps) {
  const { user, isAdmin, isReceptionist, isInterviewer } = useAuth();

  const [application, setApplication] = useState<ApplicationFormDto | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState<AdminApplicationUpdateRequest>({});
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
  const { coursesList, schoolOptions } = useCommonCodes();

  // Avatar upload in edit mode
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [scoringState, setScoringState] = useState<
    Record<number, { score: string; notes: string; isSubmitting: boolean }>
  >({});

  const loadApplication = useCallback(async () => {
    try {
      const app = await adminApplicationService.getApplicationById(applicationId);
      setApplication(app);
      setEditForm({
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        phoneNumber: app.phoneNumber || "",
        birthday: app.birthday || "",
        address: app.address || "",
        facebookUrl: app.facebookUrl || "",
        school: app.school || "",
        majorClass: app.majorClass || "",
        course: app.course || "",
        area: app.area || Area.NINH_BINH,
        knowIStar: app.knowIStar || "",
        reasonIStarer: app.reasonIStarer || "",
        status: app.status,
      });
      const initialScoring: Record<number, { score: string; notes: string; isSubmitting: boolean }> = {};
      app.applicationDepartments?.forEach((dept) => {
        initialScoring[dept.id] = {
          score: dept.interviewScore !== undefined && dept.interviewScore !== null ? String(dept.interviewScore) : "",
          notes: dept.interviewNotes || "",
          isSubmitting: false,
        };
      });
      setScoringState(initialScoring);
    } catch {
      setLoadError("Không thể tải dữ liệu đơn ứng tuyển.");
    } finally {
      setLoadingApp(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleRefresh = useCallback(async () => {
    await loadApplication();
    notifyOpener("INTERVIEW_UPDATED");
  }, [loadApplication]);

  if (loadingApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0B0E]">
        <div className="flex flex-col items-center gap-4 text-[#8A8F98]">
          <Loader2 className="w-8 h-8 animate-spin text-[#255798]" />
          <p className="text-sm">Đang tải dữ liệu ứng viên...</p>
        </div>
      </div>
    );
  }

  if (loadError || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0B0E]">
        <div className="text-center text-rose-400 space-y-2">
          <AlertCircle className="w-10 h-10 mx-auto" />
          <p className="text-sm">{loadError || "Không tìm thấy đơn ứng tuyển."}</p>
        </div>
      </div>
    );
  }

  const fullName = `${application.lastName || ""} ${application.firstName || ""}`.trim() || "Chưa có tên";
  const statusCfg = getApplicationStatusConfig(application.status);

  const canScoreDept = (deptCode: Department) => {
    if (isAdmin) return true;
    if (!isInterviewer) return false;
    const userDepts = user?.userDepartments?.map((ud) => ud.department) || [];
    return userDepts.includes(deptCode);
  };

  const handleCheckIn = async () => {
    setIsSubmitting(true); setActionMessage(null);
    try {
      await interviewService.checkIn(application.id);
      setActionMessage({ type: "success", text: "Đã điểm danh ứng viên thành công!" });
      await handleRefresh();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: (isAxiosError(err) ? err.response?.data?.message : null) || "Lỗi khi điểm danh" });
    } finally { setIsSubmitting(false); }
  };

  const handleNoShow = async () => {
    if (!confirm("Xác nhận đánh dấu ứng viên VẮNG MẶT?")) return;
    setIsSubmitting(true); setActionMessage(null);
    try {
      await interviewService.noShow(application.id);
      setActionMessage({ type: "success", text: "Đã đánh dấu vắng mặt!" });
      await handleRefresh();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: (isAxiosError(err) ? err.response?.data?.message : null) || "Lỗi khi báo vắng" });
    } finally { setIsSubmitting(false); }
  };

  const handleRevertSubmitted = async () => {
    setIsSubmitting(true); setActionMessage(null);
    try {
      await interviewService.revertSubmitted(application.id);
      setActionMessage({ type: "success", text: "Đã hoàn tác về Đã nộp đơn!" });
      await handleRefresh();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: (isAxiosError(err) ? err.response?.data?.message : null) || "Lỗi khi hoàn tác" });
    } finally { setIsSubmitting(false); }
  };

  const handleSaveEdit = async () => {
    setIsSubmitting(true); setActionMessage(null);
    try {
      if (selectedAvatarFile) {
        try {
          await adminApplicationService.uploadAvatar(application.id, selectedAvatarFile);
        } catch { /* non-critical */ }
      }
      await adminApplicationService.updateApplication(application.id, editForm);
      setIsEditing(false);
      setSelectedAvatarFile(null);
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
      setActionMessage({ type: "success", text: "Cập nhật thông tin ứng viên thành công!" });
      await handleRefresh();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: (isAxiosError(err) ? err.response?.data?.message : null) || "Lỗi khi cập nhật" });
    } finally { setIsSubmitting(false); }
  };

  const handleStartDeptInterview = async (deptId: number) => {
    try {
      await interviewService.startInterview(deptId);
      setActionMessage({ type: "success", text: "Đã bắt đầu phỏng vấn ban này!" });
      await handleRefresh();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: (isAxiosError(err) ? err.response?.data?.message : null) || "Lỗi khi nhận phỏng vấn" });
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
    setScoringState((prev) => ({ ...prev, [deptId]: { ...prev[deptId], isSubmitting: true } }));
    setActionMessage(null);
    try {
      await interviewService.completeInterview(deptId, { interviewScore: scoreNum, interviewNotes: current.notes.trim() });
      setActionMessage({ type: "success", text: "Đã lưu kết quả phỏng vấn! Nếu tất cả ban đã xong, đơn tự chuyển sang Đã phỏng vấn." });
      await handleRefresh();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: (isAxiosError(err) ? err.response?.data?.message : null) || "Lỗi khi lưu kết quả" });
    } finally {
      setScoringState((prev) => ({ ...prev, [deptId]: { ...prev[deptId], isSubmitting: false } }));
    }
  };

  const handleApprove = async () => {
    if (!confirm(`Xác nhận DUYỆT ĐƠN cho ứng viên ${fullName}?`)) return;
    setIsSubmitting(true); setActionMessage(null);
    try {
      await adminApplicationService.approveApplication(application.id);
      setActionMessage({ type: "success", text: "Duyệt đơn ứng tuyển thành công!" });
      await handleRefresh();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: (isAxiosError(err) ? err.response?.data?.message : null) || "Lỗi khi duyệt đơn" });
    } finally { setIsSubmitting(false); }
  };

  const handleReject = async () => {
    if (!confirm(`Xác nhận TỪ CHỐI đơn ứng viên ${fullName}?`)) return;
    setIsSubmitting(true); setActionMessage(null);
    try {
      await adminApplicationService.rejectApplication(application.id);
      setActionMessage({ type: "success", text: "Đã từ chối đơn ứng tuyển." });
      await handleRefresh();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: (isAxiosError(err) ? err.response?.data?.message : null) || "Lỗi khi từ chối đơn" });
    } finally { setIsSubmitting(false); }
  };

  const isInterviewableStatus =
    application.status === ApplicationStatus.CHECKED_IN ||
    application.status === ApplicationStatus.INTERVIEWING;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B0E] text-[#EDEDEF]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0D0E12]/85 backdrop-blur-md border-b border-white/[0.06]">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#255798]/60 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div
              onClick={() => setIsImageViewerOpen(true)}
              className="relative group shrink-0 cursor-pointer"
              title="Bấm để xem ảnh phóng to"
            >
              {avatarPreviewUrl || application.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreviewUrl || application.avatarUrl!}
                  alt={fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#255798]/40 shadow-[0_0_16px_rgba(37,87,152,0.35)] group-hover:border-[#4d8ee8]/70 transition-all"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#255798] to-[#4d8ee8] flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-[0_0_20px_rgba(37,87,152,0.4)] border-2 border-white/10 group-hover:border-[#4d8ee8]/50 transition-all">
                  {application.firstName ? application.firstName.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              {/* Hover overlay hint */}
              <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                <Eye className="w-5 h-5 text-white mb-0.5" />
                <span className="text-[10px] font-medium text-white/90">Xem ảnh</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-base sm:text-lg font-semibold text-white truncate">{fullName}</h1>
                {isAdmin && isEditing ? (
                  <div className="w-36 sm:w-40 ml-1">
                    <CustomSelect
                      value={editForm.status || application.status}
                      onChange={(val) => setEditForm({ ...editForm, status: val as ApplicationStatus })}
                      options={[
                        { value: ApplicationStatus.SUBMITTED, label: "Đã nộp đơn" },
                        { value: ApplicationStatus.CHECKED_IN, label: "Đã check-in" },
                        { value: ApplicationStatus.INTERVIEWING, label: "Đang phỏng vấn" },
                        { value: ApplicationStatus.INTERVIEWED, label: "Đã phỏng vấn" },
                        { value: ApplicationStatus.APPROVED, label: "Trúng tuyển" },
                        { value: ApplicationStatus.REJECTED, label: "Từ chối" },
                        { value: ApplicationStatus.NO_SHOW, label: "Vắng mặt" },
                      ]}
                      placeholder="Chọn trạng thái"
                    />
                  </div>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCfg.badgeBg} ${statusCfg.badgeBorder} ${statusCfg.textColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                    {statusCfg.label}
                  </span>
                )}
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
                {(application.status === ApplicationStatus.SUBMITTED || application.status === ApplicationStatus.NO_SHOW) && (
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
                {(application.status === ApplicationStatus.SUBMITTED || application.status === ApplicationStatus.CHECKED_IN) && (
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
                {(application.status === ApplicationStatus.CHECKED_IN || application.status === ApplicationStatus.NO_SHOW) && (
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

            {isCandidateEditableByRole && !isEditing && (
              <button type="button" onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer">
                <Edit3 className="w-3.5 h-3.5" /><span>Sửa thông tin</span>
              </button>
            )}
            {isEditing && (
              <>
                <button type="button" onClick={handleSaveEdit} disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white bg-[#255798] hover:bg-[#316ebf] transition-all cursor-pointer disabled:opacity-50">
                  <Save className="w-3.5 h-3.5" /><span>Lưu thay đổi</span>
                </button>
                <button type="button" onClick={() => {
                  setIsEditing(false);
                  setSelectedAvatarFile(null);
                  if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
                  setAvatarPreviewUrl(null);
                }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-white bg-white/[0.04] border border-white/[0.08] cursor-pointer">
                  <X className="w-3.5 h-3.5" /><span>Hủy</span>
                </button>
              </>
            )}
            <button type="button" onClick={() => window.close()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer">
              <X className="w-3.5 h-3.5" /><span>Đóng</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Top Action Toast — Zero layout shift */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-lg w-full px-4 pointer-events-none">
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

      {/* Body */}
      <div className="flex-1 p-3.5 sm:p-6 max-w-5xl mx-auto w-full space-y-4 sm:space-y-6">

        {/* Section 1: Thông tin cá nhân & Đơn ứng tuyển */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
          <h3 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#4d8ee8]" />1. Thông tin cá nhân &amp; Đơn ứng tuyển
          </h3>
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-sm">
              <div><label className="block text-xs text-[#8A8F98] mb-1">Họ đệm</label>
                <input type="text" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" value={editForm.lastName || ""} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8A8F98] mb-1">Tên</label>
                <input type="text" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" value={editForm.firstName || ""} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8A8F98] mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8A8F98] mb-1">Số điện thoại</label>
                <input type="text" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" value={editForm.phoneNumber || ""} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8A8F98] mb-1">Ngày sinh</label>
                <FilterDatePicker
                  id="popup-interview-birthday"
                  value={editForm.birthday || ""}
                  onChange={(date) => setEditForm({ ...editForm, birthday: date })}
                  placeholder="Chọn ngày sinh..."
                  maxDate={new Date().toISOString().substring(0, 10)}
                />
              </div>
              <div><label className="block text-xs text-[#8A8F98] mb-1">Địa chỉ</label>
                <input type="text" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" value={editForm.address || ""} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8A8F98] mb-1">Trường / Khoa</label>
                <SelectWithOther value={editForm.school || ""} onChange={(val) => setEditForm({ ...editForm, school: val })} options={schoolOptions} placeholder="Chọn trường/khoa" /></div>
              <div><label className="block text-xs text-[#8A8F98] mb-1">Ngành / Lớp</label>
                <input type="text" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" value={editForm.majorClass || ""} onChange={(e) => setEditForm({ ...editForm, majorClass: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8A8F98] mb-1">Khóa</label>
                <SelectWithOther value={editForm.course || ""} onChange={(val) => setEditForm({ ...editForm, course: val })} options={coursesList} placeholder="Chọn khóa" /></div>
              <div className="sm:col-span-2 lg:col-span-3"><label className="block text-xs text-[#8A8F98] mb-1">Link Facebook</label>
                <div className="relative">
                  <input type="url" className="w-full px-3 py-2 text-sm pl-9 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" value={editForm.facebookUrl || ""} onChange={(e) => setEditForm({ ...editForm, facebookUrl: e.target.value })} placeholder="https://facebook.com/..." />
                  <Facebook className="w-4 h-4 text-[#1877F2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs text-[#8A8F98] mb-1">Cơ sở phỏng vấn</label>
                <div className="grid grid-cols-2 gap-2">
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
              <div className="flex items-center gap-2.5 min-w-0"><Mail className="w-4 h-4 text-[#8A8F98] shrink-0" /><span className="text-[#8A8F98] shrink-0">Email:</span><span className="text-[#EDEDEF] font-medium truncate">{application.email}</span></div>
              <div className="flex items-center gap-2.5 min-w-0"><Phone className="w-4 h-4 text-[#8A8F98] shrink-0" /><span className="text-[#8A8F98] shrink-0">SĐT:</span><span className="text-[#EDEDEF] font-medium font-mono">{application.phoneNumber || "—"}</span></div>
              <div className="flex items-center gap-2.5 min-w-0"><Calendar className="w-4 h-4 text-[#8A8F98] shrink-0" /><span className="text-[#8A8F98] shrink-0">Ngày sinh:</span><span className="text-[#EDEDEF] font-medium">{application.birthday ? new Date(application.birthday).toLocaleDateString("vi-VN") : "—"}</span></div>
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
              <div className="flex items-center gap-2.5 min-w-0"><MapPin className="w-4 h-4 text-[#8A8F98] shrink-0" /><span className="text-[#8A8F98] shrink-0">Địa chỉ:</span><span className="text-[#EDEDEF] truncate">{application.address || "—"}</span></div>
              <div className="flex items-center gap-2.5 min-w-0"><GraduationCap className="w-4 h-4 text-[#8A8F98] shrink-0" /><span className="text-[#8A8F98] shrink-0">Trường:</span><span className="text-[#EDEDEF] truncate">{application.school || "—"}</span></div>
              <div className="flex items-center gap-2.5 min-w-0"><span className="text-[#8A8F98] shrink-0">Lớp / Khóa:</span><span className="text-[#EDEDEF] truncate">{application.majorClass || "—"} {application.course && <span className="text-[#4d8ee8] font-semibold">({application.course})</span>}</span></div>
              {application.recruitmentName && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <CalendarRange className="w-4 h-4 text-[#4d8ee8] shrink-0" />
                  <span className="text-[#8A8F98] shrink-0">Đợt tuyển:</span>
                  <span className="text-[#4d8ee8] font-medium truncate">{application.recruitmentName}</span>
                </div>
              )}
              {application.facebookUrl && (
                <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2.5 min-w-0">
                  <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
                  <a href={application.facebookUrl.startsWith("http") ? application.facebookUrl : `https://${application.facebookUrl}`} target="_blank" rel="noopener noreferrer" className="text-[#4d8ee8] hover:underline text-xs truncate">{application.facebookUrl}</a>
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

        {/* Section 2: Động lực & Lý do gia nhập CLB (Câu hỏi tìm hiểu) */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5 space-y-4">
          <h3 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#4d8ee8]" />2. Động lực &amp; Lý do gia nhập CLB (Câu hỏi tìm hiểu)
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
              1. Bạn biết đến CLB iStar qua đâu?
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none"
                value={editForm.knowIStar || ""}
                onChange={(e) => setEditForm({ ...editForm, knowIStar: e.target.value })}
                placeholder="VD: Fanpage iStar, Bạn bè giới thiệu, Sự kiện chào tân sinh viên..."
              />
            ) : (
              <textarea
                readOnly
                value={application.knowIStar || "Chưa có câu trả lời"}
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = `${Math.max(el.scrollHeight, 40)}px`;
                  }
                }}
                className="w-full px-3 py-2 text-xs text-[#EDEDEF] italic rounded-lg bg-white/[0.03] border border-white/[0.06] focus:outline-none resize-y overflow-y-auto cursor-default min-h-[40px]"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
              2. Lý do bạn muốn trở thành một iStar-er?
            </label>
            {isEditing ? (
              <textarea
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none resize-y overflow-y-auto min-h-[60px]"
                value={editForm.reasonIStarer || ""}
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = `${Math.max(el.scrollHeight, 60)}px`;
                  }
                }}
                onInput={(e) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = `${Math.max(target.scrollHeight, 60)}px`;
                }}
                onChange={(e) => setEditForm({ ...editForm, reasonIStarer: e.target.value })}
                placeholder="Chia sẻ về đam mê nghệ thuật, nguyện vọng và mục tiêu của bạn..."
              />
            ) : (
              <textarea
                readOnly
                value={application.reasonIStarer || "Chưa có câu trả lời"}
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = `${Math.max(el.scrollHeight, 56)}px`;
                  }
                }}
                className="w-full px-3 py-2 text-xs text-[#EDEDEF] italic rounded-lg bg-white/[0.03] border border-white/[0.06] focus:outline-none resize-y overflow-y-auto cursor-default min-h-[56px]"
              />
            )}
          </div>
        </div>

        {/* Section: Thao tác Lễ tân / Reception (chỉ hiện dạng thẻ riêng cho ADMIN khi trạng thái có hành động khả dụng) */}
        {isAdmin && !isEditing && (
          application.status === ApplicationStatus.SUBMITTED ||
          application.status === ApplicationStatus.CHECKED_IN ||
          application.status === ApplicationStatus.NO_SHOW
        ) && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />Thao tác Trạng thái &amp; Điểm danh
            </h3>
            <p className="text-xs text-[#8A8F98] mb-3">Chuyển nhanh trạng thái hồ sơ ứng viên tại bàn phỏng vấn / điểm danh:</p>
            <div className="flex flex-wrap gap-2.5">
              {(application.status === ApplicationStatus.SUBMITTED || application.status === ApplicationStatus.NO_SHOW) && (
                <button type="button" onClick={handleCheckIn} disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all cursor-pointer disabled:opacity-50">
                  <UserCheck className="w-3.5 h-3.5" /><span>Check-in</span>
                </button>
              )}
              {(application.status === ApplicationStatus.SUBMITTED || application.status === ApplicationStatus.CHECKED_IN) && (
                <button type="button" onClick={handleNoShow} disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-zinc-300 bg-zinc-500/15 border border-zinc-500/30 hover:bg-zinc-500/25 transition-all cursor-pointer disabled:opacity-50">
                  <UserX className="w-3.5 h-3.5" /><span>Vắng mặt</span>
                </button>
              )}
              {(application.status === ApplicationStatus.CHECKED_IN || application.status === ApplicationStatus.NO_SHOW) && (
                <button type="button" onClick={handleRevertSubmitted} disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-[#8A8F98] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer disabled:opacity-50">
                  <RotateCcw className="w-3.5 h-3.5" /><span>Hoàn tác về Đã nộp đơn</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Section 3: Phỏng vấn theo ban (chỉ hiển thị khi không phải lễ tân) */}
        {isInterviewableStatus && (!isReceptionist || isAdmin) && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />3. Chấm điểm Phỏng vấn theo Ban
            </h3>
            <div className="space-y-4">
              {application.applicationDepartments?.map((dept) => {
                const cfg = DEPARTMENT_CONFIG[dept.department] || { name: dept.department, badgeBg: "bg-white/10", badgeBorder: "border-white/20", textColor: "text-white" };
                const deptScoring = scoringState[dept.id] || { score: "", notes: "", isSubmitting: false };
                const canScore = canScoreDept(dept.department);
                const isDeptDone = dept.status === ApplicationStatus.INTERVIEWED;
                const isDeptInterviewing = dept.status === ApplicationStatus.INTERVIEWING;

                return (
                  <div key={dept.id} className={`p-4 rounded-xl border ${isDeptDone ? "border-cyan-500/20 bg-cyan-500/5" : isDeptInterviewing ? "border-purple-500/25 bg-purple-500/5" : "border-white/[0.06] bg-white/[0.01]"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.textColor}`}>{cfg.name}</span>
                        {isDeptDone && <span className="text-xs text-cyan-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Đã phỏng vấn</span>}
                        {isDeptInterviewing && <span className="text-xs text-purple-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />Đang phỏng vấn</span>}
                      </div>
                      {!isDeptDone && !isDeptInterviewing && canScore && (
                        <button type="button" onClick={() => handleStartDeptInterview(dept.id)}
                          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-purple-300 bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 transition-colors cursor-pointer">
                          <Mic className="w-3.5 h-3.5" /><span>Bắt đầu phỏng vấn</span>
                        </button>
                      )}
                    </div>

                    {isDeptDone ? (
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span className="text-xs text-[#8A8F98]">Điểm số:</span>
                          <span className="font-mono font-bold text-amber-300 text-sm">
                            {dept.interviewScore !== undefined && dept.interviewScore !== null ? `${dept.interviewScore} / 10` : "—"}
                          </span>
                        </div>
                        {dept.interviewNotes && (
                          <div>
                            <span className="block text-xs font-medium text-[#8A8F98] mb-1">Nhận xét của ban:</span>
                            <textarea
                              readOnly
                              value={dept.interviewNotes}
                              ref={(el) => {
                                if (el) {
                                  el.style.height = "auto";
                                  el.style.height = `${Math.max(el.scrollHeight, 44)}px`;
                                }
                              }}
                              className="w-full px-3 py-2 text-xs text-[#EDEDEF] italic rounded-lg bg-white/[0.03] border border-white/[0.08] focus:outline-none resize-y overflow-y-auto cursor-default min-h-[44px]"
                            />
                          </div>
                        )}
                      </div>
                    ) : canScore ? (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-medium text-[#8A8F98] mb-1">Điểm (0.0 - 10.0) <span className="text-rose-400">*</span></label>
                          <input
                            type="number" min="0" max="10" step="0.1" placeholder="8.5"
                            value={deptScoring.score}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "" || raw === "-") { setScoringState((prev) => ({ ...prev, [dept.id]: { ...prev[dept.id], score: raw } })); }
                              else {
                                const num = parseFloat(raw);
                                if (!isNaN(num)) { setScoringState((prev) => ({ ...prev, [dept.id]: { ...prev[dept.id], score: String(Math.min(10, Math.max(0, num))) } })); }
                              }
                            }}
                            className="no-spinner w-full px-3 py-2 text-sm font-mono font-semibold rounded-lg bg-white/[0.04] border border-white/[0.1] text-white focus:border-[#4d8ee8] focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-medium text-[#8A8F98] mb-1">Nhận xét chi tiết <span className="text-rose-400">*</span></label>
                          <textarea
                            rows={2}
                            placeholder="Ghi nhận xét về chuyên môn, thái độ, kỹ năng..."
                            value={deptScoring.notes}
                            ref={(el) => {
                              if (el) {
                                el.style.height = "auto";
                                el.style.height = `${Math.max(el.scrollHeight, 60)}px`;
                              }
                            }}
                            onInput={(e) => {
                              const target = e.currentTarget;
                              target.style.height = "auto";
                              target.style.height = `${Math.max(target.scrollHeight, 60)}px`;
                            }}
                            onChange={(e) => setScoringState((prev) => ({ ...prev, [dept.id]: { ...prev[dept.id], notes: e.target.value } }))}
                            className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.1] text-white placeholder:text-[#8A8F98]/50 focus:border-[#4d8ee8] focus:outline-none resize-y overflow-y-auto min-h-[60px]"
                          />
                        </div>
                        <div className="sm:col-span-4 flex justify-end">
                          <button type="button" onClick={() => handleSaveScore(dept.id)} disabled={deptScoring.isSubmitting}
                            className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#255798] hover:bg-[#316ebf] shadow-[0_0_12px_rgba(37,87,152,0.3)] transition-all cursor-pointer disabled:opacity-50">
                            {deptScoring.isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Đang lưu...</span></> : <><Save className="w-3.5 h-3.5" /><span>Lưu kết quả ban này</span></>}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#8A8F98] italic">Ban này do phỏng vấn viên khác phụ trách.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 4: Admin - Duyệt / Từ chối */}
        {isAdmin && application.status === ApplicationStatus.INTERVIEWED && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />4. Xét duyệt Kết quả
            </h3>
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button type="button" onClick={handleApprove} disabled={isSubmitting}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50">
                <CheckCircle2 className="w-4 h-4" /><span>Duyệt đơn</span>
              </button>
              <button type="button" onClick={handleReject} disabled={isSubmitting}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-rose-300 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer disabled:opacity-50">
                <XCircle className="w-4 h-4" /><span>Từ chối đơn</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Image Viewer */}
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        imageUrl={avatarPreviewUrl || application.avatarUrl || null}
        candidateName={fullName}
        applicationId={application.id}
        canEdit={canEditAvatar}
        onAvatarUpdated={(newUrl) => {
          setAvatarPreviewUrl(newUrl);
          loadApplication();
          notifyOpener("APPLICATION_UPDATED");
        }}
      />
    </div>
  );
}