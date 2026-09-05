import { Role } from "./user";

export interface LoginFormData {
  email: string; // Tên đăng nhập hoặc Email
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  school: string;
  majorClass: string;
  course: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  school?: string;
  majorClass?: string;
  course?: string;
  birthday?: string;
  address?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: Role;
}

