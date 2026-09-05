import apiClient from "./apiClient";
import {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  AuthUser,
} from "@/types/auth";
import { User, ApiResponse } from "@/types/user";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const authService = {
  /**
   * Đăng nhập với username hoặc email
   */
  login: async (request: LoginRequest): Promise<LoginResponseData> => {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>(
      "/api/auth/login",
      request
    );
    const data = response.data.data;
    if (typeof window !== "undefined" && data?.token) {
      authService.saveSession(data.token, {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
      });
    }
    return data;
  },

  /**
   * Đăng ký thành viên mới
   */
  register: async (request: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      "/api/auth/register",
      request
    );
    return response.data.data;
  },

  /**
   * Lấy thông tin tài khoản đang đăng nhập
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/api/users/me");
    return response.data.data;
  },

  /**
   * Lưu token và user info vào localStorage
   */
  saveSession: (token: string, user: AuthUser): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Xóa token và user info khỏi localStorage (Đăng xuất)
   */
  clearSession: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Lấy token hiện tại từ localStorage
   */
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Lấy thông tin user hiện tại từ localStorage
   */
  getUser: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as AuthUser;
    } catch {
      return null;
    }
  },

  /**
   * Kiểm tra đã đăng nhập hay chưa
   */
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },
};

export default authService;
