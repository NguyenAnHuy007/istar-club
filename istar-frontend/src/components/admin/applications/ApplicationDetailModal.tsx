"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ApplicationFormDto,
  ApplicationStatus,
  APPLICATION_STATUS_CONFIG,
  DEPARTMENT_CONFIG,
  AdminApplicationUpdateRequest,
} from "@/types/application";
import { Department, Area } from "@/types/user";
import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  MapPin,
  HelpCircle,
  CheckCircle2,
  XCircle,
  UserPlus,
  Edit3,
  Save,
  Award,
  Plus,
  Trash2,
  ExternalLink,
  Camera,
  Loader2,
  ChevronDown,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ImageViewerModal from "@/components/common/ImageViewerModal";
import { Facebook } from "@/components/common/Icons";
import Image from "next/image";
import { isAxiosError } from "axios";
import adminApplicationService from "@/services/adminApplicationService";
import commonCodeService from "@/services/commonCodeService";
import { HAUI_SCHOOLS } from "@/constants/schools";
import { DEPARTMENTS_LIST } from "@/constants/departments";
import { getApplicationStatusConfig } from "@/types/application";
import CustomSelect, { Option } from "@/components/common/CustomSelect";
import SelectWithOther from "@/components/common/SelectWithOther";
import FilterDatePicker from "@/components/admin/common/FilterDatePicker";

interface ApplicationDetailModalProps {
  isOpen: boolean;
  application: ApplicationFormDto | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ApplicationDetailModal({
  isOpen,
  application,
  onClose,
  onRefresh,
}: ApplicationDetailModalProps) {
  const { isAdmin, isReceptionist } = useAuth();
  const canEditAvatar = isAdmin || isReceptionist;

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState<AdminApplicationUpdateRequest>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(application?.avatarUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Danh mục trường học và khóa học từ DB
  const [schoolOptions, setSchoolOptions] = useState<{ value: string; label: string }[]>(
    HAUI_SCHOOLS.map((s) => ({ value: s, label: s }))
  );
  const [courseOptions, setCourseOptions] = useState<{ value: string; label: string }[]>(
    ["K21", "K20", "K19", "K18", "K17", "K16"].map((c) => ({ value: c, label: c }))
  );

  useEffect(() => {
    setCurrentAvatarUrl(application?.avatarUrl || null);
  }, [application?.avatarUrl]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const loadCommon = async () => {
      try {
        const [schools, courses] = await Promise.all([
          commonCodeService.getSchools().catch(() => null),
          commonCodeService.getAllCourses().catch(() => null),
        ]);
        if (isMounted) {
          if (schools && schools.length > 0) {
            setSchoolOptions(schools.map((s) => ({ value: s.name, label: s.name })));
          }
          if (courses && courses.length > 0) {
            setCourseOptions(courses.map((c) => ({ value: c.code, label: c.code || c.name })));
          }
        }
      } catch (err) {
        console.error("Lỗi tải danh mục trường/khóa:", err);
      }
    };
    loadCommon();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !application) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Dung lượng ảnh tối đa là 5MB!");
      return;
    }

    setIsUploadingAvatar(true);
    setActionMessage(null);
    try {
      const newUrl = await adminApplicationService.uploadAvatar(application.id, file);
      setCurrentAvatarUrl(newUrl);
      onRefresh();
      setActionMessage("Tải ảnh đại diện thành công!");
    } catch (err: unknown) {
      console.error("Lỗi upload avatar:", err);
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage("Lỗi tải ảnh: " + (msg || "Vui lòng thử lại"));
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  if (!isOpen || !application) return null;

  const fullName = `${application.lastName || ""} ${application.firstName || ""}`.trim() || "Chưa có tên";
  const statusCfg = getApplicationStatusConfig(application.status);

  const handleStartEdit = () => {
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
      knowIStar: application.knowIStar || "",
      reasonIStarer: application.reasonIStarer || "",
      status: application.status,
      departments:
        application.applicationDepartments?.map((d) => ({
          department: d.department,
          status: d.status,
          interviewScore: d.interviewScore,
          interviewNotes: d.interviewNotes,
        })) || [],
    });
    setIsEditing(true);
  };

  const handleAddDepartment = (dept: Department) => {
    const currentDepts = editForm.departments || [];
    if (currentDepts.some((d) => d.department === dept)) return;
    setEditForm({
      ...editForm,
      departments: [
        ...currentDepts,
        {
          department: dept,
          status: ApplicationStatus.SUBMITTED,
          interviewScore: null,
          interviewNotes: "",
        },
      ],
    });
  };

