import { Department, Area } from "./user";

export type DepartmentCode = "MUSIC" | "RAP" | "DANCE" | "MEDIA_AND_EVENT";

export interface DepartmentInfo {
  value: DepartmentCode;
  label: string;
  shortDesc: string;
}

export enum ApplicationStatus {
  SUBMITTED = "SUBMITTED",
  CHECKED_IN = "CHECKED_IN",
  INTERVIEWING = "INTERVIEWING",
  INTERVIEWED = "INTERVIEWED",
  NO_SHOW = "NO_SHOW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    badgeBg: string;
    badgeBorder: string;
    textColor: string;
    dotColor: string;
  }
> = {
  [ApplicationStatus.SUBMITTED]: {
    label: "Đã nộp đơn",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/25",
    textColor: "text-blue-400",
    dotColor: "bg-blue-400",
  },
  [ApplicationStatus.CHECKED_IN]: {
    label: "Đã điểm danh",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/25",
    textColor: "text-amber-400",
    dotColor: "bg-amber-400",
  },
  [ApplicationStatus.INTERVIEWING]: {
    label: "Đang phỏng vấn",
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/25",
    textColor: "text-purple-400",
    dotColor: "bg-purple-400",
  },
  [ApplicationStatus.INTERVIEWED]: {
    label: "Đã phỏng vấn",
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/25",
    textColor: "text-cyan-400",
    dotColor: "bg-cyan-400",
  },
  [ApplicationStatus.APPROVED]: {
    label: "Đã trúng tuyển",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/25",
    textColor: "text-emerald-400",
    dotColor: "bg-emerald-400",
  },
  [ApplicationStatus.REJECTED]: {
    label: "Bị từ chối",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/25",
    textColor: "text-rose-400",
    dotColor: "bg-rose-400",
  },
  [ApplicationStatus.NO_SHOW]: {
    label: "Vắng mặt",
    badgeBg: "bg-zinc-500/10",
    badgeBorder: "border-zinc-500/25",
    textColor: "text-zinc-400",
    dotColor: "bg-zinc-400",
  },
};

export function getApplicationStatusConfig(status?: ApplicationStatus | string | null) {
  if (status && (status in APPLICATION_STATUS_CONFIG)) {
    return APPLICATION_STATUS_CONFIG[status as ApplicationStatus];
  }
  return {
    label: status || "Chưa xác định",
    badgeBg: "bg-white/10",
    badgeBorder: "border-white/20",
    textColor: "text-white",
    dotColor: "bg-white",
  };
}

export const DEPARTMENT_CONFIG: Record<
  Department,
  {
    name: string;
    fullName?: string;
    badgeBg: string;
    badgeBorder: string;
    textColor: string;
  }
> = {
  [Department.MUSIC]: {
    name: "Ban Âm nhạc",
    fullName: "Ban Âm nhạc",
    badgeBg: "bg-indigo-500/15",
    badgeBorder: "border-indigo-500/30",
    textColor: "text-indigo-300",
  },
  [Department.RAP]: {
    name: "Ban Rap",
    fullName: "Ban Rap",
    badgeBg: "bg-orange-500/15",
    badgeBorder: "border-orange-500/30",
    textColor: "text-orange-300",
  },
  [Department.MEDIA_AND_EVENT]: {
    name: "Ban TT&TCSK",
    fullName: "Ban Truyền thông và Tổ chức sự kiện",
    badgeBg: "bg-sky-500/15",
    badgeBorder: "border-sky-500/30",
    textColor: "text-sky-300",
  },
  [Department.DANCE]: {
    name: "Ban Vũ đạo",
    fullName: "Ban Vũ đạo",
    badgeBg: "bg-pink-500/15",
    badgeBorder: "border-pink-500/30",
    textColor: "text-pink-300",
  },
};

export interface ApplicationFormData {
  email: string;
  firstName: string;
  lastName: string;
  birthday: string;
  phoneNumber: string;
  address: string;
  facebookUrl: string;
  school: string;
  majorClass: string;
  course: string;
  area?: Area;
  departments: DepartmentCode[];
  knowIStar: string;
  reasonIStarer: string;
  avatarFile?: File | null;
}

export interface ApplicationDepartmentDto {
  id: number;
  department: Department;
  status: ApplicationStatus;
  interviewScore?: number | null;
  interviewNotes?: string | null;
  interviewerId?: number | null;
  interviewerName?: string | null;
  version?: number;
}

export interface ApplicationFormDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  birthday?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  school?: string | null;
  majorClass?: string | null;
  course?: string | null;
  area?: Area;
  knowIStar?: string | null;
  reasonIStarer?: string | null;
  facebookUrl?: string | null;
  avatarUrl?: string | null;
  status: ApplicationStatus;
  createdAt?: string;
  updatedAt?: string;
  checkedInAt?: string | null;
  interviewedAt?: string | null;
  version?: number;
  recruitmentId?: number | null;
  recruitmentName?: string | null;
  applicationDepartments: ApplicationDepartmentDto[];
}

export interface AdminApplicationSearchCriteria {
  keyword?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  area?: Area;
  department?: Department;
  allowedDepartments?: Department[];
  status?: ApplicationStatus;
  statuses?: ApplicationStatus[];
  recruitmentId?: number;
  activeRecruitmentOnly?: boolean;
  birthdayFrom?: string;
  birthdayTo?: string;
  createdFrom?: string;
  createdTo?: string;
  school?: string;
  course?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export interface ApplicationDepartmentRequest {
  department: Department;
  status?: ApplicationStatus;
  interviewScore?: number | null;
  interviewNotes?: string | null;
}

export interface AdminApplicationUpdateRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  address?: string;
  phoneNumber?: string;
  area?: Area;
  departments?: ApplicationDepartmentRequest[];
  school?: string;
  majorClass?: string;
  course?: string;
  knowIStar?: string;
  reasonIStarer?: string;
  facebookUrl?: string;
  avatarUrl?: string;
  status?: ApplicationStatus;
}

export interface ApplicationFormRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  address?: string;
  phoneNumber: string;
  area?: Area;
  recruitmentId?: number;
  departments: ApplicationDepartmentRequest[];
  school?: string;
  majorClass?: string;
  course?: string;
  knowIStar: string;
  reasonIStarer: string;
  facebookUrl?: string;
  avatarUrl?: string;
  /** Trạng thái khởi tạo - truyền CHECKED_IN khi tạo offline tại bàn lễ tân */
  status?: ApplicationStatus;
}

export interface ApplicationFormResponse {
  id: number;
  fullName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  phoneNumber: string;
  area?: Area;
  school?: string;
  majorClass?: string;
  course?: string;
  facebookUrl?: string;
  avatarUrl?: string;
  recruitmentId?: number;
  recruitmentName?: string;
}
