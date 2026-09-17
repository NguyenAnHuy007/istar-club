"use client";

import { useState, useEffect, useMemo } from "react";
import { RecruitmentDto } from "@/types/recruitment";
import adminRecruitmentService from "@/services/adminRecruitmentService";
import RecruitmentModal from "@/components/admin/recruitments/RecruitmentModal";
import {
  AdminListLayout,
  PageHeader,
  HeaderPrimaryButton,
  HeaderSecondaryButton,
  DataTable,
  Column,
  TablePagination,
  TableActionGroup,
  DeleteButton,
  ActionButton,
  AdminToast,
} from "@/components/admin/common";
import {
  CalendarRange,
  Plus,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Lock,
  Unlock,
} from "lucide-react";
import { isAxiosError } from "axios";

export default function RecruitmentsPage() {
  const [recruitments, setRecruitments] = useState<RecruitmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecruitment, setSelectedRecruitment] =
    useState<RecruitmentDto | null>(null);

  // Toast
  const [toast, setToast] = useState<AdminToast | null>(null);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);

    adminRecruitmentService
      .getAllRecruitments(page, size)
      .then((response) => {
        if (!ignore) {
          setRecruitments(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Lỗi khi tải đợt tuyển:", error);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, size, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCreate = () => {
    setSelectedRecruitment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (recruitment: RecruitmentDto) => {
    setSelectedRecruitment(recruitment);
    setIsModalOpen(true);
  };

  const handleActivateRecruitment = async (id: number) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn KÍCH HOẠT đợt tuyển thành viên này? Đợt tuyển đang mở hiện tại (nếu có) sẽ được tự động đóng lại."
      )
    )
      return;
    try {
      await adminRecruitmentService.activateRecruitment(id);
      handleRefresh();
      setToast({
        type: "success",
        message: "Kích hoạt đợt tuyển thành viên thành công!",
      });
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setToast({
        type: "error",
        message: "Lỗi kích hoạt đợt tuyển: " + (msg || "Đã có lỗi xảy ra"),
      });
    }
  };

  const handleCloseRecruitment = async (id: number) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn ĐÓNG đợt tuyển thành viên này? Ứng viên sẽ không thể nộp đơn trực tuyến vào đợt này nữa."
      )
    )
      return;
    try {
      await adminRecruitmentService.closeRecruitment(id);
      handleRefresh();
      setToast({
        type: "success",
        message: "Đã đóng đợt tuyển thành công!",
      });
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setToast({
        type: "error",
        message: "Lỗi đóng đợt tuyển: " + (msg || "Đã có lỗi xảy ra"),
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn XÓA đợt tuyển thành viên này?"))
      return;
    try {
      await adminRecruitmentService.deleteRecruitment(id);
      handleRefresh();
      setToast({
        type: "success",
        message: "Xóa đợt tuyển thành công!",
      });
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setToast({
        type: "error",
        message: "Lỗi xóa đợt tuyển: " + (msg || "Đã có lỗi xảy ra"),
      });
    }
  };

  const activeRecruitment = recruitments.find((r) => r.isActive);

  // Define columns
  const columns: Column<RecruitmentDto>[] = useMemo(
    () => [
      {
        key: "stt",
        header: "STT",
        width: "w-12",
        align: "center",
        nowrap: true,
        render: (_val, _row, index) => (
          <span className="text-xs font-mono text-[#8A8F98]">
            {page * size + index + 1}
          </span>
        ),
      },
      {
        key: "name",
        header: "Tên đợt tuyển thành viên",
        render: (_val, row) => (
          <div>
            <div className="font-medium text-[#EDEDEF] group-hover:text-[#4d8ee8] transition-colors">
              {row.name}
            </div>
            <div className="text-xs text-[#8A8F98] font-mono">
              ID: #{row.id}
            </div>
          </div>
        ),
      },
      {
        key: "period",
        header: "Thời gian diễn ra",
        nowrap: true,
        render: (_val, row) => (
          <div className="flex items-center gap-1.5 text-xs text-[#EDEDEF]">
            <Calendar className="w-3.5 h-3.5 text-[#4d8ee8] shrink-0" />
            <span>
              {row.startDate
                ? new Date(row.startDate).toLocaleDateString("vi-VN")
                : "Chưa đặt"}
            </span>
            <span className="text-[#8A8F98]">đến</span>
            <span>
              {row.endDate
                ? new Date(row.endDate).toLocaleDateString("vi-VN")
                : "Chưa đặt"}
            </span>
          </div>
        ),
      },
      {
        key: "isActive",
        header: "Trạng thái",
        nowrap: true,
        render: (_val, row) =>
          row.isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Đang mở (Active)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-zinc-500/10 border-zinc-500/25 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              Đã đóng (Closed)
            </span>
          ),
      },
      {
        key: "createdAt",
        header: "Ngày tạo",
        nowrap: true,
        render: (_val, row) => (
          <span className="text-xs text-[#8A8F98] font-mono">
            {row.createdAt
              ? new Date(row.createdAt).toLocaleDateString("vi-VN")
              : "—"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Thao tác",
        align: "right",
        width: "w-28",
        nowrap: true,
        render: (_val, row) => (
          <TableActionGroup>
            {!row.isActive && (
              <ActionButton
                icon={Unlock}
                variant="success"
                tooltip="Kích hoạt mở đợt tuyển này"
                onClick={() => handleActivateRecruitment(row.id)}
              />
            )}

            {row.isActive && (
              <ActionButton
                icon={Lock}
                variant="warning"
                tooltip="Đóng đợt tuyển này"
                onClick={() => handleCloseRecruitment(row.id)}
              />
            )}

            <DeleteButton
              tooltip="Xóa đợt tuyển"
              onClick={() => handleDelete(row.id)}
            />
          </TableActionGroup>
        ),
      },
    ],
    [page, size]
  );

  return (
    <AdminListLayout
      toast={toast}
      onDismissToast={() => setToast(null)}
      maxWidthClass="max-w-6xl"
    >
      {/* Page Header */}
      <PageHeader
        badge="Chiến dịch Tuyển thành viên"
        title="Quản lý đợt tuyển thành viên"
        description="Khởi tạo các đợt tuyển quân, kiểm soát thời gian mở/đóng nhận hồ sơ ứng viên."
        actions={
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
            <HeaderSecondaryButton
              icon={RefreshCw}
              isLoading={isLoading}
              onClick={handleRefresh}
            >
              Làm mới
            </HeaderSecondaryButton>

            <HeaderPrimaryButton icon={Plus} onClick={handleCreate}>
              Tạo đợt tuyển mới
            </HeaderPrimaryButton>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#255798]/15 border border-[#255798]/30 flex items-center justify-center shrink-0">
            <CalendarRange className="w-5 h-5 text-[#4d8ee8]" />
          </div>
          <div>
            <div className="text-xs text-[#8A8F98]">Tổng số đợt tuyển</div>
            <div className="text-xl font-bold text-white font-mono">
              {totalElements}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-[#8A8F98]">
              Đợt đang mở tiếp nhận đơn
            </div>
            <div className="text-sm font-semibold text-emerald-400 truncate max-w-xs">
              {activeRecruitment
                ? activeRecruitment.name
                : "Không có đợt nào đang mở"}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable<RecruitmentDto>
        data={recruitments}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={(row) => handleEdit(row)}
        isLoading={isLoading}
        loadingMessage="Đang tải danh sách đợt tuyển..."
        emptyTitle="Chưa có đợt tuyển thành viên nào"
        emptyDescription={'Nhấn nút "Tạo đợt tuyển mới" để khởi tạo chiến dịch tuyển thành viên.'}
        emptyIcon={<CalendarRange className="w-6 h-6 text-[#4d8ee8]" />}
        minWidth="min-w-[640px]"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <TablePagination
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={setPage}
          unitName="đợt tuyển"
        />
      )}

      {/* Create / Edit Modal */}
      <RecruitmentModal
        isOpen={isModalOpen}
        recruitment={selectedRecruitment}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecruitment(null);
        }}
        onSuccess={handleRefresh}
      />
    </AdminListLayout>
  );
}
