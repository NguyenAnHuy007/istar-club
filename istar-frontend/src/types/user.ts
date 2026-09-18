export enum Role {
  ADMIN = "ADMIN",
  RECEPTIONIST = "RECEPTIONIST",
  INTERVIEWER = "INTERVIEWER",
  REVIEWER = "REVIEWER",
  MEMBER = "MEMBER",
}

export enum Position {
  PRESIDENT = "PRESIDENT",
  VICE_PRESIDENT = "VICE_PRESIDENT",
  DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
  AREA_MANAGER = "AREA_MANAGER",
  MEMBER = "MEMBER",
}

export enum Area {
  HANOI = "HANOI",
  NINH_BINH = "NINH_BINH",
}

export const AREA_CONFIG: Record<
  Area,
  {
    label: string;
    shortLabel: string;
    badgeBg: string;
    badgeBorder: string;
    textColor: string;
  }
> = {
  [Area.NINH_BINH]: {
    label: "Cơ sở 3 (Ninh Bình)",
    shortLabel: "Ninh Bình",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/25",
    textColor: "text-emerald-400",
  },
  [Area.HANOI]: {
    label: "Cơ sở 1 (Hà Nội)",
    shortLabel: "Hà Nội",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/25",
    textColor: "text-blue-400",
  },
};

export enum Department {
  MUSIC = "MUSIC",
  RAP = "RAP",
  MEDIA_AND_EVENT = "MEDIA_AND_EVENT",
  DANCE = "DANCE",
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface PermissionGroup {
  id: number;
  code: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface BulkUserActionRequest {
  userIds: number[];
}

export interface UserDepartmentDto {
  id?: number;
  department: Department;
  position: Position;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthday: string; // ISO Date string (YYYY-MM-DD)
  address: string;
  school: string;
  majorClass: string;
  course: string;
  phoneNumber: string;
  isActive: boolean;
  isDeleted: boolean;
  role: Role | string;
  roles?: string[];
  permissions?: string[];
  position: Position;
  area: Area;
  generationId: number;
  generationName: string;
  userDepartments: UserDepartmentDto[];
}

export interface UserSearchCriteria {
  keyword?: string;
  position?: Position;
  department?: Department;
  generationId?: number;
  course?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export interface UserDepartmentRequest {
  department: Department;
  position: Position;
}

export interface UpdateUserRequest {
  username?: string; // Tùy thuộc backend, form sẽ chặn update
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  address?: string;
  school?: string;
  majorClass?: string;
  course?: string;
  phoneNumber?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  role?: Role | string;
  permissionGroupCodes?: string[];
  position?: Position;
  area?: Area;
  generationId?: number;
  userDepartments?: UserDepartmentRequest[];
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
