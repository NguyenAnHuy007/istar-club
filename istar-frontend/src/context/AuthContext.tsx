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

      if (storedToken && storedUser) {
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
          };
          setUser(updatedUser);
          authService.saveSession(storedToken, updatedUser);
        } catch (error) {
          console.warn("Could not refresh profile:", error);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponseData> => {
    const res = await authService.login(data);
    const authUser: AuthUser = {
      id: res.id,
      username: res.username,
      email: res.email,
      role: res.role,
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
      };
      setUser(updatedUser);
      authService.saveSession(token, updatedUser);
    } catch (err) {
      console.error("Refresh profile error:", err);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
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
