"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { UserSearchCriteria, Position, Department } from "@/types/user";
import { adminUserService } from "@/services/adminUserService";
import CustomSelect, { Option } from "@/components/common/CustomSelect";

interface UserFiltersProps {
  criteria: UserSearchCriteria;
  onFilterChange: (newCriteria: UserSearchCriteria) => void;
}

const POSITION_LABELS: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm",
  VICE_PRESIDENT: "Phó chủ nhiệm",
  HEAD_OF_DEPARTMENT: "Trưởng ban",
  DEPUTY_HEAD_OF_DEPARTMENT: "Phó ban",
  MEMBER: "Thành viên",
  CANDIDATE: "Ứng viên",
};

const DEPARTMENT_LABELS: Record<string, string> = {
  MUSIC: "Ban Âm nhạc",
  RAP: "Ban Rap",
  MEDIA_AND_EVENT: "Ban Truyền thông & Sự kiện",
  DANCE: "Ban Vũ đạo",
};

export default function UserFilters({
  criteria,
  onFilterChange,
}: UserFiltersProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  // Local state for the search input to avoid triggering search on every keystroke immediately
  const [keyword, setKeyword] = useState(criteria.keyword || "");

  useEffect(() => {
    Promise.all([
      adminUserService.getPositions(),
      adminUserService.getDepartments(),
      adminUserService.getCourses(),
    ])
      .then(([posRes, depRes, courseRes]) => {
        setPositions(posRes);
        setDepartments(depRes);
        setCourses(courseRes);
      })
      .catch((err) => console.error("Lỗi khi load filters:", err));
  }, []);

  // Debounce for keyword search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (keyword !== (criteria.keyword || "")) {
        onFilterChange({ ...criteria, keyword, page: 0 });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [keyword, criteria, onFilterChange]);

  const handleSelectChange = (
    field: keyof UserSearchCriteria,
    value: string
  ) => {
    let parsedValue: any = value;
    if (value === "") {
      parsedValue = undefined;
    } else if (field === "isActive") {
      parsedValue = value === "true";
    }

    onFilterChange({
      ...criteria,
      [field]: parsedValue,
      page: 0,
    });
  };

  const handleClearFilters = () => {
    setKeyword("");
    onFilterChange({
      page: 0,
      size: criteria.size,
      sortBy: criteria.sortBy,
      sortDirection: criteria.sortDirection,
    });
  };

  const hasActiveFilters =
    Boolean(criteria.keyword) ||
    Boolean(criteria.position) ||
    Boolean(criteria.department) ||
    Boolean(criteria.course) ||
    criteria.isActive !== undefined;

  // Options lists
  const positionOptions: Option[] = [
    { value: "", label: "Tất cả chức vụ" },
    ...positions.map((pos) => ({
      value: pos,
      label: POSITION_LABELS[pos] || pos,
    })),
  ];

  const departmentOptions: Option[] = [
    { value: "", label: "Tất cả ban" },
    ...departments.map((dep) => ({
      value: dep,
      label: DEPARTMENT_LABELS[dep] || dep,
    })),
  ];

  const courseOptions: Option[] = [
    { value: "", label: "Tất cả khóa" },
    ...courses.map((c) => ({
      value: c,
      label: `Khóa ${c}`,
    })),
  ];

  const statusOptions: Option[] = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "true", label: "Đang hoạt động" },
    { value: "false", label: "Đã vô hiệu hóa" },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#8A8F98]" />
          </div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên, email, sđt..."
            className="block w-full pl-10 pr-3.5 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm text-[#EDEDEF] placeholder-[#8A8F98] focus:border-[#4d8ee8] focus:ring-1 focus:ring-[#4d8ee8] transition-all duration-200 outline-none"
          />
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap gap-2.5">
          {/* Position Filter */}
          <div className="min-w-[140px] flex-1">
            <CustomSelect
              value={criteria.position || ""}
              onChange={(val) => handleSelectChange("position", val)}
              options={positionOptions}
              placeholder="Chức vụ"
            />
          </div>

          {/* Department Filter */}
          <div className="min-w-[150px] flex-1">
            <CustomSelect
              value={criteria.department || ""}
              onChange={(val) => handleSelectChange("department", val)}
              options={departmentOptions}
              placeholder="Ban"
            />
          </div>

          {/* Course Filter */}
          <div className="min-w-[120px] flex-1">
            <CustomSelect
              value={criteria.course || ""}
              onChange={(val) => handleSelectChange("course", val)}
              options={courseOptions}
              placeholder="Khóa"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[140px] flex-1">
            <CustomSelect
              value={
                criteria.isActive === undefined
                  ? ""
                  : criteria.isActive
                  ? "true"
                  : "false"
              }
              onChange={(val) => handleSelectChange("isActive", val)}
              options={statusOptions}
              placeholder="Trạng thái"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center px-3 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-[#8A8F98] hover:text-white transition-all duration-200"
              title="Xóa tất cả bộ lọc"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
