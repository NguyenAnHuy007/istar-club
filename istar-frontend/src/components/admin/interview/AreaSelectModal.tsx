"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, Building2, X } from "lucide-react";
import { Area, AREA_CONFIG } from "@/types/user";

interface AreaSelectModalProps {
  isOpen: boolean;
  selectedArea: Area | null;
  allowClose?: boolean;
  onSelect: (area: Area) => void;
  onClose?: () => void;
}

export default function AreaSelectModal({
  isOpen,
  selectedArea,
  allowClose = false,
  onSelect,
  onClose,
}: AreaSelectModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={allowClose ? onClose : undefined}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-[#0D0E12] border border-white/10 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] p-6 sm:p-7 overflow-hidden text-white"
        >
          {/* Top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#255798] via-[#4d8ee8] to-emerald-500" />

          {/* Close button if allowed */}
          {allowClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#255798]/15 border border-[#255798]/30 flex items-center justify-center mx-auto mb-3 text-[#4d8ee8] shadow-[0_0_25px_rgba(37,87,152,0.3)]">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-1.5">
              Chọn cơ sở phỏng vấn
            </h2>
            <p className="text-xs text-[#8A8F98] max-w-sm mx-auto leading-relaxed">
              Vui lòng chọn cơ sở bạn đang trực tiếp điều phối hoặc tham gia phỏng vấn hôm nay. Toàn bộ danh sách ứng viên và thống kê sẽ được lọc tương ứng.
            </p>
          </div>

          {/* Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-2">
            {/* Ninh Bình */}
            <button
              type="button"
              onClick={() => onSelect(Area.NINH_BINH)}
              className={`group relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[130px] ${
                selectedArea === Area.NINH_BINH
                  ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50"
                  : "bg-white/[0.02] border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                    selectedArea === Area.NINH_BINH
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-white/[0.04] border-white/10 text-[#8A8F98] group-hover:text-emerald-400 group-hover:border-emerald-500/30"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                {selectedArea === Area.NINH_BINH ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20">
                    Mặc định
                  </span>
                )}
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Cơ sở 3 (Ninh Bình)
                </div>
              </div>
            </button>

            {/* Hà Nội */}
            <button
              type="button"
              onClick={() => onSelect(Area.HANOI)}
              className={`group relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[130px] ${
                selectedArea === Area.HANOI
                  ? "bg-[#255798]/20 border-[#255798]/60 shadow-[0_0_25px_rgba(37,87,152,0.25)] ring-1 ring-[#255798]/60"
                  : "bg-white/[0.02] border-white/10 hover:border-[#255798]/50 hover:bg-[#255798]/[0.05]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                    selectedArea === Area.HANOI
                      ? "bg-[#255798]/30 border-[#255798]/50 text-[#4d8ee8]"
                      : "bg-white/[0.04] border-white/10 text-[#8A8F98] group-hover:text-[#4d8ee8] group-hover:border-[#255798]/30"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                {selectedArea === Area.HANOI && (
                  <div className="w-5 h-5 rounded-full bg-[#255798] flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold text-white group-hover:text-[#7bb0f8] transition-colors">
                  Cơ sở 1 (Hà Nội)
                </div>
              </div>
            </button>
          </div>

          <div className="text-center mt-4">
            <span className="text-[11px] text-[#8A8F98]/70">
              Bạn có thể dễ dàng chuyển đổi lại cơ sở bất kỳ lúc nào tại thanh công cụ.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
