"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Trash2,
  Camera,
  Loader2,
  User,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import adminApplicationService from "@/services/adminApplicationService";

export interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  candidateName: string;
  applicationId: number;
  canEdit: boolean; // Only ADMIN and RECEPTIONIST
  onAvatarUpdated?: (newUrl: string | null) => void;
}

export default function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  candidateName,
  applicationId,
  canEdit,
  onAvatarUpdated,
}: ImageViewerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [currentUrl, setCurrentUrl] = useState<string | null>(imageUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentUrl(imageUrl);
    setZoom(1);
    setFeedbackMessage(null);
  }, [imageUrl, isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleDownload = async () => {
    if (!currentUrl) return;
    try {
      const response = await fetch(currentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Sanitize candidate name for filename
      const cleanName = candidateName.toLowerCase().replace(/[^a-z0-9]/gi, "_");
      a.download = `avatar_${cleanName}_${applicationId}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Lỗi khi tải ảnh:", err);
      // Fallback direct link
      window.open(currentUrl, "_blank");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFeedbackMessage({
        type: "error",
        text: "Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP).",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedbackMessage({
        type: "error",
        text: "Kích thước ảnh không được vượt quá 5MB.",
      });
      return;
    }

    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      const newUrl = await adminApplicationService.uploadAvatar(applicationId, file);
      setCurrentUrl(newUrl);
      onAvatarUpdated?.(newUrl);
      setFeedbackMessage({
        type: "success",
        text: "Đã cập nhật ảnh đại diện mới thành công!",
      });
    } catch (err) {
      console.error("Lỗi khi tải lên ảnh:", err);
      setFeedbackMessage({
        type: "error",
        text: "Không thể tải ảnh lên. Vui lòng thử lại sau.",
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Xác nhận XÓA ảnh đại diện của ứng viên ${candidateName}?`)) {
      return;
    }

    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      await adminApplicationService.deleteAvatar(applicationId);
      setCurrentUrl(null);
      onAvatarUpdated?.(null);
      setFeedbackMessage({
        type: "success",
        text: "Đã xóa ảnh đại diện thành công!",
      });
    } catch (err) {
      console.error("Lỗi khi xóa ảnh:", err);
      setFeedbackMessage({
        type: "error",
        text: "Không thể xóa ảnh đại diện. Vui lòng thử lại sau.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#050608]/90 backdrop-blur-xl"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-3xl flex flex-col rounded-2xl bg-[#0D0E12] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.9)] overflow-hidden max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                {candidateName}
              </h3>
              <p className="text-xs text-[#8A8F98]">Ảnh hồ sơ ứng viên (Đơn #{applicationId})</p>
            </div>

            {/* Close button with clear text & icon */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8A8F98] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Đóng</span>
            </button>
          </div>

          {/* Alert Message */}
          {feedbackMessage && (
            <div
              className={`px-4 py-2.5 text-xs font-medium border-b flex items-center gap-2 ${
                feedbackMessage.type === "success"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/20"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Main Viewport Container */}
          <div className="relative flex-1 flex items-center justify-center p-4 min-h-[340px] sm:min-h-[460px] bg-[#07080B] overflow-hidden">
            {currentUrl ? (
              <div
                className="relative transition-transform duration-200 ease-out flex items-center justify-center"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="relative w-64 h-80 sm:w-80 sm:h-96 rounded-xl overflow-hidden border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.8)] bg-black/50">
                  <Image
                    src={currentUrl}
                    alt={candidateName}
                    fill
                    className="object-contain"
                    unoptimized
                    priority
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <User className="w-10 h-10" />
                </div>
                <div className="text-sm text-slate-300 font-medium">Chưa có ảnh đại diện</div>
                <p className="text-xs text-[#8A8F98] max-w-xs">
                  {canEdit
                    ? "Bạn có thể bấm nút 'Chọn ảnh khác' bên dưới để tải lên ảnh đại diện cho ứng viên này."
                    : "Ứng viên này hiện chưa cập nhật ảnh thẻ đại diện."}
                </p>
              </div>
            )}

            {/* Processing Spinner Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 border border-white/10 text-white text-xs font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-[#4d8ee8]" />
                  <span>Đang xử lý dữ liệu...</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-white/[0.08] bg-[#0D0E12]">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/[0.08]">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5 || !currentUrl}
                className="p-1.5 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Thu nhỏ (-25%)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-[#EDEDEF] px-2 min-w-[48px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3 || !currentUrl}
                className="p-1.5 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Phóng to (+25%)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                disabled={zoom === 1 || !currentUrl}
                className="p-1.5 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-colors border-l border-white/10 ml-0.5"
                title="Đặt lại kích thước (100%)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Download Button (Available for all roles if image exists) */}
              {currentUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer"
                  title="Tải ảnh về máy"
                >
                  <Download className="w-3.5 h-3.5 text-[#4d8ee8]" />
                  <span>Tải ảnh xuống</span>
                </button>
              )}

              {/* RBAC Protected: Change & Delete Avatar (Only ADMIN & RECEPTIONIST) */}
              {canEdit && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 transition-colors cursor-pointer"
                    title="Tải lên ảnh đại diện khác"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Chọn ảnh khác</span>
                  </button>

                  {currentUrl && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors cursor-pointer"
                      title="Xóa ảnh đại diện"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa ảnh</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
