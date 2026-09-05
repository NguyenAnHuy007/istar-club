"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, UserSearchCriteria } from "@/types/user";
import { adminUserService } from "@/services/adminUserService";
import UserFilters from "@/components/admin/users/UserFilters";
import UserTable from "@/components/admin/users/UserTable";
import UserDetailModal from "@/components/admin/users/UserDetailModal";
import CustomSelect, { Option } from "@/components/common/CustomSelect";
import {
  ShieldAlert,
  Trash2,
  X,
  Users,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const PAGE_SIZE_OPTIONS: Option[] = [
  { value: "10", label: "10 / trang" },
  { value: "20", label: "20 / trang" },
  { value: "30", label: "30 / trang" },
  { value: "50", label: "50 / trang" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [criteria, setCriteria] = useState<UserSearchCriteria>({
    page: 0,
    size: 20,
    sortBy: "id",
    sortDirection: "ASC",
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Checkbox selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modal confirmation for bulk action
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "deactivate" | "delete";
    count: number;
  }>({
    isOpen: false,
    type: "deactivate",
    count: 0,
  });

  // Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminUserService.searchUsers(criteria);
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Lỗi khi fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [criteria]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Xóa danh sách đã chọn khi chuyển trang hoặc đổi filter
  const handleFilterChange = (newCriteria: UserSearchCriteria) => {
    setSelectedIds(new Set());
    setCriteria(newCriteria);
  };

  const handlePageSizeChange = (newSizeStr: string) => {
    const newSize = parseInt(newSizeStr, 10) || 20;
    setSelectedIds(new Set());
    setCriteria((prev) => ({
      ...prev,
      size: newSize,
      page: 0,
    }));
  };

  const handleSort = (field: string) => {
    setCriteria((prev) => ({
      ...prev,
      sortBy: field,
      sortDirection:
        prev.sortBy === field && prev.sortDirection === "ASC" ? "DESC" : "ASC",
      page: 0,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setSelectedIds(new Set());
      setCriteria((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Toggle selection for a single user
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle select all on current page
  const handleToggleSelectAll = () => {
    const allCurrentPageSelected =
      users.length > 0 && users.every((u) => selectedIds.has(u.id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allCurrentPageSelected) {
        users.forEach((u) => next.delete(u.id));
      } else {
        users.forEach((u) => next.add(u.id));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Trigger Confirmation Modal
  const openConfirmModal = (type: "deactivate" | "delete") => {
    if (selectedIds.size === 0) return;
    setConfirmModal({
      isOpen: true,
      type,
      count: selectedIds.size,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: "deactivate", count: 0 });
  };

  // Execute Bulk Action after confirmation
  const handleExecuteBulkAction = async () => {
    if (selectedIds.size === 0) return;

    setIsActionLoading(true);
    try {
      const idsArray = Array.from(selectedIds);
      if (confirmModal.type === "deactivate") {
        await adminUserService.bulkDeactivateUsers(idsArray);
      } else {
        await adminUserService.bulkDeleteUsers(idsArray);
      }
      setSelectedIds(new Set());
      closeConfirmModal();
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi khi thực hiện thao tác hàng loạt.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header with Title & Stats */}
      <motion.div
        {...fadeUp(0)}
        className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-[#8A8F98]">
            Xem danh sách, tìm kiếm, phân quyền và quản trị thành viên hệ thống.
          </p>
        </div>

        {/* Tổng số lượng tài khoản */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs self-start sm:self-auto">
          <Users className="w-4 h-4 text-[#4d8ee8]" />
          <span className="text-[#8A8F98]">Tổng số:</span>
          <span className="font-semibold text-[#EDEDEF]">
            {totalElements.toLocaleString()}
          </span>
          <span className="text-[#8A8F98]">tài khoản</span>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.15)}>
        {/* Filters */}
        <UserFilters criteria={criteria} onFilterChange={handleFilterChange} />

        {/* Bulk Action Toolbar (Appears when >= 1 item is selected) */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="mb-4 px-4 py-3 rounded-2xl bg-[#0e0e18] border border-[#255798]/40 shadow-[0_8px_32px_rgba(37,87,152,0.2)] flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 text-sm text-[#EDEDEF]">
                <CheckSquare className="w-4 h-4 text-[#4d8ee8]" />
                <span>
                  Đã chọn:{" "}
                  <strong className="text-[#4d8ee8]">
                    {selectedIds.size}
                  </strong>{" "}
                  người dùng
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Vô hiệu hóa hàng loạt */}
                <button
                  onClick={() => openConfirmModal("deactivate")}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Vô hiệu hóa các tài khoản đã chọn"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Vô hiệu hóa ({selectedIds.size})</span>
                </button>

                {/* Xóa hàng loạt */}
                <button
                  onClick={() => openConfirmModal("delete")}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Xóa mềm các tài khoản đã chọn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ({selectedIds.size})</span>
                </button>

                {/* Bỏ chọn */}
                <button
                  onClick={handleClearSelection}
                  disabled={isActionLoading}
                  className="p-1.5 text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                  title="Bỏ chọn tất cả"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Table */}
        <UserTable
          users={users}
          isLoading={isLoading}
          onEdit={openEditModal}
          onSort={handleSort}
          sortBy={criteria.sortBy}
          sortDirection={criteria.sortDirection}
          page={criteria.page || 0}
          size={criteria.size || 20}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />

        {/* Pagination & Page Size Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-1">
          {/* Page size dropdown */}
          <div className="flex items-center gap-2 text-xs text-[#8A8F98]">
            <span>Hiển thị:</span>
            <div className="w-32">
              <CustomSelect
                value={String(criteria.size || 20)}
                onChange={handlePageSizeChange}
                options={PAGE_SIZE_OPTIONS}
              />
            </div>
            <span>
              (Bản ghi {(Number(criteria.page) * Number(criteria.size)) + 1} -{" "}
              {Math.min(
                (Number(criteria.page) + 1) * Number(criteria.size),
                totalElements
              )}{" "}
              trên tổng số {totalElements})
            </span>
          </div>

          {/* Page navigation buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8A8F98]">
                Trang {Number(criteria.page) + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(Number(criteria.page) - 1)}
                  disabled={Number(criteria.page) === 0}
                  className="px-3.5 py-1.5 text-xs text-[#EDEDEF] bg-white/[0.05] border border-white/[0.1] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.1] transition-colors"
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(Number(criteria.page) + 1)}
                  disabled={Number(criteria.page) === totalPages - 1}
                  className="px-3.5 py-1.5 text-xs text-[#EDEDEF] bg-white/[0.05] border border-white/[0.1] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.1] transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeConfirmModal}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-6 rounded-2xl bg-[#0c0c14] border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.8)] z-10 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    confirmModal.type === "delete"
                      ? "bg-red-500/15 text-red-400 border border-red-500/25"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                  }`}
                >
                  {confirmModal.type === "delete" ? (
                    <Trash2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#EDEDEF]">
                    {confirmModal.type === "delete"
                      ? "Xác nhận xóa tài khoản"
                      : "Xác nhận vô hiệu hóa"}
                  </h3>
                  <p className="text-xs text-[#8A8F98] mt-1 leading-relaxed">
                    {confirmModal.type === "delete"
                      ? `Bạn có chắc chắn muốn xóa mềm ${confirmModal.count} tài khoản đã chọn? Tài khoản sẽ bị ẩn khỏi danh sách.`
                      : `Bạn có chắc chắn muốn vô hiệu hóa ${confirmModal.count} tài khoản đã chọn? Người dùng sẽ không thể đăng nhập vào hệ thống.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={closeConfirmModal}
                  disabled={isActionLoading}
                  className="px-4 py-2 text-xs font-medium text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkAction}
                  disabled={isActionLoading}
                  className={`px-4 py-2 text-xs font-medium text-white rounded-xl transition-all shadow-md cursor-pointer ${
                    confirmModal.type === "delete"
                      ? "bg-red-600 hover:bg-red-500 shadow-red-500/20"
                      : "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20"
                  }`}
                >
                  {isActionLoading ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <UserDetailModal
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={closeEditModal}
        onUserUpdated={fetchUsers}
      />
    </div>
  );
}
