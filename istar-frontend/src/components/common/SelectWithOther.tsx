"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, PencilLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectWithOtherProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  otherLabel?: string;
  otherPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const OTHER_VALUE = "__OTHER__";

export default function SelectWithOther({
  id,
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  otherLabel = "Khác (Nhập tùy chọn)...",
  otherPlaceholder = "Nhập giá trị khác...",
  disabled = false,
  required = false,
  className = "",
}: SelectWithOtherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  // Kiểm tra xem value hiện tại có nằm trong danh sách options không
  const isPredefined = options.some((opt) => opt.value === value);
  const isCustomValue = value !== "" && !isPredefined;

  // Trạng thái người dùng chủ động chọn mục "Khác"
  const [userSelectedOther, setUserSelectedOther] = useState<boolean>(false);

  // Tự động suy biến isOtherSelected dựa trên giá trị và hành vi người dùng
  const isOtherSelected = !isPredefined && (userSelectedOther || isCustomValue);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectOption = (optVal: string) => {
    setIsOpen(false);
    if (optVal === OTHER_VALUE) {
      setUserSelectedOther(true);
      // Nếu giá trị trước đó là một option có sẵn thì reset để người dùng nhập mới
      if (isPredefined) {
        onChange("");
      }
      setTimeout(() => {
        otherInputRef.current?.focus();
      }, 100);
    } else {
      setUserSelectedOther(false);
      onChange(optVal);
    }
  };

  // Xác định label hiển thị trên nút chọn
  let displayLabel = placeholder;
  if (isOtherSelected) {
    displayLabel = otherLabel;
  } else if (isPredefined) {
    const matched = options.find((opt) => opt.value === value);
    if (matched) {
      displayLabel = matched.label;
    }
  }

  const isChosen = isOtherSelected || isPredefined;

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`form-input w-full flex items-center justify-between gap-2 text-left cursor-pointer transition-all duration-200 ${
          isOpen
            ? "!border-[#255798] !shadow-[0_0_0_3px_rgba(37,87,152,0.2),0_0_20px_rgba(37,87,152,0.15)] !bg-[#0c0c14]"
            : "hover:border-white/[0.15]"
        } ${disabled ? "opacity-50 !cursor-not-allowed" : ""}`}
      >
        <span
          className={`truncate text-left ${
            !isChosen ? "text-[#8A8F98]" : "text-[#EDEDEF]"
          }`}
        >
          {displayLabel}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-[#8A8F98] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#4d8ee8]" : ""
          }`}
        />
      </button>

      {/* Floating Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-50 min-w-[200px] max-h-64 overflow-y-auto p-1.5 rounded-xl bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.7)] space-y-0.5 scrollbar-thin scrollbar-thumb-white/10"
          >
            {options.map((opt) => {
              const isSelected = !isOtherSelected && opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-[#255798]/25 text-[#4d8ee8] font-medium border border-[#255798]/30"
                      : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#4d8ee8]" />}
                </div>
              );
            })}

            {/* Mục "Khác" */}
            <div className="pt-1 mt-1 border-t border-white/[0.08]">
              <div
                onClick={() => handleSelectOption(OTHER_VALUE)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-150 ${
                  isOtherSelected
                    ? "bg-[#255798]/25 text-[#4d8ee8] font-medium border border-[#255798]/30"
                    : "text-[#F59E0B]/90 hover:text-[#F59E0B] hover:bg-[#F59E0B]/10"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <PencilLine className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{otherLabel}</span>
                </div>
                {isOtherSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#4d8ee8]" />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ô nhập tùy biến khi chọn "Khác" */}
      <AnimatePresence>
        {isOtherSelected && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-2"
          >
            <div className="relative">
              <input
                ref={otherInputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={otherPlaceholder}
                disabled={disabled}
                required={required}
                className="form-input text-sm !bg-[#0c0c14] placeholder-[#8A8F98]/60"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
