"use client";

import { RecruitmentDto } from "@/types/recruitment";
import {
  Calendar,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  CalendarRange,
} from "lucide-react";

interface RecruitmentTableProps {
  recruitments: RecruitmentDto[];
  isLoading: boolean;
  onEdit: (recruitment: RecruitmentDto) => void;
  onActivateRecruitment?: (id: number) => void;
  onCloseRecruitment: (id: number) => void;
  onDelete: (id: number) => void;
  page: number;
  size: number;
}

export default function RecruitmentTable({
  recruitments,
  isLoading,
  onEdit,
  onActivateRecruitment,
  onCloseRecruitment,
  onDelete,
  page,
  size,
}: RecruitmentTableProps) {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20 text-[#8A8F98] bg-black/20 border border-white/[0.08] rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#255798] border-t-[#4d8ee8] animate-spin" />
          <span className="text-sm">Đang tải danh sách đợt tuyển...</span>
        </div>
      </div>
    );
  }

  if (recruitments.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-[#8A8F98] bg-white/[0.02] border border-white/[0.08] rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-[#255798]/15 border border-[#255798]/30 flex items-center justify-center mb-3">
          <CalendarRange className="w-6 h-6 text-[#4d8ee8]" />
        </div>
        <p className="text-base font-medium text-[#EDEDEF] mb-1">
          Chưa có đợt tuyển thành viên nào
        </p>
        <p className="text-xs text-[#8A8F98]">
          Nhấn nút &ldquo;Tạo đợt tuyển mới&rdquo; để khởi tạo chiến dịch tuyển thành viên.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[640px] xl:min-w-0">
          <thead className="bg-white/[0.04] border-b border-white/[0.08]">
            <tr>
              <th className="px-4 py-3.5 text-xs font-semibold text-[#8A8F98] w-12 text-center whitespace-nowrap">
                STT
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-[#8A8F98] uppercase tracking-wider whitespace-nowrap">
                Tên đợt tuyển thành viên
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-[#8A8F98] uppercase tracking-wider whitespace-nowrap">
                Thời gian diễn ra
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-[#8A8F98] uppercase tracking-wider whitespace-nowrap">
                Trạng thái
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-[#8A8F98] uppercase tracking-wider whitespace-nowrap">
                Ngày tạo
              </th>
              <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#8A8F98] uppercase tracking-wider whitespace-nowrap">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {recruitments.map((item, index) => (
              <tr
                key={item.id}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                {/* STT */}
                <td className="px-4 py-3.5 text-xs text-[#8A8F98] text-center font-mono whitespace-nowrap">
                  {page * size + index + 1}
                </td>

                {/* Tên đợt */}
                <td className="px-4 py-3.5">
                  <div className="font-medium text-[#EDEDEF] group-hover:text-white transition-colors">
                    {item.name}
                  </div>
                  <div className="text-xs text-[#8A8F98] font-mono">
                    ID: #{item.id}
                  </div>
                </td>

                {/* Thời gian */}
                <td className="px-4 py-3.5 text-xs text-[#EDEDEF] whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#4d8ee8] shrink-0" />
                    <span>
                      {item.startDate
                        ? new Date(item.startDate).toLocaleDateString("vi-VN")
                        : "Chưa đặt"}
                    </span>
                    <span className="text-[#8A8F98]">đến</span>
                    <span>
                      {item.endDate
                        ? new Date(item.endDate).toLocaleDateString("vi-VN")
                        : "Chưa đặt"}
                    </span>
                  </div>
                </td>

                {/* Trạng thái */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {item.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Đang mở (Active)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-zinc-500/10 border-zinc-500/25 text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      Đã đóng (Closed)
                    </span>
                  )}
                </td>

                {/* Ngày tạo */}
                <td className="px-4 py-3.5 text-xs text-[#8A8F98] font-mono whitespace-nowrap">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                    : "—"}
                </td>

                {/* Thao tác */}
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Sửa */}
                    <button
                      title="Chỉnh sửa thông tin"
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-[#8A8F98] hover:text-[#4d8ee8] hover:bg-[#255798]/15 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Kích hoạt lại (nếu đang đóng) */}
                    {!item.isActive && onActivateRecruitment && (
                      <button
                        title="Kích hoạt mở đợt tuyển này"
                        onClick={() => onActivateRecruitment(item.id)}
                        className="p-1.5 text-[#8A8F98] hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      >
                        <Unlock className="w-4 h-4" />
                      </button>
                    )}

                    {/* Đóng đợt (nếu đang active) */}
                    {item.isActive && (
                      <button
                        title="Đóng đợt tuyển này"
                        onClick={() => onCloseRecruitment(item.id)}
                        className="p-1.5 text-[#8A8F98] hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    )}

                    {/* Xóa mềm */}
                    <button
                      title="Xóa đợt tuyển"
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-[#8A8F98] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
