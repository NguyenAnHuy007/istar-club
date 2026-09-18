"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, CheckCircle2, AlertCircle } from "lucide-react";
import { isAxiosError } from "axios";
import {
  ApplicationFormDto,
  ApplicationStatus,
  DEPARTMENT_CONFIG,
} from "@/types/application";
import { Department } from "@/types/user";
import { useAuth } from "@/context/AuthContext";
import interviewService from "@/services/interviewService";

interface ClaimInterviewModalProps {
  isOpen: boolean;
  application: ApplicationFormDto | null;
  onClose: () => void;
  onStartSuccess: (updatedApp: ApplicationFormDto) => void;
}

export default function ClaimInterviewModal({
  isOpen,
  application,
  onClose,
  onStartSuccess,
}: ClaimInterviewModalProps) {
  const { user, isAdmin } = useAuth();
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userDeptCodes = (user?.userDepartments?.map((ud) => ud.department) || []) as Department[];

  useEffect(() => {
    if (application && application.applicationDepartments) {
      // Find eligible departments for this interviewer
      const eligible = application.applicationDepartments.filter((d) => {
        const canInterview = isAdmin || userDeptCodes.includes(d.department);
        const notDone = d.status !== ApplicationStatus.INTERVIEWED;
        return canInterview && notDone;
      });

      // Default: check all eligible departments if only 1 or 2
      setSelectedDeptIds(eligible.map((d) => d.id));
      setErrorMessage(null);
    }
  }, [application, isAdmin]);

  if (!isOpen || !application) return null;

  const fullName = `${application.lastName || ""} ${application.firstName || ""}`.trim() || "Ứng viên";

  const handleToggleDept = (deptId: number) => {
    setSelectedDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  const handleStart = async () => {
    if (selectedDeptIds.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất một ban để bắt đầu phỏng vấn!");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const updated = await interviewService.startMultiInterview(application.id, selectedDeptIds);
      onStartSuccess(updated);
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setErrorMessage(msg || "Không thể bắt đầu phỏng vấn. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-[#0D0E12] border border-white/[0.1] rounded-2xl p-4 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)] text-[#EDEDEF] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/[0.08] gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#255798]/20 border border-[#255798]/40 flex items-center justify-center text-[#4d8ee8] shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm sm:text-base truncate">Bắt đầu phỏng vấn</h3>
                <p className="text-xs text-[#8A8F98] truncate">Chọn ban phỏng vấn cho ứng viên</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 my-1 pr-0.5">
            {/* Candidate Info */}
            <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="font-semibold text-white text-sm truncate">{fullName}</p>
              <p className="text-xs text-[#8A8F98] mt-0.5 truncate">{application.email}</p>
              {application.school && (
                <p className="text-xs text-[#8A8F98] mt-0.5 truncate">
                  {application.school} {application.course ? `(${application.course})` : ""}
                </p>
              )}
            </div>

            {/* Department Selection */}
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider">
                Tích chọn ban bạn sẽ phỏng vấn:
              </label>

              {application.applicationDepartments?.map((dept) => {
                const conf = DEPARTMENT_CONFIG[dept.department];
                const isEligible = isAdmin || userDeptCodes.includes(dept.department);
                const isAlreadyDone = dept.status === ApplicationStatus.INTERVIEWED;
                const isCurrentlyInterviewing = dept.status === ApplicationStatus.INTERVIEWING;
                const isSelected = selectedDeptIds.includes(dept.id);
                const isDisabled = !isEligible || isAlreadyDone;

                return (
                  <label
                    key={dept.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isDisabled
                        ? "opacity-40 bg-white/[0.01] border-white/[0.04] cursor-not-allowed"
                        : isSelected
                        ? "bg-[#255798]/15 border-[#255798]/60 shadow-[0_0_12px_rgba(37,87,152,0.2)]"
                        : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => !isDisabled && handleToggleDept(dept.id)}
                        className="w-4 h-4 rounded text-[#255798] bg-black/40 border-white/20 focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                            conf
                              ? `${conf.badgeBg} ${conf.badgeBorder} ${conf.textColor}`
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {conf ? conf.name : dept.department}
                        </span>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="text-right">
                      {isAlreadyDone ? (
                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Đã phỏng vấn
                        </span>
                      ) : isCurrentlyInterviewing ? (
                        <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Đang phỏng vấn
                        </span>
                      ) : !isEligible ? (
                        <span className="text-[11px] font-medium text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full">
                          Ban khác
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#4d8ee8]">
                          Sẵn sàng PV
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Error notice */}
            {errorMessage && (
              <div className="mt-3.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Note about concurrency lock */}
            <p className="mt-3.5 text-[11px] text-[#8A8F98] leading-relaxed">
              * Sau khi bắt đầu, trạng thái đơn sẽ chuyển sang <strong className="text-white">Đang phỏng vấn</strong>. Các ban khác sẽ không thể phỏng vấn ứng viên này cùng lúc cho đến khi bạn hoàn tất chấm điểm.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto justify-center px-4 py-2 text-xs font-medium rounded-xl text-[#8A8F98] hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleStart}
              disabled={submitting || selectedDeptIds.length === 0}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-[#255798] to-[#3a75c4] hover:from-[#316ebf] hover:to-[#4d8ee8] shadow-[0_0_16px_rgba(37,87,152,0.35)] disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Bắt đầu phỏng vấn</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
