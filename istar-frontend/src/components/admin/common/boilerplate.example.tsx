"use client";

import React, { useState, useMemo } from "react";
import {
  AdminListLayout,
  PageHeader,
  HeaderPrimaryButton,
  HeaderSecondaryButton,
  FilterBar,
  FilterSearchInput,
  FilterSelect,
  FilterDateInput,
  BulkActionBar,
  DataTable,
  Column,
  TablePagination,
  TableActionGroup,
  ViewButton,
  EditButton,
  DeleteButton,
  AdminToast,
} from "@/components/admin/common";
import {
  Users,
  Download,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Lock,
} from "lucide-react";

// 1. Define Entity Data Model
interface SampleMember {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: "ADMIN" | "INTERVIEWER" | "RECEPTIONIST" | "MEMBER";
  department: string;
  isActive: boolean;
  joinedAt: string;
}

// 2. Mock Initial Data for Demonstration
const MOCK_DATA: SampleMember[] = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    username: "nguyenvana",
    email: "vana@haui.edu.vn",
    role: "ADMIN",
    department: "Ban Âm nhạc",
    isActive: true,
    joinedAt: "2024-09-01",
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    username: "tranthib",
    email: "thib@haui.edu.vn",
    role: "INTERVIEWER",
    department: "Ban Rap",
    isActive: true,
    joinedAt: "2024-09-05",
  },
  {
    id: 3,
    fullName: "Lê Hoàng C",
    username: "lehoangc",
    email: "hoangc@haui.edu.vn",
    role: "MEMBER",
    department: "Ban Vũ đạo",
    isActive: false,
    joinedAt: "2024-09-10",
  },
  {
    id: 4,
    fullName: "Phạm Minh D",
    username: "phamminhd",
    email: "minhd@haui.edu.vn",
    role: "RECEPTIONIST",
    department: "Ban TT&TCSK",
    isActive: true,
    joinedAt: "2024-09-12",
  },
];

