"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";

export interface FilterDatePickerProps {
  id?: string;
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  disabled?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/**
 * Format Date object to YYYY-MM-DD string
 */
function toDateString(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

/**
 * Format YYYY-MM-DD to DD/MM/YYYY for Vietnamese display
 */
function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Standardized DatePicker component for Admin management and filter bars.
 * Enforces uniform 40px height (h-10), dark-glass popover, Linear-inspired design with #255798 brand blue.
 */
export default function FilterDatePicker({
  id,
  value = "",
  onChange,
  placeholder = "Chọn ngày...",
  label,
  minDate,
  maxDate,
  disabled = false,
  className = "",
}: FilterDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or fallback to today
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }, [value]);

  const today = useMemo(() => new Date(), []);

  // Danh sách năm cho phép chọn nhanh (từ quá khứ 70 năm đến tương lai 10 năm)
  const yearOptions = useMemo(() => {
    const currentY = today.getFullYear();
    const startY = currentY - 70;
    const endY = currentY + 10;
    const years: number[] = [];
    for (let y = endY; y >= startY; y--) {
      years.push(y);
    }
    return years;
  }, [today]);

  // Current browsing month/year in calendar view
  const [viewYear, setViewYear] = useState(() =>
    selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(() =>
    selectedDate ? selectedDate.getMonth() : today.getMonth()
  );

  // Sync browsing month when value changes from outside
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  // Dropdown states for custom Month & Year selectors
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const monthListRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  // Auto scroll to active year when year dropdown opens
  useEffect(() => {
    if (showYearDropdown && yearListRef.current) {
      const selectedEl = yearListRef.current.querySelector<HTMLButtonElement>(
        "[data-selected='true']"
      );
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "center", behavior: "instant" });
      }
    }
  }, [showYearDropdown]);

  // Auto scroll to active month when month dropdown opens
  useEffect(() => {
    if (showMonthDropdown && monthListRef.current) {
      const selectedEl = monthListRef.current.querySelector<HTMLButtonElement>(
        "[data-selected='true']"
      );
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "center", behavior: "instant" });
      }
    }
  }, [showMonthDropdown]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowMonthDropdown(false);
        setShowYearDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMonthDropdown(false);
    setShowYearDropdown(false);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMonthDropdown(false);
    setShowYearDropdown(false);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (dayString: string) => {
    onChange(dayString);
    setShowMonthDropdown(false);
    setShowYearDropdown(false);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMonthDropdown(false);
    setShowYearDropdown(false);
    onChange("");
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const todayStr = toDateString(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    onChange(todayStr);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  // Build calendar matrix
  const calendarDays = useMemo(() => {
    const days: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      isDisabled: boolean;
    }[] = [];

    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    // In Vietnam: Monday is first day of week (0: Monday, 6: Sunday)
    const startOffset = (firstDayOfWeek + 6) % 7;

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const todayStr = toDateString(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Prev month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = toDateString(prevY, prevM, d);
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
        isDisabled:
          (Boolean(minDate) && dateStr < (minDate as string)) ||
          (Boolean(maxDate) && dateStr > (maxDate as string)),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = toDateString(viewYear, viewMonth, d);
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
        isDisabled:
          (Boolean(minDate) && dateStr < (minDate as string)) ||
          (Boolean(maxDate) && dateStr > (maxDate as string)),
      });
    }

    // Next month padding to fill remaining row (up to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = toDateString(nextY, nextM, d);
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
        isDisabled:
          (Boolean(minDate) && dateStr < (minDate as string)) ||
          (Boolean(maxDate) && dateStr > (maxDate as string)),
      });
    }

    return days;
  }, [viewYear, viewMonth, value, minDate, maxDate, today]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${isOpen ? "z-50" : "z-10"} ${className}`}
    >
      {label && (
        <span className="block text-[11px] text-[#8A8F98] mb-1 font-medium">
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <div
        id={id}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`h-10 w-full px-3 flex items-center justify-between gap-2 text-left text-sm rounded-lg bg-white/[0.03] border transition-all duration-200 cursor-pointer focus:outline-none focus-within:ring-2 focus-within:ring-[#255798]/50 ${
          isOpen
            ? "border-[#255798] bg-[#0c0c14] shadow-[0_0_16px_rgba(37,87,152,0.25)]"
            : "border-white/10 hover:border-white/20"
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          <Calendar
            className={`w-3.5 h-3.5 shrink-0 transition-colors ${
              value ? "text-[#4d8ee8]" : "text-[#8A8F98]"
            }`}
          />
          <span
            className={`truncate text-xs font-mono ${
              value ? "text-[#EDEDEF] font-medium" : "text-[#8A8F98]/70"
            }`}
          >
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            title="Xóa ngày"
            className="p-1 rounded-md text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08] transition-colors shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-[285px] p-3 rounded-xl bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.85)] space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between px-0.5 relative">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Month & Year Selectors */}
            <div className="flex items-center gap-1.5">
              {/* Month Trigger Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMonthDropdown((prev) => !prev);
                  setShowYearDropdown(false);
                }}
                className={`h-7 px-2 flex items-center gap-1 text-xs font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
                  showMonthDropdown
                    ? "bg-[#255798]/25 border-[#255798] text-[#4d8ee8] shadow-[0_0_12px_rgba(37,87,152,0.35)]"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 text-[#EDEDEF]"
                }`}
                title="Chọn tháng"
              >
                <span>{MONTH_NAMES[viewMonth]}</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#8A8F98] transition-transform duration-200 ${
                    showMonthDropdown ? "rotate-180 text-[#4d8ee8]" : ""
                  }`}
                />
              </button>

              {/* Year Trigger Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowYearDropdown((prev) => !prev);
                  setShowMonthDropdown(false);
                }}
                className={`h-7 px-2 flex items-center gap-1 text-xs font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
                  showYearDropdown
                    ? "bg-[#255798]/25 border-[#255798] text-[#4d8ee8] shadow-[0_0_12px_rgba(37,87,152,0.35)]"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 text-[#EDEDEF]"
                }`}
                title="Chọn năm"
              >
                <span>{viewYear}</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#8A8F98] transition-transform duration-200 ${
                    showYearDropdown ? "rotate-180 text-[#4d8ee8]" : ""
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Custom Month Dropdown Menu */}
            {showMonthDropdown && (
              <div
                ref={monthListRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-6 top-8.5 z-60 w-[120px] max-h-[190px] overflow-y-auto rounded-xl bg-[#0e0f16] border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.95)] p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <button
                    key={idx}
                    type="button"
                    data-selected={viewMonth === idx}
                    onClick={() => {
                      setViewMonth(idx);
                      setShowMonthDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                      viewMonth === idx
                        ? "bg-[#255798] text-white font-bold shadow-[0_0_12px_rgba(37,87,152,0.6)]"
                        : "text-[#EDEDEF] hover:bg-white/[0.08]"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {/* Custom Year Dropdown Menu */}
            {showYearDropdown && (
              <div
                ref={yearListRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-6 top-8.5 z-60 w-[100px] max-h-[190px] overflow-y-auto rounded-xl bg-[#0e0f16] border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.95)] p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
              >
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    type="button"
                    data-selected={viewYear === year}
                    onClick={() => {
                      setViewYear(year);
                      setShowYearDropdown(false);
                    }}
                    className={`w-full text-center px-2 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 cursor-pointer ${
                      viewYear === year
                        ? "bg-[#255798] text-white font-bold shadow-[0_0_12px_rgba(37,87,152,0.6)]"
                        : "text-[#EDEDEF] hover:bg-white/[0.08]"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((wd, i) => (
              <span
                key={wd}
                className={`text-[10px] font-mono font-semibold py-0.5 ${
                  i >= 5 ? "text-rose-400/80" : "text-[#8A8F98]/70"
                }`}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((d, idx) => {
              if (d.isDisabled) {
                return (
                  <div
                    key={idx}
                    className="h-7 w-7 flex items-center justify-center text-[11px] font-mono text-white/15 rounded-md cursor-not-allowed select-none"
                  >
                    {d.dayNum}
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(d.dateStr)}
                  className={`h-7 w-7 flex items-center justify-center text-[11px] font-mono rounded-lg transition-all duration-150 cursor-pointer select-none ${
                    d.isSelected
                      ? "bg-[#255798] text-white font-bold shadow-[0_0_10px_rgba(37,87,152,0.6)]"
                      : d.isToday
                      ? "bg-[#255798]/20 text-[#4d8ee8] border border-[#255798]/50 font-semibold"
                      : d.isCurrentMonth
                      ? "text-[#EDEDEF] hover:bg-white/[0.08]"
                      : "text-white/30 hover:bg-white/[0.04]"
                  }`}
                >
                  {d.dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="px-2 py-1 text-[11px] font-medium text-[#4d8ee8] hover:text-[#7bb0f8] hover:bg-[#255798]/15 rounded-md transition-colors cursor-pointer"
            >
              Hôm nay
            </button>

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2 py-1 text-[11px] font-medium text-[#8A8F98] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
              >
                Xóa chọn
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
