"use client";

import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, Calendar } from "lucide-react";
import {
  AdminApplicationSearchCriteria,
  ApplicationStatus,
  APPLICATION_STATUS_CONFIG,
  DEPARTMENT_CONFIG,
} from "@/types/application";
import { Department, Area } from "@/types/user";
import CustomSelect, { Option } from "@/components/common/CustomSelect";
import FilterDatePicker from "@/components/admin/common/FilterDatePicker";
import adminRecruitmentService from "@/services/adminRecruitmentService";

interface ApplicationFiltersProps {
  criteria: AdminApplicationSearchCriteria;
  onFilterChange: (newCriteria: AdminApplicationSearchCriteria) => void;
}

const DEPARTMENT_OPTIONS: Option[] = [
  { value: "", label: "Tất cả các ban" },
  { value: Department.MUSIC, label: DEPARTMENT_CONFIG[Department.MUSIC].name },
  { value: Department.RAP, label: DEPARTMENT_CONFIG[Department.RAP].name },
  {
    value: Department.MEDIA_AND_EVENT,
    label: DEPARTMENT_CONFIG[Department.MEDIA_AND_EVENT].name,
  },
  { value: Department.DANCE, label: DEPARTMENT_CONFIG[Department.DANCE].name },
];

const AREA_OPTIONS: Option[] = [
  { value: "", label: "Tất cả cơ sở" },
  { value: Area.NINH_BINH, label: "Ninh Bình" },
  { value: Area.HANOI, label: "Hà Nội" },
];

const STATUS_OPTIONS: Option[] = [
  { value: "", label: "Tất cả trạng thái" },
  ...Object.values(ApplicationStatus).map((status) => ({
    value: status,
    label: APPLICATION_STATUS_CONFIG[status].label,
  })),
];

