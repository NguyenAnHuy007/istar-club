"use client";

import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from "lucide-react";
import TableCheckbox from "./TableCheckbox";

export interface Column<T> {
  /** Unique key identifying the column */
  key: string;
  /** Header label or custom ReactNode */
  header: React.ReactNode;
  /** Accessor key of T or function that returns the display value */
  accessor?: keyof T | ((row: T, index: number) => React.ReactNode);
  /** Optional custom cell render function: (value, row, index) => ReactNode */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Whether the column can be sorted */
  sortable?: boolean;
  /** Custom sort field key if different from column key */
  sortKey?: string;
  /** Width class or style, e.g. "w-14", "w-48" */
  width?: string;
  /** Alignment: 'left' | 'center' | 'right' (default 'left') */
  align?: "left" | "center" | "right";
  /** Custom cell className */
  className?: string;
  /** Custom header className */
  headerClassName?: string;
  /** Whether to prevent text wrapping on cell content (default: true for headers & badges) */
  nowrap?: boolean;
}

export interface DataTableSelection {
  selectedIds: Set<string | number>;
  onToggleSelect: (id: string | number) => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  isPartiallySelected?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  loadingMessage?: string;
  skeletonRowCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  onSort?: (field: string) => void;
  selection?: DataTableSelection;
  onRowClick?: (item: T, index: number) => void;
  minWidth?: string;
  rowClassName?: (item: T, index: number, isSelected: boolean) => string;
  className?: string;
  tableClassName?: string;
  stickyHeader?: boolean;
}

/**
 * Standardized, generic Data Table component for Admin management pages.
 * Supports dynamic columns, sorting indicators, row selection, custom renderers, and empty/loading states.
 */
