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
        roles: data.roles || (data.role ? [String(data.role)] : ["MEMBER"]),
        permissions: data.permissions || [],
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
   * Giải mã payload của token JWT an toàn (không cần thư viện bên ngoài)
   */
  decodeToken: (token?: string | null): { exp?: number; sub?: string; [key: string]: unknown } | null => {
    const jwt = token !== undefined ? token : authService.getToken();
    if (!jwt) return null;
    try {
      const parts = jwt.split(".");
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },

  /**
   * Kiểm tra token đã hết hạn hay chưa
   */
  isTokenExpired: (token?: string | null): boolean => {
    const jwt = token !== undefined ? token : authService.getToken();
    if (!jwt) return true;
    const decoded = authService.decodeToken(jwt);
    if (!decoded || !decoded.exp) return false;
    // exp tính bằng giây, so sánh với ms hiện tại
    return decoded.exp * 1000 <= Date.now();
  },

  /**
   * Lấy thời điểm token hết hạn tính theo ms timestamp
   */
  getTokenExpiryTime: (token?: string | null): number | null => {
    const jwt = token !== undefined ? token : authService.getToken();
    if (!jwt) return null;
    const decoded = authService.decodeToken(jwt);
    if (!decoded || !decoded.exp) return null;
    return decoded.exp * 1000;
  },

  /**
   * Kiểm tra đã đăng nhập và token còn hiệu lực hay không
   */
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    if (!token) return false;
    return !authService.isTokenExpired(token);
  },
};

export default authService;
