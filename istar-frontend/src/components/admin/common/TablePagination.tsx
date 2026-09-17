"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilterSelect } from "./FilterBar";

export interface TablePaginationProps {
  page: number; // 0-indexed (backend standard)
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (newPage: number) => void;
  onSizeChange?: (newSize: number) => void;
  sizeOptions?: number[];
  unitName?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Standardized pagination component for all admin list tables.
 * Perfectly aligns at the bottom of the table with range display, rows-per-page selector, and smart page numbers.
 */
export default function TablePagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange,
  sizeOptions = [10, 20, 30, 50, 100],
  unitName = "mục",
  disabled = false,
  className = "",
}: TablePaginationProps) {
  const fromRecord = totalElements === 0 ? 0 : page * size + 1;
  const toRecord = Math.min((page + 1) * size, totalElements);

  // Generate smart page numbers with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    if (page <= 3) {
      return [0, 1, 2, 3, 4, "...", totalPages - 1];
    }

    if (page >= totalPages - 4) {
      return [
        0,
        "...",
        totalPages - 5,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
      ];
    }

    return [0, "...", page - 1, page, page + 1, "...", totalPages - 1];
  };

  const pageNumbers = getPageNumbers();

  const formattedSizeOptions = sizeOptions.map((num) => ({
    value: String(num),
    label: `${num} / trang`,
  }));

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 px-1 text-xs text-[#8A8F98] select-none ${className}`}
    >
      {/* Left side: Range stats and rows per page */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full sm:w-auto text-center sm:text-left">
        <span>
          Hiển thị{" "}
          <strong className="text-[#EDEDEF] font-mono">{fromRecord}</strong> -{" "}
          <strong className="text-[#EDEDEF] font-mono">{toRecord}</strong> /{" "}
          <strong className="text-[#EDEDEF] font-mono">{totalElements}</strong>{" "}
          {unitName}
        </span>

        {onSizeChange && (
          <div className="w-28 shrink-0">
            <FilterSelect
              options={formattedSizeOptions}
              value={String(size)}
              onChange={(val) => onSizeChange(Number(val))}
              placeholder={`${size} / trang`}
              className="w-full"
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {/* Right side: Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Previous button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={disabled || page === 0}
            title="Trang trước"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#EDEDEF] hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-[#8A8F98]/60 text-xs"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = p === page;

              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPageChange(p)}
                  className={`h-8 min-w-[32px] px-2 flex items-center justify-center rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#255798] text-white border border-[#316ebf] shadow-[0_0_12px_rgba(37,87,152,0.5)]"
                      : "bg-white/[0.03] text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08] border border-white/10"
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={disabled || page >= totalPages - 1}
            title="Trang sau"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#EDEDEF] hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
