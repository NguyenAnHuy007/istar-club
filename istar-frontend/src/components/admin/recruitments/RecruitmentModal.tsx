"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecruitmentDto, CreateRecruitmentRequest } from "@/types/recruitment";
import { X, CalendarRange, Calendar, Save, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import adminRecruitmentService from "@/services/adminRecruitmentService";
import FilterDatePicker from "@/components/admin/common/FilterDatePicker";
import RichTextEditor from "@/components/common/RichTextEditor";
import { isAxiosError } from "axios";
import { useToast } from "@/context/ToastContext";

interface RecruitmentModalProps {
  isOpen: boolean;
  recruitment: RecruitmentDto | null; // null means create mode
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecruitmentModal({
  isOpen,
  recruitment,
  onClose,
  onSuccess,
}: RecruitmentModalProps) {
  const [formData, setFormData] = useState<CreateRecruitmentRequest>({
    name: "",
    startDate: "",
    endDate: "",
    isActive: true,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Sync formData safely with useEffect when modal opens or recruitment changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: recruitment?.name || "",
        startDate: recruitment?.startDate ? recruitment.startDate.substring(0, 10) : "",
        endDate: recruitment?.endDate ? recruitment.endDate.substring(0, 10) : "",
        isActive: recruitment ? recruitment.isActive : true,
        description: recruitment?.description || "",
      });
    }
  }, [isOpen, recruitment]);

  if (!isOpen) return null;

  const isEditMode = Boolean(recruitment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("Tên đợt tuyển thành viên không được để trống.");
      return;
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      toast.warning("Ngày bắt đầu không được sau ngày kết thúc.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && recruitment) {
        await adminRecruitmentService.updateRecruitment(recruitment.id, formData);
      } else {
        await adminRecruitmentService.createRecruitment(formData);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Lỗi lưu đợt tuyển:", error);
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      toast.error(msg || "Đã có lỗi xảy ra khi lưu đợt tuyển thành viên.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0a0a0c] border border-white/[0.08] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden text-[#EDEDEF]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#255798]/20 border border-[#255798]/30 flex items-center justify-center shrink-0">
                <CalendarRange className="w-5 h-5 text-[#4d8ee8]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-white truncate">
                  {isEditMode ? "Chỉnh sửa đợt tuyển" : "Khởi tạo đợt tuyển mới"}
                </h2>
                <p className="text-xs text-[#8A8F98] truncate">
                  {isEditMode
                    ? `Cập nhật thông tin đợt #${recruitment?.id}`
                    : "Thiết lập thông tin cho chiến dịch tuyển thành viên mới"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Campaign Name */}
            <div>
              <label className="form-label">
                Tên đợt tuyển thành viên <span className="required">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Tuyển thành viên Gen 12 — Mùa Thu 2026"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="form-input text-sm"
              />
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="form-label flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#4d8ee8]" />
                  Ngày bắt đầu
                </label>
                <FilterDatePicker
                  id="recruitment-start-date"
                  value={formData.startDate || ""}
                  onChange={(date) =>
                    setFormData({ ...formData, startDate: date })
                  }
                  placeholder="Chọn ngày bắt đầu..."
                />
              </div>

              <div>
                <label className="form-label flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#4d8ee8]" />
                  Ngày kết thúc
                </label>
                <FilterDatePicker
                  id="recruitment-end-date"
                  value={formData.endDate || ""}
                  onChange={(date) =>
                    setFormData({ ...formData, endDate: date })
                  }
                  placeholder="Chọn ngày kết thúc..."
                />
              </div>
            </div>

            {/* Rich Text Campaign Description */}
            <div>
              <label className="form-label flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-[#4d8ee8]" />
                Thông tin & Kế hoạch tuyển thành viên (HTML)
              </label>
              <RichTextEditor
                value={formData.description || ""}
                onChange={(content) =>
                  setFormData({ ...formData, description: content })
                }
                placeholder="Nhập lịch trình phỏng vấn, địa điểm, thể lệ và lưu ý cho ứng viên..."
                minHeight="140px"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="recruitment-is-active"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#255798] focus:ring-[#255798] focus:ring-offset-0 cursor-pointer accent-[#255798]"
              />
              <label htmlFor="recruitment-is-active" className="text-xs text-[#EDEDEF] cursor-pointer select-none">
                Kích hoạt đợt tuyển này ngay (Tự động chuyển các đợt khác thành đã đóng)
              </label>
            </div>

            <div className="p-3 bg-[#255798]/10 border border-[#255798]/20 rounded-xl text-[11px] text-[#8A8F98] leading-relaxed">
              💡 <span className="text-[#EDEDEF] font-medium">Lưu ý nghiệp vụ:</span> Mỗi thời điểm chỉ có tối đa 1 đợt tuyển thành viên đang mở (<span className="text-emerald-400 font-mono">active</span>). Khi đợt mới được mở, hệ thống sẽ tự động liên kết các đơn ứng tuyển online gửi về vào đợt này.
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-white/[0.06] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-medium text-[#8A8F98] hover:text-[#EDEDEF] rounded-xl border border-white/[0.08] hover:bg-white/[0.04] transition-all text-center justify-center cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 text-xs font-medium text-white bg-[#255798] hover:bg-[#316ebf] rounded-xl border border-[#255798]/50 shadow-[0_0_16px_rgba(37,87,152,0.35)] transition-all active:scale-[0.98] cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật đợt" : "Tạo đợt tuyển"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
