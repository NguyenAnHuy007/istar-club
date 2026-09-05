export enum Role {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  MEMBER = "MEMBER",
}

export enum Position {
  PRESIDENT = "PRESIDENT",
  VICE_PRESIDENT = "VICE_PRESIDENT",
  HEAD_OF_DEPARTMENT = "HEAD_OF_DEPARTMENT",
  DEPUTY_HEAD_OF_DEPARTMENT = "DEPUTY_HEAD_OF_DEPARTMENT",
  MEMBER = "MEMBER",
  CANDIDATE = "CANDIDATE",
}

export enum Area {
  HANOI = "HANOI",
  NINH_BINH = "NINH_BINH",
}

export enum Department {
  MUSIC = "MUSIC",
  RAP = "RAP",
  MEDIA_AND_EVENT = "MEDIA_AND_EVENT",
  DANCE = "DANCE",
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
  role: Role;
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
  role?: Role;
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
