"use client";

import { User } from "@/types/user";
import { ShieldAlert, ShieldCheck, Check, Minus } from "lucide-react";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onSort: (field: string) => void;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  page: number;
  size: number;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
}

function TableCheckbox({
  checked,
  indeterminate,
}: {
  checked: boolean;
  indeterminate?: boolean;
}) {
  return (
    <div
      className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all duration-150 select-none ${
        checked
          ? "bg-gradient-to-br from-[#255798] to-[#3b82f6] border border-[#4d8ee8] shadow-[0_0_10px_rgba(77,142,232,0.4)]"
          : indeterminate
          ? "bg-[#255798]/50 border border-[#4d8ee8] shadow-[0_0_6px_rgba(77,142,232,0.25)]"
          : "border border-white/25 bg-white/[0.02] hover:border-white/45 hover:bg-white/[0.05]"
      }`}
    >
      {checked ? (
        <Check className="w-3 h-3 text-white stroke-[3]" />
      ) : indeterminate ? (
        <Minus className="w-3 h-3 text-white stroke-[3]" />
      ) : null}
    </div>
  );
}

export default function UserTable({
  users,
  isLoading,
  onEdit,
  onSort,
  sortBy,
  sortDirection,
  page,
  size,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: UserTableProps) {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "ASC" ? " ↑" : " ↓";
  };

  const isAllSelected =
    users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const isPartiallySelected =
    users.some((u) => selectedIds.has(u.id)) && !isAllSelected;

  const thClass =
    "px-4 py-3.5 text-left text-xs font-semibold text-[#8A8F98] uppercase tracking-wider cursor-pointer hover:text-[#EDEDEF] transition-colors whitespace-nowrap";

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-24 text-[#8A8F98] bg-black/20 border border-white/[0.08] rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#255798] border-t-[#4d8ee8] animate-spin" />
          <span className="text-sm">Đang tải danh sách người dùng...</span>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 text-[#8A8F98] bg-white/[0.02] border border-white/[0.08] rounded-2xl">
        <p className="text-base font-medium text-[#EDEDEF] mb-1">
          Không tìm thấy người dùng nào
        </p>
        <p className="text-xs text-[#8A8F98]">
          Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm lại.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.04] border-b border-white/[0.08]">
            <tr>
              {/* STT */}
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#8A8F98] uppercase tracking-wider w-16">
                STT
              </th>

              {/* Họ tên */}
              <th onClick={() => onSort("firstName")} className={thClass}>
                Họ và tên {getSortIcon("firstName")}
              </th>

              {/* Username */}
              <th onClick={() => onSort("username")} className={thClass}>
                Tên đăng nhập {getSortIcon("username")}
              </th>

              {/* Email */}
              <th onClick={() => onSort("email")} className={thClass}>
                Email {getSortIcon("email")}
              </th>

              {/* Role */}
              <th onClick={() => onSort("role")} className={thClass}>
                Vai trò {getSortIcon("role")}
              </th>

              {/* Trạng thái */}
              <th onClick={() => onSort("isActive")} className={thClass}>
                Trạng thái {getSortIcon("isActive")}
              </th>

              {/* Checkbox All (Thay cột Thao tác - Không có chữ 'chọn') */}
              <th
                onClick={onToggleSelectAll}
                className="px-4 py-3.5 text-center w-14 cursor-pointer hover:bg-white/[0.04] transition-colors select-none"
                title={isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              >
                <div className="flex items-center justify-center">
                  <TableCheckbox
                    checked={isAllSelected}
                    indeterminate={isPartiallySelected}
                  />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.06]">
            {users.map((user, index) => {
              const isSelected = selectedIds.has(user.id);
              const stt = page * size + index + 1;
              const fullName = [user.firstName, user.lastName]
                .filter(Boolean)
                .join(" ");

              return (
                <tr
                  key={user.id}
                  onClick={() => onEdit(user)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? "bg-[#255798]/15 hover:bg-[#255798]/25"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* STT */}
                  <td className="px-4 py-3.5 text-xs text-[#8A8F98] font-medium">
                    {stt}
                  </td>

                  {/* Họ và tên */}
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-[#EDEDEF] group-hover:text-[#4d8ee8] transition-colors">
                      {fullName || user.username}
                    </div>
                    {user.phoneNumber && (
                      <div className="text-xs text-[#8A8F98]/80 mt-0.5">
                        {user.phoneNumber}
                      </div>
                    )}
                  </td>

                  {/* Username */}
                  <td className="px-4 py-3.5 text-xs text-[#EDEDEF] font-mono">
                    @{user.username}
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5 text-[#8A8F98] text-xs">
                    {user.email}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-[#255798]/25 text-[#4d8ee8] border border-[#255798]/30"
                          : "bg-white/[0.04] text-[#8A8F98] border border-white/[0.08]"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Đã vô hiệu
                      </span>
                    )}
                  </td>

                  {/* Checkbox Cell */}
                  <td
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(user.id);
                    }}
                    className="px-4 py-3.5 text-center cursor-pointer hover:bg-white/[0.06] transition-colors w-14"
                    title={isSelected ? "Bỏ chọn" : "Chọn người dùng này"}
                  >
                    <div className="flex items-center justify-center">
                      <TableCheckbox checked={isSelected} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
