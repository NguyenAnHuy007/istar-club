"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCheck, Info, Trash2, ImagePlus } from "lucide-react";
import { isAxiosError } from "axios";
import adminApplicationService from "@/services/adminApplicationService";
import interviewService from "@/services/interviewService";
import { ApplicationFormDto } from "@/types/application";
import { useFileUpload } from "@/hooks/useFileUpload";

interface CheckInModalProps {
  isOpen: boolean;
  application: ApplicationFormDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckInModal({
  isOpen,
  application,
  onClose,
  onSuccess,
}: CheckInModalProps) {
  const {
    selectedFile,
    previewUrl,
    isDragging,
    fileInputRef,
    errorMsg: fileErrorMsg,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemoveFile,
  } = useFileUpload();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string | null>(null);

  const errorMsg = submitErrorMsg || fileErrorMsg;
  const setErrorMsg = setSubmitErrorMsg;

  const fullName = application
    ? `${application.lastName || ""} ${application.firstName || ""}`.trim() || "Ứng viên"
    : "";

  const handleCheckIn = async () => {
    if (!application) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (selectedFile) {
        await adminApplicationService.uploadAvatar(application.id, selectedFile);
      }
      await interviewService.checkIn(application.id);
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setErrorMsg(msg || "Lỗi khi điểm danh. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    handleRemoveFile();
    setErrorMsg(null);
    onClose();
  };

  if (!isOpen || !application) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md max-h-[92vh] flex flex-col rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-[#EDEDEF] overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/[0.06] gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-[0_0_18px_rgba(16,185,129,0.3)] shrink-0">
                <UserCheck className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-white truncate">Điểm danh ứng viên</h2>
                <p className="text-xs text-[#8A8F98] mt-0.5 truncate">{fullName}</p>
              </div>
            </div>
            <button type="button" onClick={handleClose} className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
            <div className="flex gap-3 p-3.5 sm:p-4 rounded-xl bg-[#255798]/10 border border-[#255798]/20">
              <Info className="w-4 h-4 text-[#4d8ee8] shrink-0 mt-0.5" />
              <div className="text-xs text-[#8A8F98] leading-relaxed">
                <span className="font-semibold text-[#4d8ee8]">Chức năng Check-in: </span>
                Xác nhận ứng viên đã có mặt tại bàn lễ tân và sẵn sàng phỏng vấn. Bạn có thể tải lên <span className="text-white">ảnh chân dung</span> ứng viên (tùy chọn) để ban giám khảo dễ nhận diện.
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8A8F98] mb-2">Ảnh đại diện ứng viên <span className="font-normal">(tùy chọn)</span></p>
              {previewUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-white/[0.08] bg-black/30 flex items-center justify-center min-h-[120px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="max-h-40 max-w-full object-contain" />
                  <button type="button" onClick={handleRemoveFile} className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" title="Xóa ảnh">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${isDragging ? "border-[#255798] bg-[#255798]/10" : "border-white/[0.1] hover:border-white/[0.2] bg-white/[0.02] hover:bg-white/[0.04]"}`}
                >
                  <ImagePlus className={`w-7 h-7 ${isDragging ? "text-[#4d8ee8]" : "text-[#8A8F98]"}`} />
                  <p className="text-xs text-[#8A8F98] text-center"><span className="text-[#4d8ee8] font-medium">Nhấn để chọn</span> hoặc kéo thả ảnh</p>
                  <p className="text-[11px] text-[#8A8F98]/60">PNG, JPG, WEBP — Tối đa 5MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }} />
            </div>
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400">
                <span className="shrink-0">⚠</span>
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 px-4 py-3 sm:px-6 sm:py-4 border-t border-white/[0.06] bg-white/[0.01]">
            <button type="button" onClick={handleClose} disabled={isSubmitting} className="w-full sm:w-auto justify-center px-4 py-2 text-xs font-medium rounded-xl text-[#8A8F98] hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer disabled:opacity-50">Hủy</button>
            <button type="button" onClick={handleCheckIn} disabled={isSubmitting} className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-60">
              {isSubmitting ? (<><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Đang xử lý...</span></>) : (<><UserCheck className="w-3.5 h-3.5" /><span>Xác nhận Check-in{selectedFile ? " & Lưu ảnh" : ""}</span></>)}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
