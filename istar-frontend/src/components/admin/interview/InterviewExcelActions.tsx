"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, Download, Upload, ChevronDown, Loader2 } from "lucide-react";
import { isAxiosError } from "axios";
import adminApplicationService from "@/services/adminApplicationService";
import { AdminApplicationSearchCriteria } from "@/types/application";
import { useToast } from "@/context/ToastContext";

interface InterviewExcelActionsProps {
  activeRecruitmentId?: number;
  searchCriteria: AdminApplicationSearchCriteria;
  onImportSuccess: () => void;
}

export default function InterviewExcelActions({
  activeRecruitmentId,
  searchCriteria,
  onImportSuccess,
}: InterviewExcelActionsProps) {
  const [isExcelMenuOpen, setIsExcelMenuOpen] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const excelMenuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Close Excel menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        excelMenuRef.current &&
        !excelMenuRef.current.contains(event.target as Node)
      ) {
        setIsExcelMenuOpen(false);
      }
    }
    if (isExcelMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExcelMenuOpen]);

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    setIsExcelMenuOpen(false);
    try {
      await adminApplicationService.downloadExcelTemplate();
      toast.success("Tải file mẫu Excel thành công!");
    } catch (err) {
      console.error("Lỗi tải template Excel:", err);
      toast.error("Không thể tải file mẫu Excel. Vui lòng thử lại sau.");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleExportExcelFiltered = async () => {
    setIsExportingExcel(true);
    setIsExcelMenuOpen(false);
    try {
      await adminApplicationService.exportExcel(searchCriteria);
      toast.success("Xuất dữ liệu Excel thành công!");
    } catch (err) {
      console.error("Lỗi xuất Excel ứng viên:", err);
      toast.error("Không thể xuất file Excel. Vui lòng thử lại sau.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleUploadExcelClick = () => {
    setIsExcelMenuOpen(false);
    excelFileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingExcel(true);
    try {
      const count = await adminApplicationService.importExcel(
        file,
        activeRecruitmentId
      );
      toast.success(`Import thành công ${count} hồ sơ ứng viên vào đợt tuyển hiện tại!`);
      onImportSuccess();
    } catch (err: unknown) {
      console.error("Lỗi import Excel:", err);
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(
        "Lỗi import file Excel: " +
          (msg || "Vui lòng kiểm tra lại định dạng file!")
      );
    } finally {
      setIsImportingExcel(false);
      if (excelFileInputRef.current) {
        excelFileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      {/* Hidden Excel File Input */}
      <input
        ref={excelFileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Excel Operations Dropdown */}
      <div className="relative" ref={excelMenuRef}>
        <button
          type="button"
          onClick={() => setIsExcelMenuOpen(!isExcelMenuOpen)}
          className="h-10 inline-flex items-center gap-2 px-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#EDEDEF] text-xs font-medium transition-all cursor-pointer shadow-sm"
          title="Thao tác dữ liệu Excel"
        >
          {isImportingExcel || isExportingExcel || isDownloadingTemplate ? (
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          )}
          <span>Excel</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#8A8F98] transition-transform duration-200 ${
              isExcelMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isExcelMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#0e1015] border border-white/[0.1] shadow-[0_12px_32px_rgba(0,0,0,0.5)] py-1 z-50 overflow-hidden text-xs"
            >
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 text-[#EDEDEF] hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                {isDownloadingTemplate ? (
                  <Loader2 className="w-4 h-4 text-[#4d8ee8] animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-[#4d8ee8]" />
                )}
                <span>Tải template</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcelFiltered}
                disabled={isExportingExcel}
                className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 text-[#EDEDEF] hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                {isExportingExcel ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                )}
                <span>Tải file excel</span>
              </button>

              <button
                type="button"
                onClick={handleUploadExcelClick}
                disabled={isImportingExcel}
                className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 text-[#EDEDEF] hover:bg-white/[0.06] transition-colors cursor-pointer border-t border-white/[0.06]"
              >
                {isImportingExcel ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-amber-400" />
                )}
                <span>Up file excel</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
