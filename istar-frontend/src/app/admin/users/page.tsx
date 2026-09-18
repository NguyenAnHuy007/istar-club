"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, UserSearchCriteria, Position, Department } from "@/types/user";
import { adminUserService } from "@/services/adminUserService";
import UserDetailModal from "@/components/admin/users/UserDetailModal";
import {
  AdminListLayout,
  PageHeader,
  HeaderSecondaryButton,
  FilterBar,
  FilterSearchInput,
  FilterSelect,
  BulkActionBar,
  DataTable,
  Column,
  TablePagination,
  TableActionGroup,
  ActionButton,
  DeleteButton,
  AdminToast,
} from "@/components/admin/common";
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  AlertTriangle,
  RefreshCw,
  Clock,
} from "lucide-react";
import { isAxiosError } from "axios";
import { DEPARTMENT_LABELS } from "@/constants/departments";

const POSITION_LABELS: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm",
  VICE_PRESIDENT: "Phó chủ nhiệm",
  HEAD_OF_DEPARTMENT: "Trưởng ban",
  DEPUTY_HEAD_OF_DEPARTMENT: "Phó ban",
  MEMBER: "Thành viên",
  CANDIDATE: "Ứng viên",
};

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filter dropdown options (loaded from API)
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  // Filter local state
  const [keyword, setKeyword] = useState("");

  // Toast
  const [toast, setToast] = useState<AdminToast | null>(null);

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "deactivate" | "delete";
    count: number;
    targetUser?: User;
  }>({
    isOpen: false,
    type: "deactivate",
    count: 0,
  });

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load filter options
  useEffect(() => {
    Promise.all([
      adminUserService.getPositions(),
      adminUserService.getDepartments(),
      adminUserService.getCourses(),
    ])
      .then(([posRes, depRes, courseRes]) => {
        setPositions(posRes);
        setDepartments(depRes);
        setCourses(courseRes);
      })
      .catch((err) => console.error("Lỗi khi load filters:", err));
  }, []);

  // Debounce keyword search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (keyword !== (criteria.keyword || "")) {
        setCriteria((prev) => ({ ...prev, keyword: keyword || undefined, page: 0 }));
      }
    }, 450);
    return () => clearTimeout(handler);
  }, [keyword, criteria.keyword]);

  // Fetch users
  useEffect(() => {
    let ignore = false;
    setIsLoading(true);

    adminUserService
      .searchUsers(criteria)
      .then((response) => {
        if (!ignore) {
          setUsers(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Lỗi khi fetch users:", error);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [criteria, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
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
    setSelectedIds(new Set());
    setCriteria((prev) => ({ ...prev, page: newPage }));
  };

  const handleSizeChange = (newSize: number) => {
    setSelectedIds(new Set());
    setCriteria((prev) => ({ ...prev, size: newSize, page: 0 }));
  };

  const handleSelectChange = <K extends keyof UserSearchCriteria>(
    field: K,
    value: string
  ) => {
    let parsedValue: unknown = value;
    if (value === "") {
      parsedValue = undefined;
    } else if (field === "isActive") {
      parsedValue = value === "true";
    }
    setSelectedIds(new Set());
    setCriteria((prev) => ({
      ...prev,
      [field]: parsedValue as UserSearchCriteria[K],
      page: 0,
    }));
  };

  // Active filter count
  const activeFilterCount = [
    Boolean(keyword),
    Boolean(criteria.position),
    Boolean(criteria.department),
    Boolean(criteria.course),
    criteria.isActive !== undefined,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setKeyword("");
    setSelectedIds(new Set());
    setCriteria((prev) => ({
      page: 0,
      size: prev.size,
      sortBy: prev.sortBy,
      sortDirection: prev.sortDirection,
    }));
  };

  // Selection handlers
  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (users.length > 0 && users.every((u) => selectedIds.has(u.id))) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        users.forEach((u) => next.delete(u.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        users.forEach((u) => next.add(u.id));
        return next;
      });
    }
  };

  // Bulk & Single User Actions
  const openConfirmModal = (type: "deactivate" | "delete") => {
    if (selectedIds.size === 0) return;
    setConfirmModal({ isOpen: true, type, count: selectedIds.size });
  };

  const openSingleConfirmModal = (type: "deactivate" | "delete", targetUser: User) => {
    setConfirmModal({ isOpen: true, type, count: 1, targetUser });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: "deactivate", count: 0, targetUser: undefined });
  };

  const handleActivateSingleUser = async (user: User) => {
    setIsActionLoading(true);
    try {
      await adminUserService.activateUser(user.id);
      handleRefresh();
      setToast({
        type: "success",
        message: `Đã kích hoạt tài khoản @${user.username} thành công.`,
      });
    } catch (err: unknown) {
      console.error(err);
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setToast({
        type: "error",
        message: msg || "Lỗi khi kích hoạt tài khoản.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExecuteBulkAction = async () => {
    setIsActionLoading(true);
    try {
      if (confirmModal.targetUser) {
        const u = confirmModal.targetUser;
        if (confirmModal.type === "deactivate") {
          await adminUserService.deactivateUser(u.id);
          setToast({
            type: "success",
            message: `Đã vô hiệu hóa tài khoản @${u.username}.`,
          });
        } else {
          await adminUserService.softDeleteUser(u.id);
          setToast({
            type: "success",
            message: `Đã xóa mềm tài khoản @${u.username}.`,
          });
        }
      } else {
        if (selectedIds.size === 0) return;
        const idsArray = Array.from(selectedIds).map(Number);
        if (confirmModal.type === "deactivate") {
          await adminUserService.bulkDeactivateUsers(idsArray);
        } else {
          await adminUserService.bulkDeleteUsers(idsArray);
        }
        setSelectedIds(new Set());
        setToast({
          type: "success",
          message:
            confirmModal.type === "deactivate"
              ? `Đã vô hiệu hóa ${confirmModal.count} tài khoản.`
              : `Đã xóa mềm ${confirmModal.count} tài khoản.`,
        });
      }
      closeConfirmModal();
      handleRefresh();
    } catch (err: unknown) {
      console.error(err);
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setToast({
        type: "error",
        message: msg || "Lỗi khi thực hiện thao tác.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Filter options
  const positionOptions = useMemo(
    () => [
      { value: "", label: "Tất cả chức vụ" },
      ...positions.map((pos) => ({
        value: pos,
        label: POSITION_LABELS[pos] || pos,
      })),
    ],
    [positions]
  );

  const departmentOptions = useMemo(
    () => [
      { value: "", label: "Tất cả ban" },
      ...departments.map((dep) => ({
        value: dep,
        label: DEPARTMENT_LABELS[dep] || dep,
      })),
    ],
    [departments]
  );

  const courseOptions = useMemo(
    () => [
      { value: "", label: "Tất cả khóa" },
      ...courses.map((c) => ({ value: c, label: `Khóa ${c}` })),
    ],
    [courses]
  );

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "true", label: "Đang hoạt động" },
    { value: "false", label: "Đã vô hiệu hóa" },
  ];

  // Define columns
  const columns: Column<User>[] = useMemo(
    () => [
      {
        key: "stt",
        header: "STT",
        width: "w-14",
        align: "center",
        nowrap: true,
        render: (_val, _row, index) => (
          <span className="text-xs font-mono text-[#8A8F98]">
            {(criteria.page || 0) * (criteria.size || 20) + index + 1}
          </span>
        ),
      },
      {
        key: "fullName",
        header: "Họ và tên",
        sortable: true,
        sortKey: "firstName",
        render: (_val, row) => {
          const fullName =
            [row.firstName, row.lastName].filter(Boolean).join(" ") ||
            row.username;
          return (
            <div>
              <div className="font-medium text-[#EDEDEF] group-hover:text-[#4d8ee8] transition-colors">
                {fullName}
              </div>
              {row.phoneNumber && (
                <div className="text-xs text-[#8A8F98]/80 mt-0.5">
                  {row.phoneNumber}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "username",
        header: "Tên đăng nhập",
        sortable: true,
        nowrap: true,
        render: (_val, row) => (
          <span className="text-xs text-[#EDEDEF] font-mono">
            @{row.username}
          </span>
        ),
      },
      {
        key: "email",
        header: "Email",
        sortable: true,
        render: (_val, row) => (
          <span className="text-[#8A8F98] text-xs">{row.email}</span>
        ),
      },
      {
        key: "role",
        header: "Vai trò",
        sortable: true,
        render: (_val, row) => (
          <div className="flex flex-wrap gap-1">
            {(row.roles && row.roles.length > 0
              ? row.roles
              : [String(row.role || "MEMBER")]
            ).map((r) => {
              const isAdminRole = r === "ADMIN";
              return (
                <span
                  key={r}
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                    isAdminRole
                      ? "bg-[#255798]/20 text-[#4d8ee8] border border-[#255798]/30"
                      : "bg-white/[0.04] text-[#8A8F98] border border-white/[0.08]"
                  }`}
                >
                  {r}
                </span>
              );
            })}
          </div>
        ),
      },
      {
        key: "isActive",
        header: "Trạng thái",
        sortable: true,
        nowrap: true,
        render: (_val, row) =>
          row.isActive ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Đang hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Chưa kích hoạt
            </span>
          ),
      },
      {
        key: "actions",
        header: "Thao tác",
        align: "right",
        width: "w-24",
        render: (_val, row) => (
          <TableActionGroup>
            {row.isActive ? (
              <ActionButton
                variant="warning"
                icon={ShieldAlert}
                tooltip="Vô hiệu hóa tài khoản"
                iconOnly
                onClick={() => openSingleConfirmModal("deactivate", row)}
              />
            ) : (
              <ActionButton
                variant="success"
                icon={ShieldCheck}
                tooltip="Kích hoạt tài khoản"
                iconOnly
                onClick={() => handleActivateSingleUser(row)}
              />
            )}
            <DeleteButton
              tooltip="Xóa tài khoản"
              onClick={() => openSingleConfirmModal("delete", row)}
            />
          </TableActionGroup>
        ),
      },
    ],
    [criteria.page, criteria.size]
  );

  const isAllSelected =
    users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const isPartiallySelected =
    users.some((u) => selectedIds.has(u.id)) && !isAllSelected;

  return (
    <AdminListLayout
      toast={toast}
      onDismissToast={() => setToast(null)}
      maxWidthClass="max-w-7xl"
    >
      {/* Page Header */}
      <PageHeader
        title="Quản lý người dùng"
        description="Xem danh sách, tìm kiếm, phân quyền và quản trị thành viên hệ thống."
        stats={[
          {
            label: "Tổng số",
            value: totalElements,
            icon: Users,
          },
        ]}
        actions={
          <HeaderSecondaryButton
            icon={RefreshCw}
            isLoading={isLoading}
            onClick={handleRefresh}
          >
            Làm mới
          </HeaderSecondaryButton>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        activeFilterCount={activeFilterCount}
        onClearFilters={handleClearFilters}
      >
        <FilterSearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Tìm theo tên, email, SĐT..."
          className="flex-1 min-w-[240px]"
        />
        <FilterSelect
          options={positionOptions}
          value={criteria.position || ""}
          onChange={(val) => handleSelectChange("position", val)}
          placeholder="Tất cả chức vụ"
          className="w-full sm:w-[170px]"
        />
        <FilterSelect
          options={departmentOptions}
          value={criteria.department || ""}
          onChange={(val) => handleSelectChange("department", val)}
          placeholder="Tất cả ban"
          className="w-full sm:w-[170px]"
        />
        <FilterSelect
          options={courseOptions}
          value={criteria.course || ""}
          onChange={(val) => handleSelectChange("course", val)}
          placeholder="Tất cả khóa"
          className="w-full sm:w-[150px]"
        />
        <FilterSelect
          options={statusOptions}
          value={
            criteria.isActive === undefined
              ? ""
              : criteria.isActive
              ? "true"
              : "false"
          }
          onChange={(val) => handleSelectChange("isActive", val)}
          placeholder="Tất cả trạng thái"
          className="w-full sm:w-[170px]"
        />
      </FilterBar>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        unitName="người dùng"
        onClearSelection={() => setSelectedIds(new Set())}
      >
        <button
          type="button"
          onClick={() => openConfirmModal("deactivate")}
          disabled={isActionLoading}
          className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Vô hiệu hóa ({selectedIds.size})</span>
        </button>

        <button
          type="button"
          onClick={() => openConfirmModal("delete")}
          disabled={isActionLoading}
          className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa ({selectedIds.size})</span>
        </button>
      </BulkActionBar>

      {/* Data Table */}
      <DataTable<User>
        data={users}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Đang tải danh sách người dùng..."
        sortBy={criteria.sortBy}
        sortDirection={criteria.sortDirection}
        onSort={handleSort}
        onRowClick={(row) => openEditModal(row)}
        selection={{
          selectedIds,
          onToggleSelect: handleToggleSelect,
          onToggleSelectAll: handleToggleSelectAll,
          isAllSelected,
          isPartiallySelected,
        }}
        emptyTitle="Không tìm thấy người dùng nào"
        emptyDescription="Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm lại."
        minWidth="min-w-[860px]"
      />

      {/* Pagination */}
      <TablePagination
        page={criteria.page || 0}
        size={criteria.size || 20}
        totalElements={totalElements}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        unitName="tài khoản"
      />

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
                      ? confirmModal.targetUser
                        ? `Xác nhận xóa tài khoản @${confirmModal.targetUser.username}`
                        : "Xác nhận xóa tài khoản"
                      : confirmModal.targetUser
                      ? `Xác nhận vô hiệu hóa @${confirmModal.targetUser.username}`
                      : "Xác nhận vô hiệu hóa"}
                  </h3>
                  <p className="text-xs text-[#8A8F98] mt-1 leading-relaxed">
                    {confirmModal.type === "delete"
                      ? confirmModal.targetUser
                        ? `Bạn có chắc chắn muốn xóa mềm tài khoản @${confirmModal.targetUser.username} (${[confirmModal.targetUser.firstName, confirmModal.targetUser.lastName].filter(Boolean).join(" ")})? Tài khoản sẽ bị ẩn khỏi danh sách.`
                        : `Bạn có chắc chắn muốn xóa mềm ${confirmModal.count} tài khoản đã chọn? Tài khoản sẽ bị ẩn khỏi danh sách.`
                      : confirmModal.targetUser
                      ? `Bạn có chắc chắn muốn vô hiệu hóa tài khoản @${confirmModal.targetUser.username}? Người dùng sẽ không thể đăng nhập vào hệ thống.`
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
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleRefresh}
      />
    </AdminListLayout>
  );
}
