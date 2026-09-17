"use client";

import {
  ApplicationFormDto,
  APPLICATION_STATUS_CONFIG,
  DEPARTMENT_CONFIG,
  ApplicationStatus,
} from "@/types/application";
import {
  Calendar,
  Layers,
  UserPlus,
} from "lucide-react";
import { Facebook } from "@/components/common/Icons";
import Image from "next/image";
import {
  TableActionGroup,
  ApproveButton,
  RejectButton,
  DeleteButton,
  ActionButton,
} from "@/components/admin/common/TableActionButtons";

interface ApplicationTableProps {
  applications: ApplicationFormDto[];
  isLoading: boolean;
  onViewDetail: (app: ApplicationFormDto) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onCreateAccount: (id: number) => void;
  onDelete: (id: number) => void;
  onSort: (field: string) => void;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  page: number;
  size: number;
}

export default function ApplicationTable({
  applications,
  isLoading,
  onViewDetail,
  onApprove,
  onReject,
  onCreateAccount,
  onDelete,
  onSort,
  sortBy,
  sortDirection,
  page,
  size,
}: ApplicationTableProps) {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "ASC" ? " ↑" : " ↓";
  };

  const thClass =
    "px-4 py-3.5 text-left text-xs font-semibold text-[#8A8F98] uppercase tracking-wider cursor-pointer hover:text-[#EDEDEF] transition-colors whitespace-nowrap";

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-24 text-[#8A8F98] bg-black/20 border border-white/[0.08] rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#255798] border-t-[#4d8ee8] animate-spin" />
          <span className="text-sm">Đang tải danh sách đơn ứng tuyển...</span>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 text-[#8A8F98] bg-white/[0.02] border border-white/[0.08] rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-[#255798]/15 border border-[#255798]/30 flex items-center justify-center mb-3">
          <Layers className="w-6 h-6 text-[#4d8ee8]" />
        </div>
        <p className="text-base font-medium text-[#EDEDEF] mb-1">
          Không tìm thấy đơn ứng tuyển nào
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
        <table className="w-full text-sm text-left min-w-[960px]">
          <thead className="bg-white/[0.04] border-b border-white/[0.08]">
            <tr>
              <th className="px-3 sm:px-4 py-3.5 text-xs font-semibold text-[#8A8F98] w-12 text-center whitespace-nowrap">
                STT
              </th>
              <th onClick={() => onSort("firstName")} className={thClass}>
                Ứng viên {getSortIcon("firstName")}
              </th>
              <th onClick={() => onSort("email")} className={thClass}>
                Email & SĐT {getSortIcon("email")}
              </th>
              <th className="px-3 sm:px-4 py-3.5 text-left text-xs font-semibold text-[#8A8F98] uppercase tracking-wider whitespace-nowrap">
                Nguyện vọng Ban
              </th>
              <th onClick={() => onSort("status")} className={thClass}>
                Trạng thái {getSortIcon("status")}
              </th>
              <th className="px-3 sm:px-4 py-3.5 text-left text-xs font-semibold text-[#8A8F98] uppercase tracking-wider whitespace-nowrap">
                Đợt tuyển
              </th>
              <th onClick={() => onSort("createdAt")} className={thClass}>
                Ngày nộp {getSortIcon("createdAt")}
              </th>
              <th className="px-3 sm:px-4 py-3.5 text-right text-xs font-semibold text-[#8A8F98] uppercase tracking-wider whitespace-nowrap">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {applications.map((app, index) => {
              const fullName = `${app.lastName || ""} ${app.firstName || ""}`.trim() || "Chưa có tên";
              const statusCfg = APPLICATION_STATUS_CONFIG[app.status] || {
                label: app.status,
                badgeBg: "bg-white/10",
                badgeBorder: "border-white/20",
                textColor: "text-white",
                dotColor: "bg-white",
              };

              return (
                <tr
                  key={app.id}
                  className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  onClick={() => onViewDetail(app)}
                >
                  {/* STT */}
                  <td className="px-3 sm:px-4 py-3.5 text-xs text-[#8A8F98] text-center font-mono whitespace-nowrap">
                    {page * size + index + 1}
                  </td>

                  {/* Ứng viên Info */}
                  <td className="px-3 sm:px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {app.avatarUrl ? (
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0">
                          <Image
                            src={app.avatarUrl}
                            alt={fullName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#255798] to-[#4d8ee8] flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-[#EDEDEF] group-hover:text-white transition-colors truncate max-w-[180px]">
                          {fullName}
                        </div>
                        <div className="text-xs text-[#8A8F98] truncate max-w-[180px]">
                          {[app.course, app.majorClass].filter(Boolean).join(" • ") ||
                            app.school ||
                            "Chưa có thông tin lớp"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email & SĐT */}
                  <td className="px-3 sm:px-4 py-3.5">
                    <div className="text-xs text-[#EDEDEF] truncate max-w-[180px]">{app.email}</div>
                    <div className="text-xs text-[#8A8F98] font-mono">
                      {app.phoneNumber || "—"}
                    </div>
                    {app.facebookUrl && (
                      <a
                        href={app.facebookUrl.startsWith("http") ? app.facebookUrl : `https://${app.facebookUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-[#4d8ee8] hover:text-[#7bb0f8] hover:underline mt-0.5"
                        title="Mở Facebook ứng viên"
                      >
                        <Facebook className="w-3 h-3 text-[#1877F2]" />
                        <span>Facebook</span>
                      </a>
                    )}
                  </td>

                  {/* Nguyện vọng Ban */}
                  <td className="px-3 sm:px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {app.applicationDepartments &&
                      app.applicationDepartments.length > 0 ? (
                        app.applicationDepartments.map((dept) => {
                          const conf = DEPARTMENT_CONFIG[dept.department];
                          return (
                            <span
                              key={dept.id || dept.department}
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap ${
                                conf
                                  ? `${conf.badgeBg} ${conf.badgeBorder} ${conf.textColor}`
                                  : "bg-white/10 border-white/20 text-white"
                              }`}
                            >
                              {conf ? conf.name : dept.department}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-[#8A8F98]">Chưa chọn</span>
                      )}
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.badgeBg} ${statusCfg.badgeBorder} ${statusCfg.textColor}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor} animate-pulse`}
                      />
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Đợt tuyển */}
                  <td className="px-4 py-3.5 text-xs text-[#8A8F98] whitespace-nowrap">
                    {app.recruitmentName ? (
                      <span className="truncate max-w-[160px] block" title={app.recruitmentName}>
                        {app.recruitmentName}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Ngày nộp */}
                  <td className="px-4 py-3.5 text-xs text-[#8A8F98] whitespace-nowrap font-mono">
                    {app.createdAt ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#4d8ee8]" />
                        {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Thao tác */}
                  <td
                    className="px-4 py-3.5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TableActionGroup>
                      {/* Duyệt đơn */}
                      {app.status !== ApplicationStatus.APPROVED &&
                        app.status !== ApplicationStatus.REJECTED && (
                          <ApproveButton
                            tooltip="Duyệt đơn ứng tuyển"
                            onClick={() => onApprove(app.id)}
                          />
                        )}

                      {/* Từ chối đơn */}
                      {app.status !== ApplicationStatus.REJECTED && (
                        <RejectButton
                          tooltip="Từ chối đơn ứng tuyển"
                          onClick={() => onReject(app.id)}
                        />
                      )}

                      {/* Tạo tài khoản nếu đã duyệt */}
                      {app.status === ApplicationStatus.APPROVED && (
                        <ActionButton
                          icon={UserPlus}
                          variant="primary"
                          tooltip="Tạo tài khoản thành viên"
                          onClick={() => onCreateAccount(app.id)}
                        />
                      )}

                      {/* Xóa mềm */}
                      <DeleteButton
                        tooltip="Xóa đơn ứng tuyển"
                        onClick={() => onDelete(app.id)}
                      />
                    </TableActionGroup>
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