  const handleRemoveDepartment = (dept: Department) => {
    const currentDepts = editForm.departments || [];
    setEditForm({
      ...editForm,
      departments: currentDepts.filter((d) => d.department !== dept),
    });
  };

  const handleUpdateDeptField = (
    dept: Department,
    field: "status" | "interviewScore" | "interviewNotes",
    value: unknown
  ) => {
    const currentDepts = editForm.departments || [];
    setEditForm({
      ...editForm,
      departments: currentDepts.map((d) => {
        if (d.department === dept) {
          return { ...d, [field]: value };
        }
        return d;
      }),
    });
  };

  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.updateApplication(application.id, editForm);
      setIsEditing(false);
      onRefresh();
      setActionMessage("Cập nhật thông tin đơn ứng tuyển thành công!");
    } catch (error: unknown) {
      console.error("Lỗi khi cập nhật đơn:", error);
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setActionMessage("Lỗi khi cập nhật: " + (msg || "Đã có lỗi xảy ra"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Xác nhận DUYỆT ĐƠN cho ứng viên này?")) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.approveApplication(application.id);
      onRefresh();
      setActionMessage("Duyệt đơn ứng tuyển thành công!");
    } catch (error: unknown) {
      console.error("Lỗi khi duyệt đơn:", error);
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setActionMessage("Lỗi duyệt đơn: " + (msg || "Đã có lỗi xảy ra"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Xác nhận TỪ CHỐI đơn ứng tuyển này?")) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.rejectApplication(application.id);
      onRefresh();
      setActionMessage("Đã từ chối đơn ứng tuyển.");
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setActionMessage("Lỗi từ chối đơn: " + (msg || "Đã có lỗi xảy ra"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!confirm("Tạo tài khoản thành viên hệ thống từ đơn ứng tuyển này?")) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.createAccount(application.id);
      onRefresh();
      setActionMessage("Tạo tài khoản thành viên thành công!");
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setActionMessage("Lỗi tạo tài khoản: " + (msg || "Đã có lỗi xảy ra"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-[#0a0a0c] border border-white/[0.08] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden text-[#EDEDEF]"
        >
          {/* Header Banner with Profile Summary */}
          <div className="relative p-4 sm:p-6 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-white/[0.01] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-4 sm:gap-5 min-w-0 w-full md:w-auto">
              {/* Candidate Identity */}
              <div
                onClick={() => setIsImageViewerOpen(true)}
                className="relative group shrink-0 cursor-pointer"
                title="Bấm để xem ảnh phóng to"
              >
                <input
                  ref={avatarInputRef}
                  type="file"
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {currentAvatarUrl ? (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shrink-0 shadow-[0_0_25px_rgba(37,87,152,0.35)] bg-black/40 group-hover:border-[#4d8ee8]/70 transition-all">
                    <Image
                      src={currentAvatarUrl}
                      alt={fullName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#255798] to-[#4d8ee8] flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shrink-0 shadow-[0_0_25px_rgba(37,87,152,0.35)] border-2 border-white/10 group-hover:border-[#4d8ee8]/50 transition-all">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                  <Eye className="w-5 h-5 text-white mb-0.5" />
                  <span className="text-[10px] font-medium text-white/90">Xem ảnh</span>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1.5">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                    {fullName}
                  </h2>
                  {isEditing ? (
                    <div className="w-36 sm:w-40">
                      <CustomSelect
                        value={editForm.status || application.status}
                        onChange={(val) =>
                          setEditForm({
                            ...editForm,
                            status: val as ApplicationStatus,
                          })
                        }
                        options={Object.values(ApplicationStatus).map((status) => ({
                          value: status,
                          label: APPLICATION_STATUS_CONFIG[status].label,
                        }))}
                      />
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${statusCfg.badgeBg} ${statusCfg.badgeBorder} ${statusCfg.textColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                      {statusCfg.label}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#8A8F98]">
                  <span>Đơn #{application.id}</span>
                  <span>•</span>
                  <span className="truncate max-w-[140px] sm:max-w-none">Đợt: {application.recruitmentName || "Chưa gán đợt"}</span>
                  <span>•</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                    application.area === Area.HANOI
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {application.area === Area.HANOI ? "Cơ sở 1 (Hà Nội)" : "Cơ sở 3 (Ninh Bình)"}
                  </span>
                  {application.createdAt && (
                    <>
                      <span>•</span>
                      <span className="whitespace-nowrap">
                        Nộp: {new Date(application.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </>
                  )}
                  {application.checkedInAt && (
                    <>
                      <span>•</span>
                      <span className="whitespace-nowrap text-amber-400 font-medium">
                        Check-in: {new Date(application.checkedInAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </>
                  )}
                  {application.interviewedAt && (
                    <>
                      <span>•</span>
                      <span className="whitespace-nowrap text-cyan-400 font-medium">
                        Xong PV: {new Date(application.interviewedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
              {!isEditing && (
                <>
                  {application.status !== ApplicationStatus.APPROVED &&
                    application.status !== ApplicationStatus.REJECTED && (
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Duyệt đơn</span>
                      </button>
                    )}

                  {application.status !== ApplicationStatus.REJECTED && (
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-400 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 transition-all cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Từ chối đơn</span>
                    </button>
                  )}

                  {application.status === ApplicationStatus.APPROVED && (
                    <button
                      type="button"
                      onClick={handleCreateAccount}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#255798] hover:bg-[#316ebf] border border-[#255798]/50 transition-all shadow-[0_0_12px_rgba(37,87,152,0.3)] cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Tạo tài khoản</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa thông tin</span>
                  </button>
                </>
              )}

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white bg-[#255798] hover:bg-[#316ebf] transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8A8F98] hover:text-[#EDEDEF] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors cursor-pointer ml-auto sm:ml-0"
              >
                <X className="w-4 h-4" />
                <span>Đóng</span>
              </button>
            </div>
          </div>

          {/* Action Message Alert */}
          {actionMessage && (
            <div className="px-6 py-2.5 bg-[#255798]/15 border-b border-[#255798]/30 text-xs text-[#4d8ee8] flex items-center justify-between">
              <span>{actionMessage}</span>
              <button
                onClick={() => setActionMessage(null)}
                className="text-[#4d8ee8] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* SECTION 1: Personal & Contact Information */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#4d8ee8]" />
                Thông tin cá nhân & Liên hệ
              </h3>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="form-label">Họ đệm</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.lastName || ""}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Tên</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.firstName || ""}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={editForm.email || ""}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.phoneNumber || ""}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Ngày sinh</label>
                    <FilterDatePicker
                      id="edit-detail-birthday"
                      value={editForm.birthday || ""}
                      onChange={(date) => setEditForm({ ...editForm, birthday: date })}
                      placeholder="Chọn ngày sinh..."
                      maxDate={new Date().toISOString().substring(0, 10)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Địa chỉ thường trú</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.address || ""}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Link Facebook cá nhân</label>
                    <div className="relative">
                      <input
                        type="url"
                        className="form-input !pl-10"
                        value={editForm.facebookUrl || ""}
                        onChange={(e) => setEditForm({ ...editForm, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/..."
                      />
                      <Facebook className="w-4 h-4 text-[#1877F2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Cơ sở phỏng vấn</label>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98]">Email:</span>
                    <span className="text-[#EDEDEF] font-medium">{application.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98]">SĐT:</span>
                    <span className="text-[#EDEDEF] font-medium font-mono">
                      {application.phoneNumber || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98]">Ngày sinh:</span>
                    <span className="text-[#EDEDEF] font-medium">
                      {application.birthday
                        ? new Date(application.birthday).toLocaleDateString("vi-VN")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98]">Địa chỉ:</span>
                    <span className="text-[#EDEDEF] font-medium">
                      {application.address || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-[#8A8F98] shrink-0" />
                    <span className="text-[#8A8F98]">Cơ sở phỏng vấn:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      application.area === Area.HANOI
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                    }`}>
                      {application.area === Area.HANOI ? "Cơ sở 1 (Hà Nội)" : "Cơ sở 3 (Ninh Bình)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:col-span-2">
                    <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
                    <span className="text-[#8A8F98]">Facebook:</span>
                    {application.facebookUrl ? (
                      <a
                        href={application.facebookUrl.startsWith("http") ? application.facebookUrl : `https://${application.facebookUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4d8ee8] hover:text-[#7bb0f8] hover:underline flex items-center gap-1.5 font-medium truncate"
                      >
                        <span className="truncate">{application.facebookUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-[#8A8F98] italic">Chưa cung cấp</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Education Information */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-wider mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#4d8ee8]" />
                Thông tin học vấn tại HaUI
              </h3>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="form-label">Trường / Khoa</label>
                    <SelectWithOther
                      value={editForm.school || ""}
                      onChange={(val) => setEditForm({ ...editForm, school: val })}
                      options={schoolOptions}
                      placeholder="-- Chọn Trường/Khoa --"
                      otherLabel="Khác (Nhập trường khác)..."
                      otherPlaceholder="Nhập tên trường/khoa..."
                    />
                  </div>
                  <div>
                    <label className="form-label">Ngành / Lớp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.majorClass || ""}
                      onChange={(e) => setEditForm({ ...editForm, majorClass: e.target.value })}
                      placeholder="VD: KHMT01, CNTT 02..."
                    />
                  </div>
                  <div>
                    <label className="form-label">Khóa sinh viên</label>
                    <SelectWithOther
                      value={editForm.course || ""}
                      onChange={(val) => setEditForm({ ...editForm, course: val })}
                      options={courseOptions}
                      placeholder="-- Chọn Khóa --"
                      otherLabel="Khác (Nhập khóa khác)..."
                      otherPlaceholder="Nhập khóa (VD: K22...)"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-[#8A8F98] mb-1">Trường / Khoa</span>
                    <span className="text-[#EDEDEF] font-medium">
                      {application.school || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#8A8F98] mb-1">Ngành / Lớp</span>
                    <span className="text-[#EDEDEF] font-medium">
                      {application.majorClass || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#8A8F98] mb-1">Khóa sinh viên</span>
                    <span className="text-[#EDEDEF] font-medium">
                      {application.course || "—"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Motivation & Reasons */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#4d8ee8]" />
                Động lực & Lý do gia nhập CLB
              </h3>

              <div>
                <span className="block text-xs text-[#8A8F98] mb-1.5 font-medium">
                  1. Bạn biết đến CLB iStar qua đâu?
                </span>
                {isEditing ? (
                  <textarea
                    className="form-input"
                    rows={2}
                    value={editForm.knowIStar || ""}
                    onChange={(e) => setEditForm({ ...editForm, knowIStar: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-[#EDEDEF] bg-black/30 p-3 rounded-lg border border-white/[0.04]">
                    {application.knowIStar || "Không có câu trả lời"}
                  </p>
                )}
              </div>

              <div>
                <span className="block text-xs text-[#8A8F98] mb-1.5 font-medium">
                  2. Lý do bạn muốn trở thành một iStarer?
                </span>
                {isEditing ? (
                  <textarea
                    className="form-input resize-y overflow-y-auto min-h-[60px]"
                    rows={3}
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
                  />
                ) : (
                  <p className="text-sm text-[#EDEDEF] bg-black/30 p-3 rounded-lg border border-white/[0.04] leading-relaxed">
                    {application.reasonIStarer || "Không có câu trả lời"}
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 4: Department Preferences & Interview Scores */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-4">
                <h3 className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#4d8ee8]" />
                  Nguyện vọng Ban & Kết quả Đánh giá Phỏng vấn
                </h3>

                {isEditing && (
                  <div className="relative">
                    {DEPARTMENTS_LIST.filter(
                      (d) =>
                        !(editForm.departments || []).some(
                          (ed) => ed.department === d.code
                        )
                    ).length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsAddDeptOpen(!isAddDeptOpen)}
                          className="h-8 px-2.5 text-xs font-medium rounded-lg text-sky-300 bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 hover:border-sky-500/50 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm ban ứng tuyển</span>
                          <ChevronDown className="w-3 h-3 text-sky-300/70 ml-0.5" />
                        </button>

                        <AnimatePresence>
                          {isAddDeptOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsAddDeptOpen(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-1.5 w-48 py-1 bg-[#0D0E12]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                              >
                                {DEPARTMENTS_LIST.filter(
                                  (d) =>
                                    !(editForm.departments || []).some(
                                      (ed) => ed.department === d.code
                                    )
                                ).map((d) => (
                                  <button
                                    key={d.code}
                                    type="button"
                                    onClick={() => {
                                      handleAddDepartment(d.code);
                                      setIsAddDeptOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-medium text-[#EDEDEF] hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-2 cursor-pointer"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                    {d.name}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  {(!editForm.departments || editForm.departments.length === 0) ? (
                    <p className="text-xs text-[#8A8F98] italic">
                      Chưa có ban nào được chọn. Hãy bấm &ldquo;+ Thêm ban ứng tuyển&rdquo; ở trên.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editForm.departments.map((dept) => {
                        const conf = DEPARTMENT_CONFIG[dept.department];
                        return (
                          <div
                            key={dept.department}
                            className="bg-black/50 border border-white/[0.1] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-inner"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                  conf
                                    ? `${conf.badgeBg} ${conf.badgeBorder} ${conf.textColor}`
                                    : "bg-white/10 text-white border-white/20"
                                }`}
                              >
                                {conf ? conf.name : dept.department}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRemoveDepartment(dept.department)}
                                title="Xóa ban này"
                                className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Status of department */}
                            <div>
                              <label className="block text-xs text-[#8A8F98] mb-1">
                                Trạng thái ban
                              </label>
                              <CustomSelect
                                value={dept.status || ApplicationStatus.SUBMITTED}
                                onChange={(val) =>
                                  handleUpdateDeptField(
                                    dept.department,
                                    "status",
                                    val as ApplicationStatus
                                  )
                                }
                                options={Object.values(ApplicationStatus).map((status) => ({
                                  value: status,
                                  label: `${APPLICATION_STATUS_CONFIG[status].label} (${status})`,
                                }))}
                              />
                            </div>

                            {/* Interview Score */}
                            <div>
                              <label className="block text-xs text-[#8A8F98] mb-1">
                                Điểm phỏng vấn (0.0 - 10.0)
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                value={dept.interviewScore !== undefined && dept.interviewScore !== null ? dept.interviewScore : ""}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "") {
                                    handleUpdateDeptField(dept.department, "interviewScore", null);
                                  } else {
                                    const num = parseFloat(raw);
                                    if (!isNaN(num)) {
                                      handleUpdateDeptField(dept.department, "interviewScore", Math.min(10, Math.max(0, num)));
                                    }
                                  }
                                }}
                                placeholder="Nhập điểm số (ví dụ: 8.5)"
                                className="no-spinner w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.1] text-white focus:border-[#255798] focus:outline-none font-mono"
                              />
                            </div>

                            {/* Interview Notes */}
                            <div>
                              <label className="block text-xs text-[#8A8F98] mb-1">
                                Ghi chú & Nhận xét phỏng vấn
                              </label>
                              <textarea
                                rows={2}
                                value={dept.interviewNotes || ""}
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
                                  handleUpdateDeptField(
                                    dept.department,
                                    "interviewNotes",
                                    e.target.value
                                  )
                                }
                                placeholder="Nhận xét kỹ năng, thái độ, sự phù hợp..."
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.1] text-white focus:border-[#255798] focus:outline-none resize-y overflow-y-auto min-h-[56px]"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                application.applicationDepartments &&
                application.applicationDepartments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.applicationDepartments.map((dept) => {
                      const conf = DEPARTMENT_CONFIG[dept.department];
                      const deptStatus = APPLICATION_STATUS_CONFIG[dept.status] || {
                        label: dept.status,
                        badgeBg: "bg-white/10",
                        badgeBorder: "border-white/20",
                        textColor: "text-white",
                        dotColor: "bg-white",
                      };

                      return (
                        <div
                          key={dept.id || dept.department}
                          className="bg-black/40 border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                conf
                                  ? `${conf.badgeBg} ${conf.badgeBorder} ${conf.textColor}`
                                  : "bg-white/10 text-white border-white/20"
                              }`}
                            >
                              {conf ? conf.name : dept.department}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${deptStatus.badgeBg} ${deptStatus.badgeBorder} ${deptStatus.textColor}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${deptStatus.dotColor}`} />
                              {deptStatus.label}
                            </span>
                          </div>

                          {/* Điểm số & Người phỏng vấn */}
                          <div className="space-y-2 text-xs border-t border-white/[0.04] pt-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[#8A8F98]">Điểm phỏng vấn:</span>
                              <span className="font-bold text-sm text-[#4d8ee8]">
                                {dept.interviewScore !== null && dept.interviewScore !== undefined
                                  ? `${dept.interviewScore} / 10`
                                  : "Chưa chấm điểm"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[#8A8F98]">Người phỏng vấn:</span>
                              <span className="text-[#EDEDEF] font-medium">
                                {dept.interviewerName || "Chưa phân công"}
                              </span>
                            </div>

                            {dept.interviewNotes && (
                              <div className="mt-2 pt-2 border-t border-white/[0.04]">
                                <span className="block text-[#8A8F98] mb-1">Ghi chú & Nhận xét:</span>
                                <textarea
                                  readOnly
                                  value={dept.interviewNotes}
                                  ref={(el) => {
                                    if (el) {
                                      el.style.height = "auto";
                                      el.style.height = `${Math.max(el.scrollHeight, 44)}px`;
                                    }
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs text-[#EDEDEF] italic rounded-lg bg-white/[0.03] border border-white/[0.06] focus:outline-none resize-y overflow-y-auto cursor-default min-h-[44px]"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#8A8F98] italic">
                    Ứng viên chưa đăng ký ban cụ thể nào.
                  </p>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Lightbox Image Viewer */}
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        imageUrl={currentAvatarUrl}
        candidateName={fullName}
        applicationId={application.id}
        canEdit={canEditAvatar}
        onAvatarUpdated={(newUrl) => {
          setCurrentAvatarUrl(newUrl);
          onRefresh();
        }}
      />
    </AnimatePresence>
  );
}
