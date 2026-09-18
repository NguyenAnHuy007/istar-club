"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  UserX,
  Mic,
  UserCheck,
  XCircle,
  Check,
  BarChart3,
  ListFilter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserPlus,
  MapPin,
} from "lucide-react";
import { Facebook } from "@/components/common/Icons";
import adminApplicationService from "@/services/adminApplicationService";
import adminRecruitmentService from "@/services/adminRecruitmentService";
import { adminUserService } from "@/services/adminUserService";
import commonCodeService from "@/services/commonCodeService";
import interviewService from "@/services/interviewService";
import {
  ApplicationFormDto,
  ApplicationStatus,
  APPLICATION_STATUS_CONFIG,
  DEPARTMENT_CONFIG,
  AdminApplicationSearchCriteria,
} from "@/types/application";
import { Department, Area } from "@/types/user";
import { RecruitmentDto } from "@/types/recruitment";
import { StatusBreakdownItem, DepartmentStatItem } from "@/types/dashboard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { HAUI_SCHOOLS } from "@/constants/schools";
import { DEPARTMENTS_LIST } from "@/constants/departments";
import { formatSchoolName } from "@/utils/format";
import { getStoredArea, setStoredArea } from "@/utils/area";
import { subscribeToBroadcast } from "@/utils/broadcast";
import CheckInModal from "./CheckInModal";
import ClaimInterviewModal from "./ClaimInterviewModal";
import AreaSelectModal from "./AreaSelectModal";
import InterviewStatsTab from "./InterviewStatsTab";
import InterviewExcelActions from "./InterviewExcelActions";
import {
  PageHeader,
  HeaderPrimaryButton,
  HeaderSecondaryButton,
  FilterBar,
  FilterSearchInput,
  FilterSelect,
  FilterOption,
  BulkActionBar,
  DataTable,
  Column,
  TablePagination,
  TableActionGroup,
  ApproveButton,
  RejectButton,
} from "@/components/admin/common";

