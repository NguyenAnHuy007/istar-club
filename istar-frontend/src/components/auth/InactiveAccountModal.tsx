"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ShieldAlert, X, ExternalLink, MessageCircle } from "lucide-react";

interface InactiveAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountIdentifier?: string;
}

export default function InactiveAccountModal({
  isOpen,
  onClose,
  accountIdentifier,
}: InactiveAccountModalProps) {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-md p-6 sm:p-7 rounded-2xl bg-[#0c0c14]/95 border border-amber-500/25 shadow-[0_0_60px_rgba(245,158,11,0.18)] overflow-hidden"
          >
            {/* Ambient amber glow in the background */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with glowing icon */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="relative mb-3 flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.25)]">
                <Clock className="w-7 h-7 animate-pulse" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0c0c14] border border-amber-500/50 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-3 h-3" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#EDEDEF] tracking-tight">
                Tài khoản chưa được kích hoạt
              </h3>
              <p className="text-xs text-amber-400/90 font-medium mt-1">
                Yêu cầu phê duyệt từ Quản trị viên
              </p>
            </div>

            {/* Detailed Explanation */}
            <div className="space-y-3.5 mb-6 text-left">
              {accountIdentifier && (
                <div className="px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-[#8A8F98]">Tài khoản đăng nhập:</span>
                  <span className="font-mono font-medium text-[#EDEDEF]">
                    {accountIdentifier}
                  </span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-[#8A8F98] leading-relaxed space-y-2">
                <p className="text-[#EDEDEF]/90">
                  Tài khoản của bạn đã được khởi tạo thành công trên hệ thống iStar Club. Tuy nhiên, để đảm bảo tính xác thực nội bộ, tài khoản cần được{" "}
                  <strong className="text-amber-300 font-semibold">
                    Quản trị viên hoặc Ban Chủ nhiệm CLB
                  </strong>{" "}
                  phê duyệt trước khi có thể đăng nhập.
                </p>
                <div className="pt-2 border-t border-amber-500/10 flex items-center gap-2 text-amber-400/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Trạng thái: <strong>Chờ kích hoạt (Chưa Active)</strong></span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-[#8A8F98]/90 leading-normal">
                💡 <strong className="text-[#EDEDEF]">Hướng dẫn:</strong> Nếu bạn là thành viên mới hoặc đã trúng tuyển, vui lòng thông báo cho Trưởng ban hoặc BCN để tài khoản được kích hoạt nhanh chóng.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#255798] hover:bg-[#316ebf] transition-all duration-200 shadow-[0_0_20px_rgba(37,87,152,0.35)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Đã hiểu</span>
              </button>

              <a
                href="https://www.facebook.com/istarclub.haui"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-[#8A8F98] hover:text-[#EDEDEF] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#4d8ee8]" />
                <span>Liên hệ Fanpage CLB iStar</span>
                <ExternalLink className="w-3 h-3 text-[#8A8F98]" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