export default function ApplicationFilters({
  criteria,
  onFilterChange,
}: ApplicationFiltersProps) {
  const [nameKeyword, setNameKeyword] = useState(
    criteria.firstName ? criteria.firstName.replace(/%/g, "") : ""
  );
  const [emailKeyword, setEmailKeyword] = useState(
    criteria.email ? criteria.email.replace(/%/g, "") : ""
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recruitmentOptions, setRecruitmentOptions] = useState<Option[]>([
    { value: "", label: "Tất cả đợt tuyển" },
  ]);

  // Load recruitment list for filter dropdown
  useEffect(() => {
    let isMounted = true;
    adminRecruitmentService
      .getAllRecruitments(0, 100)
      .then((res) => {
        if (isMounted && res?.content) {
          const opts: Option[] = [
            { value: "", label: "Tất cả đợt tuyển" },
            ...res.content.map((r) => ({
              value: String(r.id),
              label: `${r.name}${r.isActive ? " (Đang mở)" : ""}`,
            })),
          ];
          setRecruitmentOptions(opts);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách đợt tuyển:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounce keyword searches
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentNameClean = criteria.firstName
        ? criteria.firstName.replace(/%/g, "")
        : "";
      const currentEmailClean = criteria.email
        ? criteria.email.replace(/%/g, "")
        : "";

      if (
        nameKeyword !== currentNameClean ||
        emailKeyword !== currentEmailClean
      ) {
        onFilterChange({
          ...criteria,
          firstName: nameKeyword ? `%${nameKeyword.trim()}%` : undefined,
          email: emailKeyword ? `%${emailKeyword.trim()}%` : undefined,
          page: 0,
        });
      }
    }, 450);

    return () => clearTimeout(handler);
  }, [nameKeyword, emailKeyword, criteria, onFilterChange]);

  const handleSelectChange = <K extends keyof AdminApplicationSearchCriteria>(
    field: K,
    value: string
  ) => {
    let parsedValue: unknown;
    if (value === "") {
      parsedValue = undefined;
    } else if (field === "recruitmentId") {
      parsedValue = Number(value);
    } else {
      parsedValue = value;
    }
    onFilterChange({
      ...criteria,
      [field]: parsedValue as AdminApplicationSearchCriteria[K],
      page: 0,
    });
  };

  const handleClearFilters = () => {
    setNameKeyword("");
    setEmailKeyword("");
    onFilterChange({
      page: 0,
      size: criteria.size,
      sortBy: criteria.sortBy,
      sortDirection: criteria.sortDirection,
    });
  };

  const hasActiveFilters =
    Boolean(nameKeyword) ||
    Boolean(emailKeyword) ||
    Boolean(criteria.recruitmentId) ||
    Boolean(criteria.department) ||
    Boolean(criteria.status) ||
    Boolean(criteria.createdFrom) ||
    Boolean(criteria.createdTo);

  return (
    <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.2)] mb-6 transition-all">
      {/* Top Bar: Search & Primary Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Name Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8F98]" />
          <input
            type="text"
            placeholder="Tìm theo họ tên ứng viên..."
            value={nameKeyword}
            onChange={(e) => setNameKeyword(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.08] hover:border-white/20 focus:border-[#255798] text-[#EDEDEF] text-sm rounded-xl pl-9 pr-8 py-2.5 outline-none transition-all placeholder:text-[#8A8F98]/50"
          />
          {nameKeyword && (
            <button
              onClick={() => setNameKeyword("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8F98] hover:text-[#EDEDEF] p-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Email Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo email / SĐT..."
            value={emailKeyword}
            onChange={(e) => setEmailKeyword(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.08] hover:border-white/20 focus:border-[#255798] text-[#EDEDEF] text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder:text-[#8A8F98]/50"
          />
          {emailKeyword && (
            <button
              onClick={() => setEmailKeyword("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8F98] hover:text-[#EDEDEF] p-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Recruitment Select */}
        <CustomSelect
          options={recruitmentOptions}
          value={criteria.recruitmentId ? String(criteria.recruitmentId) : ""}
          onChange={(val) => handleSelectChange("recruitmentId", val)}
          placeholder="Tất cả đợt tuyển"
        />

        {/* Area Select */}
        <CustomSelect
          options={AREA_OPTIONS}
          value={criteria.area || ""}
          onChange={(val) => handleSelectChange("area", val)}
          placeholder="Tất cả cơ sở"
        />

        {/* Department Select */}
        <CustomSelect
          options={DEPARTMENT_OPTIONS}
          value={criteria.department || ""}
          onChange={(val) => handleSelectChange("department", val)}
          placeholder="Tất cả các ban"
        />

        {/* Status Select */}
        <CustomSelect
          options={STATUS_OPTIONS}
          value={criteria.status || ""}
          onChange={(val) => handleSelectChange("status", val)}
          placeholder="Tất cả trạng thái"
        />
      </div>

      {/* Toggle Advanced Filters & Clear Actions */}
      <div className="mt-3.5 pt-3 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              showAdvanced || criteria.createdFrom || criteria.createdTo
                ? "bg-[#255798]/15 border-[#255798]/40 text-[#4d8ee8]"
                : "bg-white/[0.03] border-white/[0.06] text-[#8A8F98] hover:text-[#EDEDEF]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Bộ lọc nâng cao (Thời gian)</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        <span className="text-[#8A8F98]/70">
          Tìm kiếm tự động cập nhật kết quả
        </span>
      </div>

      {/* Advanced Filter Collapsible */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up">
          <div>
            <label className="block text-[11px] text-[#8A8F98] mb-1 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#4d8ee8]" />
              Ngày nộp đơn từ ngày:
            </label>
            <FilterDatePicker
              id="filter-created-from"
              value={criteria.createdFrom || ""}
              onChange={(date) => handleSelectChange("createdFrom", date)}
              placeholder="Chọn ngày bắt đầu..."
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#8A8F98] mb-1 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#4d8ee8]" />
              Đến ngày:
            </label>
            <FilterDatePicker
              id="filter-created-to"
              value={criteria.createdTo || ""}
              onChange={(date) => handleSelectChange("createdTo", date)}
              placeholder="Chọn ngày kết thúc..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