const ROLE_OPTIONS = [
  { value: "", label: "Tất cả vai trò" },
  { value: "ADMIN", label: "Quản trị viên (Admin)" },
  { value: "INTERVIEWER", label: "Phỏng vấn viên" },
  { value: "RECEPTIONIST", label: "Lễ tân" },
  { value: "MEMBER", label: "Thành viên" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Đã vô hiệu hóa" },
];

/**
 * Boilerplate Example: Full Admin Management Page using the Data Table UI kit.
 * Copy and adapt this pattern for any administrative list view in iStar.
 */
export default function BoilerplateAdminPageExample() {
  // State: Data & Loading
  const [data, setData] = useState<SampleMember[]>(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<AdminToast | null>({
    type: "info",
    message: "Chào mừng! Đây là trang mẫu chuẩn hóa danh sách quản trị (UI Kit).",
  });

  // State: Search & Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // State: Sorting
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");

  // State: Pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // State: Selection
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Handle Sort Change
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortDirection("ASC");
    }
  };

  // Handle Refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setData(MOCK_DATA);
      setIsLoading(false);
      setToast({ type: "success", message: "Đã làm mới dữ liệu thành công!" });
    }, 600);
  };

  // Handle Selection
  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((item) => item.id)));
    }
  };

  // Calculate active filter count
  const activeFilterCount = [
    Boolean(searchKeyword),
    Boolean(roleFilter),
    Boolean(statusFilter),
    Boolean(fromDate),
    Boolean(toDate),
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearchKeyword("");
    setRoleFilter("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  // Define Table Columns
  const columns: Column<SampleMember>[] = useMemo(
    () => [
      {
        key: "stt",
        header: "STT",
        width: "w-14",
        align: "center",
        nowrap: true,
        render: (_val, _row, index) => (
          <span className="text-xs font-mono text-[#8A8F98]">
            {page * size + index + 1}
          </span>
        ),
      },
      {
        key: "fullName",
        header: "Họ và tên",
        sortable: true,
        render: (_val, row) => (
          <div>
            <div className="font-medium text-[#EDEDEF] group-hover:text-[#4d8ee8] transition-colors">
              {row.fullName}
            </div>
            <div className="text-xs text-[#8A8F98] font-mono mt-0.5">
              @{row.username}
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        sortable: true,
        render: (email) => <span className="text-xs text-[#8A8F98]">{email}</span>,
      },
      {
        key: "department",
        header: "Ban trực thuộc",
        render: (dept) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#255798]/15 text-[#4d8ee8] border border-[#255798]/30">
            {dept}
          </span>
        ),
      },
      {
        key: "role",
        header: "Vai trò",
        sortable: true,
        render: (role) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-white/[0.04] text-[#EDEDEF] border border-white/10">
            {role}
          </span>
        ),
      },
      {
        key: "isActive",
        header: "Trạng thái",
        sortable: true,
        render: (isActive) =>
          isActive ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              Đã khóa
            </span>
          ),
      },
      {
        key: "actions",
        header: "Thao tác",
        align: "right",
        width: "w-28",
        render: (_val, row) => (
          <TableActionGroup>
            <ViewButton
              tooltip="Xem chi tiết"
              onClick={() => alert(`Xem chi tiết: ${row.fullName}`)}
            />
            <EditButton
              tooltip="Chỉnh sửa"
              onClick={() => alert(`Chỉnh sửa: ${row.fullName}`)}
            />
            <DeleteButton
              tooltip="Xóa"
              onClick={() => {
                if (confirm(`Xóa người dùng ${row.fullName}?`)) {
                  setData((prev) => prev.filter((item) => item.id !== row.id));
                  setToast({ type: "success", message: `Đã xóa ${row.fullName}` });
                }
              }}
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
      maxWidthClass="max-w-[1720px]"
    >
      {/* 1. Page Header */}
      <PageHeader
        badge="Hệ thống quản trị"
        title="Quản lý thành viên mẫu"
        description="Giao diện danh sách chuẩn hóa Linear UI Kit với tìm kiếm, phân trang và thao tác hàng loạt."
        stats={[
          { label: "Tổng số", value: data.length, icon: Users },
          {
            label: "Đang hoạt động",
            value: data.filter((d) => d.isActive).length,
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <HeaderSecondaryButton
              icon={Download}
              onClick={() => alert("Xuất file Excel...")}
            >
              Xuất Excel
            </HeaderSecondaryButton>

            <HeaderSecondaryButton
              isLoading={isLoading}
              onClick={handleRefresh}
            >
              Làm mới
            </HeaderSecondaryButton>

            <HeaderPrimaryButton
              icon={Plus}
              onClick={() => alert("Mở modal tạo mới...")}
            >
              Tạo mới
            </HeaderPrimaryButton>
          </div>
        }
      />

      {/* 2. Filter Bar */}
      <FilterBar
        activeFilterCount={activeFilterCount}
        onClearFilters={handleClearFilters}
        advancedFilters={
          <>
            <FilterDateInput
              label="Từ ngày tham gia"
              value={fromDate}
              onChange={setFromDate}
            />
            <FilterDateInput
              label="Đến ngày"
              value={toDate}
              onChange={setToDate}
            />
          </>
        }
      >
        <FilterSearchInput
          value={searchKeyword}
          onChange={setSearchKeyword}
          placeholder="Tìm theo họ tên, username, email..."
          className="flex-1 min-w-[240px]"
        />

        <FilterSelect
          options={ROLE_OPTIONS}
          value={roleFilter}
          onChange={setRoleFilter}
          placeholder="Tất cả vai trò"
        />

        <FilterSelect
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Tất cả trạng thái"
        />
      </FilterBar>

      {/* 3. Bulk Action Bar (when rows are selected) */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        unitName="thành viên"
        onClearSelection={() => setSelectedIds(new Set())}
      >
        <button
          type="button"
          onClick={() => {
            alert(`Khóa tài khoản ${selectedIds.size} người dùng`);
            setSelectedIds(new Set());
          }}
          className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Khóa tài khoản</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm(`Xác nhận xóa ${selectedIds.size} tài khoản?`)) {
              setData((prev) => prev.filter((item) => !selectedIds.has(item.id)));
              setSelectedIds(new Set());
              setToast({ type: "success", message: "Đã xóa các mục đã chọn." });
            }
          }}
          className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa đã chọn</span>
        </button>
      </BulkActionBar>

      {/* 4. Data Table */}
      <DataTable<SampleMember>
        data={data}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Đang tải danh sách thành viên..."
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(row) => alert(`Click dòng: ${row.fullName}`)}
        selection={{
          selectedIds,
          onToggleSelect: handleToggleSelect,
          onToggleSelectAll: handleToggleSelectAll,
          isAllSelected: data.length > 0 && selectedIds.size === data.length,
          isPartiallySelected:
            selectedIds.size > 0 && selectedIds.size < data.length,
        }}
        emptyTitle="Chưa có thành viên nào"
        emptyDescription="Danh sách đang trống. Hãy bấm 'Tạo mới' để bắt đầu thêm thành viên."
      />

      {/* 5. Pagination */}
      <TablePagination
        page={page}
        size={size}
        totalElements={data.length}
        totalPages={Math.ceil(data.length / size) || 1}
        onPageChange={setPage}
        onSizeChange={(newSize) => {
          setSize(newSize);
          setPage(0);
        }}
        unitName="thành viên"
      />
    </AdminListLayout>
  );
}
