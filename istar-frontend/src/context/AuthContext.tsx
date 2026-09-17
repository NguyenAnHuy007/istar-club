"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "@/services/authService";
import {
  AuthUser,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
} from "@/types/auth";
import { User } from "@/types/user";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isReceptionist: boolean;
  isInterviewer: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  login: (data: LoginRequest) => Promise<LoginResponseData>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khôi phục phiên đăng nhập khi tải trang
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();

      if (storedToken) {
        // Kiểm tra nếu token đã hết hạn
        if (authService.isTokenExpired(storedToken)) {
          authService.clearSession();
          setToken(null);
          setUser(null);
          setIsLoading(false);
          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (
              !currentPath.startsWith("/login") &&
              !currentPath.startsWith("/register") &&
              currentPath.startsWith("/admin")
            ) {
              const redirectQuery = encodeURIComponent(currentPath + window.location.search);
              window.location.href = `/login?expired=true&redirect=${redirectQuery}`;
            }
          }
          return;
        }

        if (storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Thử đồng bộ profile mới nhất từ server
          try {
            const profile = await authService.getProfile();
            const updatedUser: AuthUser = {
              id: profile.id,
              username: profile.username,
              email: profile.email,
              role: profile.role,
              roles: profile.roles || (profile.role ? [String(profile.role)] : ["MEMBER"]),
              permissions: profile.permissions || [],
              userDepartments: profile.userDepartments || [],
            };
            setUser(updatedUser);
            authService.saveSession(storedToken, updatedUser);
          } catch (error) {
            console.warn("Could not refresh profile:", error);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Lắng nghe hết hạn token tự động theo thời gian thực
  useEffect(() => {
    if (!token) return;
    const expiryTime = authService.getTokenExpiryTime(token);
    if (!expiryTime) return;

    const msRemaining = expiryTime - Date.now();
    const handleExpired = () => {
      authService.clearSession();
      setToken(null);
      setUser(null);
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
          const redirectQuery = encodeURIComponent(currentPath + window.location.search);
          window.location.href = `/login?expired=true&redirect=${redirectQuery}`;
        }
      }
    };

    if (msRemaining <= 0) {
      handleExpired();
      return;
    }

    const timer = setTimeout(handleExpired, msRemaining);
    return () => clearTimeout(timer);
  }, [token]);

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponseData> => {
    const res = await authService.login(data);
    const authUser: AuthUser = {
      id: res.id,
      username: res.username,
      email: res.email,
      role: res.role,
      roles: res.roles || (res.role ? [String(res.role)] : ["MEMBER"]),
      permissions: res.permissions || [],
      userDepartments: res.userDepartments || [],
    };
    setToken(res.token);
    setUser(authUser);
    return res;
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<User> => {
    const newUser = await authService.register(data);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await authService.getProfile();
      const updatedUser: AuthUser = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role,
        roles: profile.roles || (profile.role ? [String(profile.role)] : ["MEMBER"]),
        permissions: profile.permissions || [],
        userDepartments: profile.userDepartments || [],
      };
      setUser(updatedUser);
      authService.saveSession(token, updatedUser);
    } catch (err) {
      console.error("Refresh profile error:", err);
    }
  }, [token]);

  const isAdmin = Boolean(
    user?.roles?.includes("ADMIN") ||
    user?.role === "ADMIN"
  );

  const isReceptionist = Boolean(
    isAdmin ||
    user?.roles?.includes("RECEPTIONIST") ||
    user?.role === "RECEPTIONIST" ||
    user?.permissions?.includes("APPLICATION_CHECKIN") ||
    user?.permissions?.includes("PERM_APPLICATION_CHECKIN")
  );

  const isInterviewer = Boolean(
    isAdmin ||
    user?.roles?.includes("INTERVIEWER") ||
    user?.role === "INTERVIEWER" ||
    user?.permissions?.includes("INTERVIEW_CONDUCT") ||
    user?.permissions?.includes("PERM_INTERVIEW_CONDUCT") ||
    user?.permissions?.includes("APPLICATION_VIEW_OWN_DEPT") ||
    user?.permissions?.includes("PERM_APPLICATION_VIEW_OWN_DEPT")
  );

  const hasRole = useCallback((roleName: string): boolean => {
    if (!user) return false;
    if (user.roles?.includes("ADMIN") || user.role === "ADMIN") return true;
    return Boolean(user.roles?.includes(roleName) || user.role === roleName);
  }, [user]);

  const hasPermission = useCallback((permCode: string): boolean => {
    if (!user) return false;
    if (user.roles?.includes("ADMIN") || user.role === "ADMIN") return true;
    return Boolean(
      user.permissions?.includes(permCode) ||
      user.permissions?.includes("PERM_" + permCode) ||
      (permCode.startsWith("PERM_") && user.permissions?.includes(permCode.replace("PERM_", "")))
    );
  }, [user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!user) return false;
    if (user.roles?.includes("ADMIN") || user.role === "ADMIN") return true;
    return roles.some((r) => user.roles?.includes(r) || user.role === r);
  }, [user]);

  const hasAnyPermission = useCallback((perms: string[]): boolean => {
    if (!user) return false;
    if (user.roles?.includes("ADMIN") || user.role === "ADMIN") return true;
    return perms.some((p) =>
      user.permissions?.includes(p) ||
      user.permissions?.includes("PERM_" + p) ||
      (p.startsWith("PERM_") && user.permissions?.includes(p.replace("PERM_", "")))
    );
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        isAdmin,
        isReceptionist,
        isInterviewer,
        hasRole,
        hasPermission,
        hasAnyRole,
        hasAnyPermission,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