export default function InterviewPageContent() {
  const { user, isAdmin, isReceptionist, isInterviewer } = useAuth();
  const toast = useToast();

  // Active Recruitment
  const [activeRecruitment, setActiveRecruitment] = useState<RecruitmentDto | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"LIST" | "STATS">("LIST");

  // Applications & Pagination
  const [applications, setApplications] = useState<ApplicationFormDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Multi-selection (Checkbox)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [schoolFilter, setSchoolFilter] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [scoreSort, setScoreSort] = useState<"NONE" | "DESC" | "ASC">("NONE");

  // Courses list (dynamically fetched from common codes)
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

  // All applications in active campaign for overall statistics & charts
  const [allActiveApplications, setAllActiveApplications] = useState<ApplicationFormDto[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Modals
  const [checkInApp, setCheckInApp] = useState<ApplicationFormDto | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [claimApp, setClaimApp] = useState<ApplicationFormDto | null>(null);
  const [isClaimOpen, setIsClaimOpen] = useState(false);

  // Area Selection State (Persisted in sessionStorage)
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);

  // Request ID refs to prevent race conditions from concurrent/stale responses
  const statsReqIdRef = useRef(0);
  const appReqIdRef = useRef(0);

  useEffect(() => {
    const saved = getStoredArea();
    if (saved) {
      setSelectedArea(saved);
    } else {
      // If not selected yet, prompt user with modal
      setIsAreaModalOpen(true);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedKeyword) {
        setDebouncedKeyword(searchTerm);
        setPage(0);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedKeyword]);

  // Fetch active recruitment
  const loadActiveRecruitment = useCallback(async () => {
    try {
      const active = await adminRecruitmentService.getActiveRecruitment();
      setActiveRecruitment(active);
    } catch (err) {
      console.error("Lỗi khi tải đợt tuyển active:", err);
    }
  }, []);

  // Fetch available courses
  useEffect(() => {
    adminUserService
      .getCourses()
      .then((courses) => {
        if (courses && courses.length > 0) {
          setCoursesList(courses);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadActiveRecruitment();
  }, [loadActiveRecruitment]);

  // Fetch all applications in active campaign for accurate statistics
  const fetchStatsApplications = useCallback(async (overrideArea?: Area) => {
    const targetArea = overrideArea !== undefined ? overrideArea : selectedArea;
    if (!targetArea) return; // Prevent loading before area is chosen (avoids mixed Hanoi + Ninh Binh data)

    const currentReqId = ++statsReqIdRef.current;
    try {
      setStatsLoading(true);
      const res = await adminApplicationService.searchApplications({
        activeRecruitmentOnly: true,
        size: 1000,
        area: targetArea,
      });
      if (currentReqId === statsReqIdRef.current) {
        setAllActiveApplications(res?.content || []);
      }
    } catch (err) {
      if (currentReqId === statsReqIdRef.current) {
        console.error("Lỗi khi tải dữ liệu thống kê:", err);
      }
    } finally {
      if (currentReqId === statsReqIdRef.current) {
        setStatsLoading(false);
      }
    }
  }, [selectedArea]);

  useEffect(() => {
    if (selectedArea) {
      fetchStatsApplications();
    }
  }, [fetchStatsApplications, selectedArea]);

  // Fetch paginated applications for table
  const fetchApplications = useCallback(async (overrideArea?: Area) => {
    const targetArea = overrideArea !== undefined ? overrideArea : selectedArea;
    if (!targetArea) return; // Prevent loading before area is chosen (avoids mixed Hanoi + Ninh Binh data)

    const currentReqId = ++appReqIdRef.current;
    setLoading(true);
    try {
      const isInterviewerOnly = isInterviewer && !isAdmin && !isReceptionist;
      const searchCriteria: AdminApplicationSearchCriteria = {
        page,
        size: pageSize,
        keyword: debouncedKeyword.trim() || undefined,
        area: targetArea,
        department: deptFilter !== "" ? (deptFilter as Department) : undefined,
        school: schoolFilter !== "" ? schoolFilter : undefined,
        course: courseFilter !== "" ? courseFilter : undefined,
        activeRecruitmentOnly: true,
      };

      if (!statusFilter) {
        if (isInterviewerOnly) {
          searchCriteria.statuses = [ApplicationStatus.CHECKED_IN, ApplicationStatus.INTERVIEWING];
          searchCriteria.sortBy = "checkedInAt";
          searchCriteria.sortDirection = "ASC";
        }
      } else {
        searchCriteria.status = statusFilter as ApplicationStatus;
      }

      const res = await adminApplicationService.searchApplications(searchCriteria);
      if (currentReqId === appReqIdRef.current) {
        setApplications(res?.content || []);
        setTotalElements(res?.totalElements || 0);
        setTotalPages(res?.totalPages || 0);
      }
    } catch (err) {
      if (currentReqId === appReqIdRef.current) {
        console.error("Lỗi khi tải danh sách ứng viên phỏng vấn:", err);
      }
    } finally {
      if (currentReqId === appReqIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, pageSize, debouncedKeyword, selectedArea, statusFilter, deptFilter, schoolFilter, courseFilter, isInterviewer, isAdmin, isReceptionist]);

  useEffect(() => {
    if (selectedArea) {
      fetchApplications();
    }
  }, [fetchApplications, selectedArea]);

  const handleSelectArea = (area: Area) => {
    setSelectedArea(area);
    setStoredArea(area);
    setIsAreaModalOpen(false);
    setPage(0);
    // Immediate data re-fetch on area change
    fetchApplications(area);
    fetchStatsApplications(area);
  };

  // Subscribe to broadcast messages for auto-refresh
  useEffect(() => {
    return subscribeToBroadcast((event) => {
      if (
        event.type === "INTERVIEW_UPDATED" ||
        event.type === "APPLICATION_CREATED" ||
        event.type === "APPLICATION_UPDATED"
      ) {
        fetchApplications();
        fetchStatsApplications();
      }
    });
  }, [fetchApplications, fetchStatsApplications]);

  const handleOpenClaim = (app: ApplicationFormDto) => {
    setClaimApp(app);
    setIsClaimOpen(true);
  };

  const handleClaimSuccess = (updatedApp: ApplicationFormDto) => {
    setIsClaimOpen(false);
    const popupUrl = `/admin/interview/${updatedApp.id}?popup=true`;
    const w = 960;
    const h = 700;
    const left = Math.round((window.screen.width - w) / 2);
    const top = Math.round((window.screen.height - h) / 2);
    window.open(
      popupUrl,
      `interview_${updatedApp.id}`,
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    fetchApplications();
    fetchStatsApplications();
  };

  // Check-in opens CheckInModal for Admin/Receptionist
  const handleOpenCheckIn = (app: ApplicationFormDto) => {
    setCheckInApp(app);
    setIsCheckInOpen(true);
  };

  // Quick no-show from table
  const handleQuickNoShow = async (appId: number) => {
    if (!confirm("Xác nhận đánh dấu ứng viên VẮNG MẶT?")) return;
    try {
      await interviewService.noShow(appId);
      fetchApplications();
      fetchStatsApplications();
    } catch (err) {
      console.error("Lỗi khi báo vắng:", err);
    }
  };

  // Admin: approve from table
  const handleQuickApprove = async (app: ApplicationFormDto, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const fullName = `${app.lastName || ""} ${app.firstName || ""}`.trim();
    if (!confirm(`Xác nhận DUYỆT ĐƠN cho ứng viên ${fullName}?`)) return;
    try {
      await adminApplicationService.approveApplication(app.id);
      fetchApplications();
      fetchStatsApplications();
    } catch (err) {
      console.error("Lỗi khi duyệt đơn:", err);
    }
  };

  // Admin: reject from table
  const handleQuickReject = async (app: ApplicationFormDto, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const fullName = `${app.lastName || ""} ${app.firstName || ""}`.trim();
    if (!confirm(`Xác nhận TỪ CHỐI đơn ứng viên ${fullName}?`)) return;
    try {
      await adminApplicationService.rejectApplication(app.id);
      fetchApplications();
      fetchStatsApplications();
    } catch (err) {
      console.error("Lỗi khi từ chối đơn:", err);
    }
  };

  const handleOpenDetail = (app: ApplicationFormDto) => {
    const popupUrl = `/admin/interview/${app.id}?popup=true`;
    const w = 960;
    const h = 700;
    const left = Math.round((window.screen.width - w) / 2);
    const top = Math.round((window.screen.height - h) / 2);
    window.open(
      popupUrl,
      `interview_${app.id}`,
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  // Filter department options
  const availableDepts = isAdmin || isReceptionist
    ? DEPARTMENTS_LIST
    : DEPARTMENTS_LIST.filter((d) => {
        if (!isInterviewer) return true;
        const userDepts = user?.userDepartments?.map((ud) => ud.department) || [];
        return userDepts.length === 0 || userDepts.includes(d.code);
      });

  // Bulk Selection Handlers
  const pageAppIds = applications.map((a) => a.id);
  const isAllSelected = pageAppIds.length > 0 && pageAppIds.every((id) => selectedIds.has(id));
  const isPartiallySelected = pageAppIds.some((id) => selectedIds.has(id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        pageAppIds.forEach((id) => next.delete(id));
      } else {
        pageAppIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

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

  // Bulk Actions
  const handleBulkNoShow = async () => {
    const eligibleApps = applications.filter(
      (a) =>
        selectedIds.has(a.id) &&
        (a.status === ApplicationStatus.SUBMITTED || a.status === ApplicationStatus.CHECKED_IN)
    );

    if (eligibleApps.length === 0) {
      toast.warning(
        "Không có ứng viên nào hợp lệ để báo vắng mặt. Chức năng này chỉ áp dụng cho ứng viên có trạng thái Đã nộp đơn hoặc Đã điểm danh."
      );
      return;
    }

    const message =
      eligibleApps.length < selectedIds.size
        ? `Chỉ có ${eligibleApps.length} / ${selectedIds.size} ứng viên đủ điều kiện (Đã nộp đơn hoặc Đã điểm danh) để báo vắng mặt. Bạn có muốn tiếp tục báo vắng mặt cho ${eligibleApps.length} ứng viên này?`
        : `Xác nhận đánh dấu VẮNG MẶT cho ${eligibleApps.length} ứng viên đã chọn?`;

    if (!confirm(message)) return;

    setBulkLoading(true);
    try {
      await Promise.allSettled(eligibleApps.map((a) => interviewService.noShow(a.id)));
      setSelectedIds(new Set());
      toast.success(`Đã đánh dấu vắng mặt cho ${eligibleApps.length} ứng viên.`);
      await fetchApplications();
      await fetchStatsApplications();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (!isAdmin) return;
    const eligibleApps = applications.filter(
      (a) => selectedIds.has(a.id) && a.status === ApplicationStatus.INTERVIEWED
    );

    if (eligibleApps.length === 0) {
      toast.warning(
        "Không có ứng viên nào hợp lệ để duyệt đơn. Chức năng này chỉ áp dụng cho ứng viên đã hoàn tất phỏng vấn tất cả các ban (Trạng thái: Đã phỏng vấn)."
      );
      return;
    }

    const message =
      eligibleApps.length < selectedIds.size
        ? `Chỉ có ${eligibleApps.length} / ${selectedIds.size} ứng viên đủ điều kiện (Đã phỏng vấn) để duyệt đơn. Bạn có muốn tiếp tục duyệt trúng tuyển cho ${eligibleApps.length} ứng viên này?`
        : `Xác nhận DUYỆT ĐƠN trúng tuyển cho ${eligibleApps.length} ứng viên đã chọn?`;

    if (!confirm(message)) return;

    setBulkLoading(true);
    try {
      await Promise.allSettled(
        eligibleApps.map((a) => adminApplicationService.approveApplication(a.id))
      );
      setSelectedIds(new Set());
      toast.success(`Đã duyệt trúng tuyển cho ${eligibleApps.length} ứng viên.`);
      await fetchApplications();
      await fetchStatsApplications();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (!isAdmin) return;
    const eligibleApps = applications.filter(
      (a) => selectedIds.has(a.id) && a.status === ApplicationStatus.INTERVIEWED
    );

    if (eligibleApps.length === 0) {
      toast.warning(
        "Không có ứng viên nào hợp lệ để từ chối. Chức năng này chỉ áp dụng cho ứng viên có trạng thái Đã phỏng vấn."
      );
      return;
    }

    const message =
      eligibleApps.length < selectedIds.size
        ? `Chỉ có ${eligibleApps.length} / ${selectedIds.size} ứng viên đủ điều kiện (Đã phỏng vấn) để từ chối. Bạn có muốn tiếp tục từ chối ${eligibleApps.length} ứng viên này?`
        : `Xác nhận TỪ CHỐI ĐƠN cho ${eligibleApps.length} ứng viên đã chọn?`;

    if (!confirm(message)) return;

    setBulkLoading(true);
    try {
      await Promise.allSettled(
        eligibleApps.map((a) => adminApplicationService.rejectApplication(a.id))
      );
      setSelectedIds(new Set());
      toast.success(`Đã từ chối ${eligibleApps.length} đơn ứng tuyển.`);
      await fetchApplications();
      await fetchStatsApplications();
    } finally {
      setBulkLoading(false);
    }
  };

  // Score Sorting Algorithm
  const getCandidateReferenceScore = (
    app: ApplicationFormDto,
    direction: "ASC" | "DESC"
  ): number => {
    if (deptFilter !== "") {
      const dept = app.applicationDepartments?.find((d) => d.department === deptFilter);
      if (dept && dept.interviewScore !== null && dept.interviewScore !== undefined) {
        return dept.interviewScore;
      }
      return direction === "DESC" ? -1 : 999;
    }

    const scores = (app.applicationDepartments || [])
      .map((d) => d.interviewScore)
      .filter((s): s is number => s !== null && s !== undefined);

    if (scores.length === 0) {
      return direction === "DESC" ? -1 : 999;
    }

    return direction === "DESC" ? Math.max(...scores) : Math.min(...scores);
  };

  const displayedApplications = useMemo(() => {
    if (scoreSort === "NONE") return applications;
    return [...applications].sort((a, b) => {
      const scoreA = getCandidateReferenceScore(a, scoreSort);
      const scoreB = getCandidateReferenceScore(b, scoreSort);
      return scoreSort === "DESC" ? scoreB - scoreA : scoreA - scoreB;
    });
  }, [applications, scoreSort, deptFilter]);

  const handleToggleScoreSort = () => {
    setScoreSort((prev) => {
      if (prev === "NONE") return "DESC";
      if (prev === "DESC") return "ASC";
      return "NONE";
    });
  };

  // Statistics Data Computation
  const statsData = useMemo(() => {
    const isInterviewerOnly = isInterviewer && !isAdmin && !isReceptionist;
    const userDepts = user?.userDepartments?.map((ud) => ud.department) || [];

    const relevantApps = isInterviewerOnly && userDepts.length > 0
      ? allActiveApplications.filter((app) =>
          app.applicationDepartments?.some((d) => userDepts.includes(d.department))
        )
      : allActiveApplications;

    const total = relevantApps.length;
    const checkedIn = relevantApps.filter((a) => a.status === ApplicationStatus.CHECKED_IN).length;
    const interviewing = relevantApps.filter((a) => a.status === ApplicationStatus.INTERVIEWING).length;
    const interviewed = relevantApps.filter((a) => a.status === ApplicationStatus.INTERVIEWED).length;
    const approved = relevantApps.filter((a) => a.status === ApplicationStatus.APPROVED).length;
    const rejected = relevantApps.filter((a) => a.status === ApplicationStatus.REJECTED).length;
    const noShow = relevantApps.filter((a) => a.status === ApplicationStatus.NO_SHOW).length;
    const submitted = relevantApps.filter((a) => a.status === ApplicationStatus.SUBMITTED).length;

    // Score spectrum
    const scoredApps = relevantApps.filter((a) =>
      a.applicationDepartments?.some((d) => d.interviewScore !== null && d.interviewScore !== undefined)
    );

    let excellent = 0; // >= 8.5
    let good = 0; // 7.0 - 8.4
    let average = 0; // 5.0 - 6.9
    let belowAverage = 0; // < 5.0

    scoredApps.forEach((app) => {
      const scores = (app.applicationDepartments || [])
        .filter((d) => !isInterviewerOnly || userDepts.length === 0 || userDepts.includes(d.department))
        .map((d) => d.interviewScore)
        .filter((s): s is number => s !== null && s !== undefined);
      if (scores.length > 0) {
        const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
        if (avg >= 8.5) excellent++;
        else if (avg >= 7.0) good++;
        else if (avg >= 5.0) average++;
        else belowAverage++;
      }
    });

    const unScored = total - scoredApps.length;

    // Department breakdown
    const deptStats = DEPARTMENTS_LIST.filter((d) => {
      if (!isInterviewerOnly || userDepts.length === 0) return true;
      return userDepts.includes(d.code);
    }).map((d) => {
      const deptApps = allActiveApplications.filter((app) =>
        app.applicationDepartments?.some((ad) => ad.department === d.code)
      );
      const interviewedInDept = deptApps.filter((app) =>
        app.applicationDepartments?.some((ad) => ad.department === d.code && ad.status === ApplicationStatus.INTERVIEWED)
      );
      const deptScores = deptApps
        .map((app) => app.applicationDepartments?.find((ad) => ad.department === d.code)?.interviewScore)
        .filter((s): s is number => s !== null && s !== undefined);
      const avgScore = deptScores.length > 0
        ? (deptScores.reduce((sum, val) => sum + val, 0) / deptScores.length).toFixed(1)
        : "—";

      return {
        department: d.code,
        name: d.name,
        total: deptApps.length,
        interviewed: interviewedInDept.length,
        avgScore,
      };
    });

    // School breakdown (Top schools)
    const schoolCounts: Record<string, number> = {};
    relevantApps.forEach((app) => {
      const s = formatSchoolName(app.school);
      schoolCounts[s] = (schoolCounts[s] || 0) + 1;
    });
    const sortedSchools = Object.entries(schoolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const statusBreakdown: StatusBreakdownItem[] = [
      {
        status: ApplicationStatus.SUBMITTED,
        label: "Đã nộp đơn",
        count: submitted,
        percentage: total > 0 ? Math.round((submitted / total) * 100) : 0,
        color: "#3b82f6",
      },
      {
        status: ApplicationStatus.CHECKED_IN,
        label: "Chờ phỏng vấn",
        count: checkedIn,
        percentage: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
        color: "#f59e0b",
      },
      {
        status: ApplicationStatus.INTERVIEWING,
        label: "Đang phỏng vấn",
        count: interviewing,
        percentage: total > 0 ? Math.round((interviewing / total) * 100) : 0,
        color: "#a855f7",
      },
      {
        status: ApplicationStatus.INTERVIEWED,
        label: "Đã phỏng vấn",
        count: interviewed,
        percentage: total > 0 ? Math.round((interviewed / total) * 100) : 0,
        color: "#06b6d4",
      },
      {
        status: ApplicationStatus.APPROVED,
        label: "Trúng tuyển",
        count: approved,
        percentage: total > 0 ? Math.round((approved / total) * 100) : 0,
        color: "#10b981",
      },
      {
        status: ApplicationStatus.REJECTED,
        label: "Từ chối",
        count: rejected,
        percentage: total > 0 ? Math.round((rejected / total) * 100) : 0,
        color: "#f43f5e",
      },
      {
        status: ApplicationStatus.NO_SHOW,
        label: "Vắng mặt",
        count: noShow,
        percentage: total > 0 ? Math.round((noShow / total) * 100) : 0,
        color: "#71717a",
      },
    ];

    const deptChartData: DepartmentStatItem[] = deptStats.map((d) => {
      const approvedInDept = allActiveApplications.filter((app) =>
        app.applicationDepartments?.some(
          (ad) => ad.department === d.department && ad.status === ApplicationStatus.APPROVED
        )
      ).length;
      const rejectedInDept = allActiveApplications.filter((app) =>
        app.applicationDepartments?.some(
          (ad) => ad.department === d.department && ad.status === ApplicationStatus.REJECTED
        )
      ).length;
      return {
        department: d.department,
        name: d.name,
        total: d.total,
        interviewed: d.interviewed,
        approved: approvedInDept,
        rejected: rejectedInDept,
        avgScore: d.avgScore,
        percentage: total > 0 ? Math.round((d.total / total) * 100) : 0,
      };
    });

    return {
      total,
      checkedIn,
      interviewing,
      interviewed,
      approved,
      rejected,
      noShow,
      submitted,
      excellent,
      good,
      average,
      belowAverage,
      unScored,
      deptStats,
      sortedSchools,
      statusBreakdown,
      deptChartData,
    };
  }, [allActiveApplications, isInterviewer, isAdmin, isReceptionist, user]);

  // Dropdown Options
  const statusOptions: FilterOption[] = useMemo(() => {
    if (isInterviewer && !isAdmin && !isReceptionist) {
      return [
        { value: "", label: "Phù hợp (Chờ & Đang PV)" },
        { value: ApplicationStatus.CHECKED_IN, label: "Đã điểm danh (Chờ PV)" },
        { value: ApplicationStatus.INTERVIEWING, label: "Đang phỏng vấn" },
        { value: ApplicationStatus.INTERVIEWED, label: "Đã phỏng vấn" },
      ];
    }
    return [
      { value: "", label: "Tất cả trạng thái" },
      { value: ApplicationStatus.SUBMITTED, label: "Đã nộp đơn" },
      { value: ApplicationStatus.CHECKED_IN, label: "Đã điểm danh (Chờ PV)" },
      { value: ApplicationStatus.INTERVIEWING, label: "Đang phỏng vấn" },
      { value: ApplicationStatus.INTERVIEWED, label: "Đã phỏng vấn" },
      { value: ApplicationStatus.APPROVED, label: "Trúng tuyển" },
      { value: ApplicationStatus.REJECTED, label: "Từ chối" },
      { value: ApplicationStatus.NO_SHOW, label: "Vắng mặt" },
    ];
  }, [isInterviewer, isAdmin, isReceptionist]);

  const departmentOptions: FilterOption[] = useMemo(() => [
    { value: "", label: "Tất cả các ban" },
    ...availableDepts.map((d) => ({ value: d.code, label: d.name })),
  ], [availableDepts]);

  const schoolOptions: FilterOption[] = useMemo(() => [
    { value: "", label: "Tất cả trường/khoa" },
    ...HAUI_SCHOOLS.map((s) => ({ value: s, label: s })),
  ], []);

  const courseOptions: FilterOption[] = useMemo(() => {
    const set = new Set<string>();
    coursesList.forEach((c) => c && set.add(c.trim()));
    allActiveApplications.forEach((app) => {
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
  }, [coursesList, allActiveApplications]);

  // Table Columns
  const columns: Column<ApplicationFormDto>[] = useMemo(
    () => [
      {
        key: "candidate",
        header: "Ứng viên",
        render: (_val, app) => {
          const fullName =
            `${app.lastName || ""} ${app.firstName || ""}`.trim() ||
            "Chưa có tên";
          const isBeingInterviewed =
            app.status === ApplicationStatus.INTERVIEWING ||
            app.applicationDepartments?.some(
              (d) => d.status === ApplicationStatus.INTERVIEWING
            );

          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#255798] to-[#4d8ee8] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-[0_0_12px_rgba(37,87,152,0.3)]">
                {app.firstName
                  ? app.firstName.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white group-hover:text-[#4d8ee8] truncate transition-colors">
                    {fullName}
                  </p>
                  {isBeingInterviewed && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Đang PV
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8A8F98] truncate">{app.email}</p>
                <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                  <span className="text-[11px] font-mono text-[#8A8F98]">
                    {app.phoneNumber || "—"}
                  </span>
                  {app.facebookUrl && (
                    <a
                      href={
                        app.facebookUrl.startsWith("http")
                          ? app.facebookUrl
                          : `https://${app.facebookUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] text-[#4d8ee8] hover:text-[#7bb0f8] hover:underline"
                      title="Mở Facebook ứng viên"
                    >
                      <Facebook className="w-3 h-3 text-[#1877F2]" />
                      <span>FB</span>
                    </a>
                  )}
                  {app.checkedInAt && (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400/90 font-medium"
                      title="Thời gian check-in của ứng viên"
                    >
                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Check-in: {new Date(app.checkedInAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "school",
        header: "Trường",
        render: (_val, app) => {
          const schoolDisplayName = formatSchoolName(app.school);
          return (
            <div className="text-xs text-[#8A8F98]">
              <p
                className="text-[#EDEDEF] font-medium truncate max-w-[200px]"
                title={schoolDisplayName}
              >
                {schoolDisplayName}
              </p>
              {app.majorClass && (
                <p className="text-[11px] text-[#8A8F98] truncate max-w-[200px] mt-0.5">
                  {app.majorClass}
                </p>
              )}
            </div>
          );
        },
      },
      {
        key: "course",
        header: "Khóa",
        nowrap: true,
        render: (_val, app) =>
          app.course ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-[#255798]/15 text-[#4d8ee8] border border-[#255798]/30">
              {app.course.startsWith("K") || app.course.startsWith("k")
                ? app.course.toUpperCase()
                : `K${app.course}`}
            </span>
          ) : (
            <span className="text-[#8A8F98]">—</span>
          ),
      },
      {
        key: "area",
        header: "Cơ sở",
        nowrap: true,
        render: (_val, app) => {
          const isHanoi = app.area === Area.HANOI;
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
        key: "departments",
        header: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleToggleScoreSort();
            }}
            className="flex items-center gap-1.5 cursor-pointer select-none group"
            title="Nhấp để sắp xếp theo điểm phỏng vấn (Giảm dần → Tăng dần → Mặc định)"
          >
            <span>Nguyện vọng Ban & Điểm</span>
            {scoreSort === "DESC" ? (
              <span className="inline-flex items-center text-[#4d8ee8] font-bold">
                <ArrowDown className="w-3.5 h-3.5" />
                <span className="text-[10px] ml-0.5 font-mono">Giảm</span>
              </span>
            ) : scoreSort === "ASC" ? (
              <span className="inline-flex items-center text-[#4d8ee8] font-bold">
                <ArrowUp className="w-3.5 h-3.5" />
                <span className="text-[10px] ml-0.5 font-mono">Tăng</span>
              </span>
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8A8F98]/40 group-hover:text-white transition-colors" />
            )}
          </div>
        ),
        render: (_val, app) => (
          <div className="flex flex-wrap gap-1.5">
            {app.applicationDepartments?.map((dept) => {
              const cfg = DEPARTMENT_CONFIG[dept.department] || {
                name: dept.department,
                badgeBg: "bg-white/10",
                badgeBorder: "border-white/20",
                textColor: "text-white",
              };
              const hasScore =
                dept.interviewScore !== undefined &&
                dept.interviewScore !== null;
              const isDeptInterviewing =
                dept.status === ApplicationStatus.INTERVIEWING;

              return (
                <span
                  key={dept.id}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.textColor}`}
                >
                  <span>{cfg.name}</span>
                  {hasScore && (
                    <span className="font-mono font-bold text-white bg-black/30 px-1 rounded">
                      {dept.interviewScore}
                    </span>
                  )}
                  {isDeptInterviewing && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
                      title="Đang phỏng vấn ban này"
                    />
                  )}
                </span>
              );
            })}
          </div>
        ),
      },
      {
        key: "status",
        header: "Trạng thái",
        nowrap: true,
        render: (_val, app) => {
          const statusCfg = APPLICATION_STATUS_CONFIG[app.status] || {
            label: app.status,
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
                className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`}
              />
              {statusCfg.label}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Thao tác",
        align: "right",
        nowrap: true,
        render: (_val, app) => {
          const isBeingInterviewed =
            app.status === ApplicationStatus.INTERVIEWING ||
            app.applicationDepartments?.some(
              (d) => d.status === ApplicationStatus.INTERVIEWING
            );
          const isClaimedByMe = app.applicationDepartments?.some(
            (d) =>
              d.status === ApplicationStatus.INTERVIEWING &&
              d.interviewerId === user?.id
          );
          const isDimmed =
            isInterviewer &&
            !isAdmin &&
            !isReceptionist &&
            isBeingInterviewed &&
            !isClaimedByMe;

          return (
            <TableActionGroup>
              {/* Admin: Check-in (SUBMITTED or NO_SHOW) */}
              {isAdmin &&
                (app.status === ApplicationStatus.SUBMITTED ||
                  app.status === ApplicationStatus.NO_SHOW) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCheckIn(app);
                    }}
                    title="Điểm danh ứng viên"
                    className="h-8 px-2.5 text-xs font-medium rounded-lg text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/50 inline-flex items-center gap-1.5 transition-all select-none active:scale-[0.97] cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Check-in</span>
                  </button>
                )}

              {/* Admin: Interview button (CHECKED_IN or INTERVIEWING) */}
              {isAdmin &&
                (app.status === ApplicationStatus.CHECKED_IN ||
                  app.status === ApplicationStatus.INTERVIEWING) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(app);
                    }}
                    title="Mở màn hình phỏng vấn"
                    className="h-8 px-2.5 text-xs font-medium rounded-lg text-sky-300 bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 hover:border-sky-500/50 inline-flex items-center gap-1.5 transition-all select-none active:scale-[0.97] cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Phỏng vấn</span>
                  </button>
                )}

              {/* Admin: Approve/Reject (INTERVIEWED status) */}
              {isAdmin && app.status === ApplicationStatus.INTERVIEWED && (
                <>
                  <ApproveButton
                    tooltip="Duyệt đơn ứng tuyển"
                    onClick={(e) => handleQuickApprove(app, e)}
                  />
                  <RejectButton
                    tooltip="Từ chối đơn ứng tuyển"
                    onClick={(e) => handleQuickReject(app, e)}
                  />
                </>
              )}

              {/* Receptionist: Check-in (SUBMITTED or NO_SHOW) */}
              {isReceptionist &&
                !isAdmin &&
                (app.status === ApplicationStatus.SUBMITTED ||
                  app.status === ApplicationStatus.NO_SHOW) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCheckIn(app);
                    }}
                    title="Điểm danh ứng viên"
                    className="h-8 px-2.5 text-xs font-medium rounded-lg text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/50 inline-flex items-center gap-1.5 transition-all select-none active:scale-[0.97] cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Check-in</span>
                  </button>
                )}

              {/* Receptionist: No-show (SUBMITTED or CHECKED_IN) */}
              {isReceptionist &&
                !isAdmin &&
                (app.status === ApplicationStatus.SUBMITTED ||
                  app.status === ApplicationStatus.CHECKED_IN) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickNoShow(app.id);
                    }}
                    title="Báo vắng mặt"
                    className="h-8 px-2.5 text-xs font-medium rounded-lg text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 hover:bg-zinc-500/20 hover:text-zinc-200 hover:border-zinc-500/40 inline-flex items-center gap-1.5 transition-all select-none active:scale-[0.97] cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Vắng</span>
                  </button>
                )}


              {/* Interviewer: Claim / Continue interview */}
              {isInterviewer && !isAdmin && !isReceptionist && (
                <>
                  {isClaimedByMe ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(app);
                      }}
                      className="h-8 px-2.5 text-xs font-medium rounded-lg text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-500/50 inline-flex items-center gap-1.5 transition-all select-none active:scale-[0.97] cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Tiếp tục PV</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenClaim(app);
                      }}
                      disabled={isDimmed}
                      title={
                        isDimmed
                          ? "Ứng viên đang được phỏng vấn bởi phòng ban khác"
                          : "Bắt đầu phỏng vấn ứng viên"
                      }
                      className="h-8 px-2.5 text-xs font-medium rounded-lg text-sky-300 bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 hover:border-sky-500/50 inline-flex items-center gap-1.5 transition-all select-none active:scale-[0.97] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Phỏng vấn</span>
                    </button>
                  )}
                </>
              )}
            </TableActionGroup>
          );
        },
      },
    ],
    [scoreSort, isAdmin, isReceptionist, isInterviewer, user]
  );

  return (
    <div className="space-y-5">
      {/* Page Header with Campaign Info */}
      <PageHeader
        badge={activeRecruitment?.isActive ? "Đang diễn ra" : "Chưa có đợt active"}
        title={activeRecruitment ? activeRecruitment.name : "Không gian Phỏng vấn & Tuyển chọn"}
        description={
          activeRecruitment
            ? `Chiến dịch tuyển quân: ${activeRecruitment.startDate} đến ${activeRecruitment.endDate}`
            : "Vui lòng kích hoạt đợt tuyển thành viên để bắt đầu điểm danh và chấm điểm."
        }
        actions={
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
            {(isAdmin || isReceptionist) && (
              <HeaderPrimaryButton
                icon={UserPlus}
                disabled={!activeRecruitment}
                onClick={() => {
                  const popupUrl = `/admin/interview/create?popup=true`;
                  const w = 840;
                  const h = 720;
                  const left = Math.round((window.screen.width - w) / 2);
                  const top = Math.round((window.screen.height - h) / 2);
                  window.open(
                    popupUrl,
                    "create_application_popup",
                    `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
                  );
                }}
              >
                Tạo đơn mới (Offline)
              </HeaderPrimaryButton>
            )}

            {/* Area Switcher Button (Standardized to h-10 rounded-lg) */}
            <button
              type="button"
              onClick={() => setIsAreaModalOpen(true)}
              className={`h-10 inline-flex items-center gap-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                selectedArea === Area.HANOI
                  ? "bg-[#255798]/20 border-[#255798]/50 text-[#4d8ee8] hover:bg-[#255798]/30 shadow-[0_0_15px_rgba(37,87,152,0.2)]"
                  : selectedArea === Area.NINH_BINH
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "bg-white/[0.04] border-white/10 text-[#EDEDEF] hover:bg-white/[0.08]"
              }`}
              title="Nhấn để chuyển đổi cơ sở phỏng vấn (Hà Nội / Ninh Bình)"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>
                {selectedArea === Area.HANOI
                  ? "Cơ sở 1 (Hà Nội)"
                  : selectedArea === Area.NINH_BINH
                  ? "Cơ sở 3 (Ninh Bình)"
                  : "Chưa chọn cơ sở"}
              </span>
              <span className="text-[10px] text-white/50 underline ml-0.5">Đổi</span>
            </button>

            {/* Excel Operations Dropdown (Admin only) */}
            {isAdmin && (
              <InterviewExcelActions
                activeRecruitmentId={activeRecruitment?.id}
                searchCriteria={{
                  keyword: debouncedKeyword.trim() || undefined,
                  area: selectedArea || undefined,
                  department: deptFilter !== "" ? (deptFilter as Department) : undefined,
                  school: schoolFilter !== "" ? schoolFilter : undefined,
                  course: courseFilter !== "" ? courseFilter : undefined,
                  status: statusFilter ? (statusFilter as ApplicationStatus) : undefined,
                  activeRecruitmentOnly: true,
                }}
                onImportSuccess={() => {
                  fetchApplications();
                  fetchStatsApplications();
                }}
              />
            )}

            <HeaderSecondaryButton
              isLoading={loading || statsLoading}
              onClick={() => {
                fetchApplications();
                fetchStatsApplications();
              }}
            >
              Làm mới
            </HeaderSecondaryButton>
          </div>
        }
      />

      {/* Compact Candidate Statistics Strip */}
      {isAdmin || isReceptionist ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#8A8F98]">
              <Users className="w-3.5 h-3.5 text-[#4d8ee8]" />
              <span>Tổng hồ sơ</span>
            </div>
            <span className="text-sm font-bold font-mono text-white">{statsData.total}</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Chờ PV</span>
            </div>
            <span className="text-sm font-bold font-mono text-amber-300">{statsData.checkedIn}</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <Mic className="w-3.5 h-3.5" />
              <span>Đang PV</span>
            </div>
            <span className="text-sm font-bold font-mono text-purple-300">{statsData.interviewing}</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã PV</span>
            </div>
            <span className="text-sm font-bold font-mono text-cyan-300">{statsData.interviewed}</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              <span>Đã duyệt</span>
            </div>
            <span className="text-sm font-bold font-mono text-emerald-400">{statsData.approved}</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-rose-500/[0.03] border border-rose-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <XCircle className="w-3.5 h-3.5" />
              <span>Từ chối</span>
            </div>
            <span className="text-sm font-bold font-mono text-rose-400">{statsData.rejected}</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <UserX className="w-3.5 h-3.5" />
              <span>Vắng mặt</span>
            </div>
            <span className="text-sm font-bold font-mono text-zinc-300">{statsData.noShow}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#8A8F98]">
              <Users className="w-3.5 h-3.5 text-[#4d8ee8]" />
              <span>Tổng ứng viên</span>
            </div>
            <span className="text-sm font-bold font-mono text-white">{statsData.total}</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Chờ phỏng vấn</span>
            </div>
            <span className="text-sm font-bold font-mono text-amber-300">{statsData.checkedIn}</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <Mic className="w-3.5 h-3.5" />
              <span>Đang phỏng vấn</span>
            </div>
            <span className="text-sm font-bold font-mono text-purple-300">{statsData.interviewing}</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã hoàn tất</span>
            </div>
            <span className="text-sm font-bold font-mono text-cyan-300">{statsData.interviewed}</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("LIST")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "LIST"
              ? "bg-[#255798] text-white shadow-[0_0_12px_rgba(37,87,152,0.4)]"
              : "text-[#8A8F98] hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Danh sách ứng viên</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("STATS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "STATS"
              ? "bg-[#255798] text-white shadow-[0_0_12px_rgba(37,87,152,0.4)]"
              : "text-[#8A8F98] hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Thống kê & Biểu đồ</span>
        </button>
      </div>

      {/* TAB 1: LIST & INTERVIEW OPERATIONS */}
      {activeTab === "LIST" && (
        <div className="space-y-4">
          {/* Streamlined 1-Row Filter Bar (No notifications & No reset button) */}
          <FilterBar>
            <FilterSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Tìm theo họ tên, email, SĐT ứng viên..."
              className="flex-1 min-w-[220px]"
            />
            <FilterSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(0);
              }}
              placeholder="Tất cả trạng thái"
              className="w-full sm:w-[170px]"
            />
            <FilterSelect
              options={departmentOptions}
              value={deptFilter}
              onChange={(val) => {
                setDeptFilter(val);
                setPage(0);
              }}
              placeholder="Tất cả các ban"
              className="w-full sm:w-[160px]"
            />
            <FilterSelect
              options={schoolOptions}
              value={schoolFilter}
              onChange={(val) => {
                setSchoolFilter(val);
                setPage(0);
              }}
              placeholder="Tất cả trường/khoa"
              className="w-full sm:w-[180px]"
            />
            <FilterSelect
              options={courseOptions}
              value={courseFilter}
              onChange={(val) => {
                setCourseFilter(val);
                setPage(0);
              }}
              placeholder="Tất cả khóa"
              className="w-full sm:w-[130px]"
            />
          </FilterBar>

          {/* Bulk Action Toolbar */}
          {(isAdmin || isReceptionist) && (
            <BulkActionBar
              selectedCount={selectedIds.size}
              unitName="ứng viên"
              onClearSelection={() => setSelectedIds(new Set())}
            >
              {/* Bulk No-Show */}
              <button
                type="button"
                onClick={handleBulkNoShow}
                disabled={bulkLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-500/15 text-zinc-300 border border-zinc-500/30 hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-50"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Báo vắng ({selectedIds.size})</span>
              </button>

              {/* Bulk Approve (Admin Only) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleBulkApprove}
                  disabled={bulkLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Duyệt đơn ({selectedIds.size})</span>
                </button>
              )}

              {/* Bulk Reject (Admin Only) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleBulkReject}
                  disabled={bulkLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Từ chối đơn ({selectedIds.size})</span>
                </button>
              )}
            </BulkActionBar>
          )}

          {/* Standardized Data Table */}
          <DataTable<ApplicationFormDto>
            data={displayedApplications}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={loading}
            loadingMessage="Đang tải danh sách ứng viên..."
            selection={
              isAdmin || isReceptionist
                ? {
                    selectedIds: selectedIds as Set<string | number>,
                    onToggleSelect: (id) => handleToggleSelect(Number(id)),
                    onToggleSelectAll: handleToggleSelectAll,
                    isAllSelected,
                    isPartiallySelected,
                  }
                : undefined
            }
            onRowClick={(app) => {
              const isBeingInterviewed =
                app.status === ApplicationStatus.INTERVIEWING ||
                app.applicationDepartments?.some(
                  (d) => d.status === ApplicationStatus.INTERVIEWING
                );
              const isClaimedByMe = app.applicationDepartments?.some(
                (d) =>
                  d.status === ApplicationStatus.INTERVIEWING &&
                  d.interviewerId === user?.id
              );
              const isDimmed =
                isInterviewer &&
                !isAdmin &&
                !isReceptionist &&
                isBeingInterviewed &&
                !isClaimedByMe;
              if (isDimmed) return;
              handleOpenDetail(app);
            }}
            rowClassName={(app) => {
              const isBeingInterviewed =
                app.status === ApplicationStatus.INTERVIEWING ||
                app.applicationDepartments?.some(
                  (d) => d.status === ApplicationStatus.INTERVIEWING
                );
              const isClaimedByMe = app.applicationDepartments?.some(
                (d) =>
                  d.status === ApplicationStatus.INTERVIEWING &&
                  d.interviewerId === user?.id
              );
              const isDimmed =
                isInterviewer &&
                !isAdmin &&
                !isReceptionist &&
                isBeingInterviewed &&
                !isClaimedByMe;
              return isDimmed
                ? "opacity-40 bg-white/[0.01] cursor-not-allowed select-none"
                : "";
            }}
            emptyTitle="Không có ứng viên nào"
            emptyDescription="Không tìm thấy ứng viên phù hợp với bộ lọc hiện tại."
            emptyIcon={<Users className="w-6 h-6 text-[#4d8ee8]" />}
            minWidth="min-w-[960px]"
          />

          {/* Table Pagination */}
          <TablePagination
            page={page}
            size={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              setSelectedIds(new Set());
              setPage(newPage);
            }}
            onSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(0);
              setSelectedIds(new Set());
            }}
            sizeOptions={[10, 20, 30, 50, 100]}
            unitName="ứng viên"
          />
        </div>
      )}

      {/* TAB 2: STATISTICS & 3D CHARTS */}
      {activeTab === "STATS" && (
        <InterviewStatsTab
          statsData={statsData}
          selectedArea={selectedArea}
          statsLoading={statsLoading}
          isAdmin={isAdmin}
          isReceptionist={isReceptionist}
          onRefreshStats={fetchStatsApplications}
        />
      )}

      {/* Check-in Modal (Admin & Receptionist) */}
      <CheckInModal
        isOpen={isCheckInOpen}
        application={checkInApp}
        onClose={() => setIsCheckInOpen(false)}
        onSuccess={() => {
          setIsCheckInOpen(false);
          fetchApplications();
          fetchStatsApplications();
        }}
      />

      {/* Claim Interview Modal */}
      <ClaimInterviewModal
        isOpen={isClaimOpen}
        application={claimApp}
        onClose={() => setIsClaimOpen(false)}
        onStartSuccess={handleClaimSuccess}
      />

      {/* Campus / Area Selection Modal */}
      <AreaSelectModal
        isOpen={isAreaModalOpen}
        selectedArea={selectedArea}
        allowClose={selectedArea !== null}
        onSelect={handleSelectArea}
        onClose={() => setIsAreaModalOpen(false)}
      />
    </div>
  );
}
