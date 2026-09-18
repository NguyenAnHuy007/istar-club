"use client";

import { DEPARTMENTS } from "@/constants/departments";
import { DepartmentCode } from "@/types/application";
import { Check } from "lucide-react";

interface DepartmentPickerProps {
  selected: DepartmentCode[];
  onChange: (selected: DepartmentCode[]) => void;
  hasError?: boolean;
}

export default function DepartmentPicker({
  selected,
  onChange,
  hasError,
}: DepartmentPickerProps) {
  const toggle = (val: DepartmentCode) => {
    if (selected.includes(val)) {
      onChange(selected.filter((item) => item !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {DEPARTMENTS.map((dept) => {
          const isChecked = selected.includes(dept.value);
          return (
            <button
              type="button"
              role="checkbox"
              aria-checked={isChecked}
              key={dept.value}
              onClick={() => toggle(dept.value)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggle(dept.value);
                }
              }}
              className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer select-none transition-all duration-200 min-h-[58px] text-left w-full outline-none focus-visible:ring-2 focus-visible:ring-[#255798] ${
                isChecked
                  ? "border-[#255798] bg-[#255798]/15 shadow-[0_0_20px_rgba(37,87,152,0.2)] ring-1 ring-[#255798]/40"
                  : hasError
                  ? "border-red-500/40 bg-red-500/5 hover:border-red-500/60"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.04]"
              }`}
            >
              {/* Custom Checkbox indicator */}
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                  isChecked
                    ? "bg-[#255798] text-white shadow-sm ring-2 ring-[#255798]/30"
                    : "border border-white/20 bg-white/[0.04]"
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0 flex items-center">
                <span className="block text-sm font-semibold text-[#EDEDEF]">
                  {dept.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {hasError && (
        <p className="text-xs text-red-400 font-medium mt-1.5">
          Vui lòng chọn ít nhất một ban bạn mong muốn ứng tuyển
        </p>
      )}
    </div>
  );
}