export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  loadingMessage = "Đang tải dữ liệu...",
  skeletonRowCount = 5,
  emptyTitle = "Không tìm thấy dữ liệu",
  emptyDescription = "Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh các bộ lọc.",
  emptyIcon,
  emptyAction,
  sortBy,
  sortDirection,
  onSort,
  selection,
  onRowClick,
  minWidth = "min-w-[960px]",
  rowClassName,
  className = "",
  tableClassName = "",
  stickyHeader = false,
}: DataTableProps<T>) {
  // Render sorting indicator icon
  const renderSortIndicator = (field: string) => {
    const isSorted = sortBy === field;
    if (!isSorted) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-[#8A8F98]/40 group-hover:text-[#8A8F98] transition-colors shrink-0" />
      );
    }
    return sortDirection === "ASC" ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#4d8ee8] stroke-[2.5] shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#4d8ee8] stroke-[2.5] shrink-0" />
    );
  };

  // Align class helper
  const getAlignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  // Alignment for headers flex
  const getHeaderAlignFlex = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "justify-center";
      case "right":
        return "justify-end";
      default:
        return "justify-start";
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div
        className={`w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F12]/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}
      >
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${minWidth} ${tableClassName}`}>
            <thead className="bg-white/[0.04] border-b border-white/10">
              <tr>
                {selection && <th className="px-4 py-3.5 w-12" />}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3.5 text-xs font-semibold text-[#8A8F98] uppercase tracking-wider whitespace-nowrap ${getAlignClass(
                      col.align
                    )} ${col.width || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {Array.from({ length: skeletonRowCount }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  {selection && (
                    <td className="px-4 py-4 text-center">
                      <div className="w-4 h-4 rounded bg-white/[0.05] mx-auto" />
                    </td>
                  )}
                  {columns.map((col, colIdx) => (
                    <td key={`skeleton-col-${colIdx}`} className="px-4 py-4">
                      <div
                        className="h-4 rounded bg-white/[0.05]"
                        style={{
                          width: `${Math.max(40, ((colIdx * 17 + 53) % 60) + 30)}%`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-full py-4 flex items-center justify-center gap-2 text-xs text-[#8A8F98] border-t border-white/[0.04]">
          <div className="w-4 h-4 rounded-full border-2 border-[#255798] border-t-transparent animate-spin" />
          <span>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  // Empty State
  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full flex flex-col items-center justify-center py-20 px-4 text-center bg-[#0F0F12]/80 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-[#255798]/15 border border-[#255798]/30 flex items-center justify-center mb-3.5">
          {emptyIcon || <Inbox className="w-6 h-6 text-[#4d8ee8]" />}
        </div>
        <h3 className="text-base font-semibold text-[#EDEDEF] mb-1">
          {emptyTitle}
        </h3>
        <p className="text-xs text-[#8A8F98] max-w-sm leading-relaxed mb-4">
          {emptyDescription}
        </p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F12]/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}
    >
      <div className="overflow-x-auto">
        <table className={`w-full text-sm text-left ${minWidth} ${tableClassName}`}>
          {/* Table Header */}
          <thead
            className={`bg-white/[0.04] border-b border-white/10 ${
              stickyHeader ? "sticky top-0 z-10 backdrop-blur-md" : ""
            }`}
          >
            <tr>
              {/* Optional Selection Header Checkbox */}
              {selection && (
                <th
                  onClick={selection.onToggleSelectAll}
                  className="px-4 py-3.5 text-center w-12 cursor-pointer hover:bg-white/[0.04] transition-colors select-none"
                  title={selection.isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                >
                  <div className="flex items-center justify-center">
                    <TableCheckbox
                      checked={selection.isAllSelected}
                      indeterminate={selection.isPartiallySelected}
                      onChange={selection.onToggleSelectAll}
                    />
                  </div>
                </th>
              )}

              {/* Dynamic Columns */}
              {columns.map((col) => {
                const sortField = col.sortKey || col.key;
                const isSortable = col.sortable && Boolean(onSort);

                return (
                  <th
                    key={col.key}
                    onClick={isSortable ? () => onSort?.(sortField) : undefined}
                    className={`px-4 py-3.5 text-xs font-semibold text-[#8A8F98] uppercase tracking-wider whitespace-nowrap transition-colors ${
                      isSortable
                        ? "cursor-pointer select-none group hover:text-[#EDEDEF]"
                        : ""
                    } ${getAlignClass(col.align)} ${col.width || ""} ${
                      col.headerClassName || ""
                    }`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${getHeaderAlignFlex(
                        col.align
                      )}`}
                    >
                      <span>{col.header}</span>
                      {isSortable && renderSortIndicator(sortField)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/[0.04]">
            {data.map((row, rowIndex) => {
              const rowId = keyExtractor(row, rowIndex);
              const isSelected = selection?.selectedIds.has(rowId) || false;
              const isClickable = Boolean(onRowClick);

              const customRowClass = rowClassName
                ? rowClassName(row, rowIndex, isSelected)
                : "";

              return (
                <tr
                  key={String(rowId)}
                  onClick={isClickable ? () => onRowClick?.(row, rowIndex) : undefined}
                  className={`transition-colors duration-150 group ${
                    isClickable ? "cursor-pointer" : ""
                  } ${
                    isSelected
                      ? "bg-[#255798]/15 hover:bg-[#255798]/22"
                      : "hover:bg-white/[0.02]"
                  } ${customRowClass}`}
                >
                  {/* Optional Selection Row Checkbox */}
                  {selection && (
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        selection.onToggleSelect(rowId);
                      }}
                      className="px-4 py-3.5 text-center cursor-pointer w-12 hover:bg-white/[0.04] transition-colors"
                      title={isSelected ? "Bỏ chọn" : "Chọn dòng này"}
                    >
                      <div className="flex items-center justify-center">
                        <TableCheckbox
                          checked={isSelected}
                          onChange={() => selection.onToggleSelect(rowId)}
                        />
                      </div>
                    </td>
                  )}

                  {/* Cell Renderers */}
                  {columns.map((col) => {
                    let cellValue: unknown = null;
                    if (typeof col.accessor === "function") {
                      cellValue = col.accessor(row, rowIndex);
                    } else if (col.accessor) {
                      cellValue = (row as Record<string, unknown>)[col.accessor as string];
                    } else {
                      cellValue = (row as Record<string, unknown>)[col.key];
                    }

                    const renderedContent = col.render
                      ? col.render(cellValue, row, rowIndex)
                      : (cellValue as React.ReactNode);

                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 text-[#EDEDEF] ${
                          col.nowrap ? "whitespace-nowrap" : ""
                        } ${getAlignClass(col.align)} ${col.className || ""}`}
                      >
                        {renderedContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
