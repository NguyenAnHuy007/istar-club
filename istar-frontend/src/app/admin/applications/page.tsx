"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ApplicationFormDto,
  AdminApplicationSearchCriteria,
  ApplicationStatus,
  APPLICATION_STATUS_CONFIG,
  DEPARTMENT_CONFIG,
} from "@/types/application";
import { Department, Area } from "@/types/user";
import adminApplicationService from "@/services/adminApplicationService";
import adminRecruitmentService from "@/services/adminRecruitmentService";
import commonCodeService from "@/services/commonCodeService";
import ApplicationDetailModal from "@/components/admin/applications/ApplicationDetailModal";
import {
  AdminListLayout,
  PageHeader,
  HeaderSecondaryButton,
  FilterBar,
  FilterSearchInput,
  FilterSelect,
  FilterDatePicker,
  DataTable,
  Column,
  TablePagination,
  TableActionGroup,
  ApproveButton,
  RejectButton,
  DeleteButton,
  ActionButton,
  AdminToast,
  FilterOption,
} from "@/components/admin/common";
import { Facebook } from "@/components/common/Icons";
import {
  Download,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  Clock,
  UserPlus,
  Calendar,
} from "lucide-react";
import { isAxiosError } from "axios";
import Image from "next/image";

export default function ApplicationsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") as ApplicationStatus | null;

  const [applications, setApplications] = useState<ApplicationFormDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [criteria, setCriteria] = useState<AdminApplicationSearchCriteria>({
    page: 0,
    size: 20,
    sortBy: "createdAt",
    sortDirection: "DESC",
    status: initialStatus || undefined,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Detail modal
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationFormDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<AdminToast | null>(null);

  // Filter state
  const [keyword, setKeyword] = useState(criteria.keyword || "");
  const [recruitmentOptions, setRecruitmentOptions] = useState<FilterOption[]>([
    { value: "", label: "Tất cả đợt tuyển" },
  ]);
  const [coursesList, setCoursesList] = useState<string[]>([
    "K21", "K20", "K19", "K18", "K17", "K16", "K15", "K14", "K13", "K12",
  ]);

  // Load all available courses from common codes
  useEffect(() => {
    let isMounted = true;
    commonCodeService
      .getAllCourses()
      .then((codes) => {
        if (isMounted && codes && codes.length > 0) {
          setCoursesList(codes.map((c) => c.code));
        }
      })
      .catch((err) => console.error("Lỗi khi tải danh sách khóa học:", err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Load recruitment options
  useEffect(() => {
    let isMounted = true;
    adminRecruitmentService
      .getAllRecruitments(0, 100)
      .then((res) => {
        if (isMounted && res?.content) {
          const opts: FilterOption[] = [
            { value: "", label: "Tất cả đợt tuyển" },
            ...res.content.map((r) => ({
              value: String(r.id),
              label: `${r.name}${r.isActive ? " (Đang mở)" : ""}`,
            })),
          ];
          setRecruitmentOptions(opts);
        }
      })
      .catch(console.error);
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounce keyword search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (keyword !== (criteria.keyword || "")) {
        setCriteria((prev) => ({
          ...prev,
          keyword: keyword.trim() || undefined,
          page: 0,
        }));
      }
    }, 450);
    return () => clearTimeout(handler);
  }, [keyword, criteria.keyword]);

  // Fetch applications
  useEffect(() => {
    let ignore = false;
    setIsLoading(true);

    adminApplicationService
      .searchApplications(criteria)
      .then((response) => {
        if (!ignore) {
          setApplications(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Lỗi khi tải danh sách đơn ứng tuyển:", error);
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
    setCriteria((prev) => ({ ...prev, page: newPage }));
  };

  const handleSizeChange = (newSize: number) => {
    setCriteria((prev) => ({ ...prev, size: newSize, page: 0 }));
  };

  const handleSelectChange = <K extends keyof AdminApplicationSearchCriteria>(
    field: K,
    value: string
  ) => {
    let parsedValue: unknown;
    if (value === "") {
      parsedValue = undefined;
    } else if (field === "recruitmentId") {
      parsedValue = Number(value);
    } else {
      parsedValue = value;
    }
    setCriteria((prev) => ({
      ...prev,
      [field]: parsedValue as AdminApplicationSearchCriteria[K],
      page: 0,
    }));
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await adminApplicationService.exportExcel(criteria);
      setToast({ type: "success", message: "Xuất danh sách Excel thành công!" });
    } catch (error: unknown) {
      console.error("Lỗi khi xuất excel:", error);
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setToast({
        type: "error",
        message: "Xuất Excel thất bại: " + (msg || "Đã có lỗi xảy ra"),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Xác nhận DUYỆT ĐƠN cho ứng viên này?")) return;
    try {
      await adminApplicationService.approveApplication(id);
      handleRefresh();
      setToast({ type: "success", message: "Duyệt đơn ứng tuyển thành công!" });
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setToast({ type: "error", message: "Lỗi duyệt đơn: " + (msg || "Đã có lỗi xảy ra") });
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Xác nhận TỪ CHỐI đơn ứng tuyển này?")) return;
    try {
      await adminApplicationService.rejectApplication(id);
      handleRefresh();
      setToast({ type: "success", message: "Đã từ chối đơn ứng tuyển." });
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setToast({ type: "error", message: "Lỗi từ chối đơn: " + (msg || "Đã có lỗi xảy ra") });
    }
  };

  const handleCreateAccount = async (id: number) => {
    if (!confirm("Xác nhận TẠO TÀI KHOẢN thành viên từ đơn ứng tuyển này?"))
      return;
    try {
      await adminApplicationService.createAccount(id);
      handleRefresh();
      setToast({ type: "success", message: "Tạo tài khoản thành viên thành công!" });
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setToast({ type: "error", message: "Lỗi tạo tài khoản: " + (msg || "Đã có lỗi xảy ra") });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xác nhận XÓA MỀM đơn ứng tuyển này?")) return;
    try {
      await adminApplicationService.deleteApplication(id);
      handleRefresh();
      setToast({ type: "success", message: "Xóa mềm đơn ứng tuyển thành công!" });
    } catch (error: unknown) {
      const msg = isAxiosError(error) ? error.response?.data?.message : null;
      setToast({ type: "error", message: "Lỗi xóa đơn: " + (msg || "Đã có lỗi xảy ra") });
    }
  };

  const handleClearFilters = () => {
    setKeyword("");
    setCriteria((prev) => ({
      page: 0,
      size: prev.size,
      sortBy: prev.sortBy,
      sortDirection: prev.sortDirection,
    }));
  };

  const activeFilterCount = [
    Boolean(keyword),
    Boolean(criteria.recruitmentId),
    Boolean(criteria.department),
    Boolean(criteria.area),
    Boolean(criteria.course),
    Boolean(criteria.status),
    Boolean(criteria.createdFrom),
    Boolean(criteria.createdTo),
  ].filter(Boolean).length;

  const courseOptions: FilterOption[] = useMemo(() => {
    const set = new Set<string>();
    coursesList.forEach((c) => c && set.add(c.trim()));
    applications.forEach((app) => {
      if (app.course && app.course.trim()) {
        set.add(app.course.trim());
      }
    });

    const sorted = Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
      return a.localeCompare(b);
    });

    return [
      { value: "", label: "Tất cả khóa" },
      ...sorted.map((c) => ({
        value: c,
        label: c.startsWith("K") || c.startsWith("k") ? c.toUpperCase() : `K${c}`,
      })),
    ];
  }, [coursesList, applications]);

  const AREA_OPTIONS: FilterOption[] = [
    { value: "", label: "Tất cả cơ sở" },
    { value: Area.NINH_BINH, label: "Ninh Bình" },
    { value: Area.HANOI, label: "Hà Nội" },
  ];

  // Status options
  const STATUS_OPTIONS: FilterOption[] = [
    { value: "", label: "Tất cả trạng thái" },
    ...Object.values(ApplicationStatus).map((status) => ({
      value: status,
      label: APPLICATION_STATUS_CONFIG[status].label,
    })),
  ];

  const DEPARTMENT_OPTIONS: FilterOption[] = [
    { value: "", label: "Tất cả các ban" },
    { value: Department.MUSIC, label: DEPARTMENT_CONFIG[Department.MUSIC].name },
    { value: Department.RAP, label: DEPARTMENT_CONFIG[Department.RAP].name },
    {
      value: Department.MEDIA_AND_EVENT,
      label: DEPARTMENT_CONFIG[Department.MEDIA_AND_EVENT].name,
    },
    { value: Department.DANCE, label: DEPARTMENT_CONFIG[Department.DANCE].name },
  ];

  // Define columns
  const columns: Column<ApplicationFormDto>[] = useMemo(
    () => [
      {
        key: "stt",
        header: "STT",
        width: "w-12",
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
        header: "Ứng viên",
        sortable: true,
        sortKey: "firstName",
        render: (_val, row) => {
          const fullName =
            `${row.lastName || ""} ${row.firstName || ""}`.trim() ||
            "Chưa có tên";
          return (
            <div className="flex items-center gap-3">
              {row.avatarUrl ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <Image
                    src={row.avatarUrl}
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
                <div className="font-medium text-[#EDEDEF] group-hover:text-[#4d8ee8] transition-colors truncate max-w-[180px]">
                  {fullName}
                </div>
                <div className="text-xs text-[#8A8F98] truncate max-w-[180px]">
                  {[row.course, row.majorClass].filter(Boolean).join(" • ") ||
                    row.school ||
                    "Chưa có thông tin lớp"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "email",
        header: "Email & SĐT",
        sortable: true,
        render: (_val, row) => (
          <div>
            <div className="text-xs text-[#EDEDEF] truncate max-w-[180px]">
              {row.email}
            </div>
            <div className="text-xs text-[#8A8F98] font-mono">
              {row.phoneNumber || "—"}
            </div>
            {row.facebookUrl && (
              <a
                href={
                  row.facebookUrl.startsWith("http")
                    ? row.facebookUrl
                    : `https://${row.facebookUrl}`
                }
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
          </div>
        ),
      },
      {
        key: "departments",
        header: "Nguyện vọng Ban",
        render: (_val, row) => (
          <div className="flex flex-wrap gap-1.5">
            {row.applicationDepartments &&
            row.applicationDepartments.length > 0 ? (
              row.applicationDepartments.map((dept) => {
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
        ),
      },
      {
        key: "status",
        header: "Trạng thái",
        sortable: true,
        nowrap: true,
        render: (_val, row) => {
          const statusCfg = APPLICATION_STATUS_CONFIG[row.status] || {
            label: row.status,
            badgeBg: "bg-white/10",
            badgeBorder: "border-white/20",
            textColor: "text-white",
            dotColor: "bg-white",
          };
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.badgeBg} ${statusCfg.badgeBorder} ${statusCfg.textColor}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor} animate-pulse`}
              />
              {statusCfg.label}
            </span>
          );
        },
      },
      {
        key: "recruitmentName",
        header: "Đợt tuyển",
        nowrap: true,
        render: (_val, row) => (
          <span className="text-xs text-[#8A8F98]">
            {row.recruitmentName ? (
              <span
                className="truncate max-w-[160px] block"
                title={row.recruitmentName}
              >
                {row.recruitmentName}
              </span>
            ) : (
              "—"
            )}
          </span>
        ),
      },
      {
        key: "area",
        header: "Cơ sở",
        nowrap: true,
        render: (_val, row) => {
          const isHanoi = row.area === Area.HANOI;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
                isHanoi
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
              }`}
            >
              {isHanoi ? "Hà Nội" : "Ninh Bình"}
            </span>
          );
        },
      },
      {
        key: "createdAt",
        header: "Ngày nộp",
        sortable: true,
        nowrap: true,
        render: (_val, row) =>
          row.createdAt ? (
            <span className="flex items-center gap-1 text-xs text-[#8A8F98] font-mono">
              <Calendar className="w-3 h-3 text-[#4d8ee8]" />
              {new Date(row.createdAt).toLocaleDateString("vi-VN")}
            </span>
          ) : (
            <span className="text-xs text-[#8A8F98]">—</span>
          ),
      },
      {
        key: "actions",
        header: "Thao tác",
        align: "right",
        width: "w-28",
        render: (_val, row) => (
          <TableActionGroup>
            {row.status !== ApplicationStatus.APPROVED &&
              row.status !== ApplicationStatus.REJECTED && (
                <ApproveButton
                  tooltip="Duyệt đơn"
                  onClick={() => handleApprove(row.id)}
                />
              )}

            {row.status !== ApplicationStatus.REJECTED && (
              <RejectButton
                tooltip="Từ chối đơn"
                onClick={() => handleReject(row.id)}
              />
            )}

            {row.status === ApplicationStatus.APPROVED && (
              <ActionButton
                icon={UserPlus}
                variant="primary"
                tooltip="Tạo tài khoản thành viên"
                onClick={() => handleCreateAccount(row.id)}
              />
            )}

            <DeleteButton
              tooltip="Xóa đơn ứng tuyển"
              onClick={() => handleDelete(row.id)}
            />
          </TableActionGroup>
        ),
      },
    ],
    [criteria.page, criteria.size]
  );

  return (
    <AdminListLayout
      toast={toast}
      onDismissToast={() => setToast(null)}
      maxWidthClass="max-w-[1720px]"
    >
      {/* Page Header */}
      <PageHeader
        badge="Tuyển thành viên & Phỏng vấn"
        title="Danh sách đơn ứng tuyển"
        description="Theo dõi, đánh giá hồ sơ và xét duyệt thành viên gia nhập CLB iStar."
        actions={
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
            <HeaderSecondaryButton
              icon={RefreshCw}
              isLoading={isLoading}
              onClick={handleRefresh}
            >
              Làm mới
            </HeaderSecondaryButton>

            <HeaderSecondaryButton
              icon={Download}
              isLoading={isExporting}
              onClick={handleExportExcel}
            >
              {isExporting ? "Đang xuất..." : "Xuất file Excel"}
            </HeaderSecondaryButton>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#255798]/15 border border-[#255798]/30 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-[#4d8ee8]" />
          </div>
          <div>
            <div className="text-xs text-[#8A8F98]">Tổng số hồ sơ</div>
            <div className="text-xl font-bold text-white font-mono">
              {totalElements}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-[#8A8F98]">Trang hiện tại</div>
            <div className="text-xl font-bold text-white font-mono">
              {totalPages > 0 ? (criteria.page || 0) + 1 : 0} / {totalPages}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-[#8A8F98]">Hồ sơ hiển thị</div>
            <div className="text-xl font-bold text-white font-mono">
              {applications.length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar with default date filters and unified search keyword */}
      <FilterBar
        activeFilterCount={activeFilterCount}
        onClearFilters={handleClearFilters}
      >
        <FilterSearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Tìm theo họ tên, email, SĐT ứng viên..."
          className="flex-1 min-w-[240px]"
        />
        <FilterDatePicker
          value={criteria.createdFrom || ""}
          onChange={(val) => handleSelectChange("createdFrom", val)}
          placeholder="Nộp từ ngày..."
          className="w-full sm:w-[155px]"
        />
        <FilterDatePicker
          value={criteria.createdTo || ""}
          onChange={(val) => handleSelectChange("createdTo", val)}
          placeholder="Đến ngày..."
          className="w-full sm:w-[155px]"
        />
        <FilterSelect
          options={recruitmentOptions}
          value={criteria.recruitmentId ? String(criteria.recruitmentId) : ""}
          onChange={(val) => handleSelectChange("recruitmentId", val)}
          placeholder="Tất cả đợt tuyển"
          className="w-full sm:w-[185px]"
        />
        <FilterSelect
          options={AREA_OPTIONS}
          value={criteria.area || ""}
          onChange={(val) => handleSelectChange("area", val)}
          placeholder="Tất cả cơ sở"
          className="w-full sm:w-[155px]"
        />
        <FilterSelect
          options={courseOptions}
          value={criteria.course || ""}
          onChange={(val) => handleSelectChange("course", val)}
          placeholder="Tất cả khóa"
          className="w-full sm:w-[130px]"
        />
        <FilterSelect
          options={DEPARTMENT_OPTIONS}
          value={criteria.department || ""}
          onChange={(val) => handleSelectChange("department", val)}
          placeholder="Tất cả các ban"
          className="w-full sm:w-[160px]"
        />
        <FilterSelect
          options={STATUS_OPTIONS}
          value={criteria.status || ""}
          onChange={(val) => handleSelectChange("status", val)}
          placeholder="Tất cả trạng thái"
          className="w-full sm:w-[170px]"
        />
      </FilterBar>

      {/* Data Table */}
      <DataTable<ApplicationFormDto>
        data={applications}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Đang tải danh sách đơn ứng tuyển..."
        sortBy={criteria.sortBy}
        sortDirection={criteria.sortDirection}
        onSort={handleSort}
        onRowClick={(row) => {
          setSelectedApplication(row);
          setIsDetailOpen(true);
        }}
        emptyTitle="Không tìm thấy đơn ứng tuyển nào"
        emptyDescription="Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm lại."
        emptyIcon={<ClipboardList className="w-6 h-6 text-[#4d8ee8]" />}
        minWidth="min-w-[960px]"
      />

      {/* Pagination */}
      <TablePagination
        page={criteria.page || 0}
        size={criteria.size || 20}
        totalElements={totalElements}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        unitName="ứng viên"
        sizeOptions={[10, 20, 30, 50, 100]}
      />

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={isDetailOpen}
        application={selectedApplication}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedApplication(null);
        }}
        onRefresh={handleRefresh}
      />
    </AdminListLayout>
  );
}
