"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/authService";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading, isAdmin, isReceptionist, isInterviewer, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const canAccessInterview = isReceptionist || isInterviewer;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const isExpired = storedToken ? authService.isTokenExpired(storedToken) : false;
      const expiredQuery = isExpired ? "&expired=true" : "";
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}${expiredQuery}`);
      return;
    }

    if (!isLoading && isAuthenticated && !isAdmin) {
      if (canAccessInterview) {
        if (!pathname.startsWith("/admin/interview")) {
          router.replace("/admin/interview");
        }
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, canAccessInterview, router, pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050506] text-[#EDEDEF]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#255798] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#255798] animate-pulse" />
            </div>
          </div>
          <p className="text-xs text-[#8A8F98] tracking-wider uppercase font-mono">
            Đang xác thực quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // If user is receptionist or interviewer and on /admin/interview -> Allowed!
  if (!isAdmin && canAccessInterview) {
    if (pathname.startsWith("/admin/interview")) {
      return <>{children}</>;
    }
    // Still redirecting to /admin/interview
    return null;
  }

  // Authenticated but has neither ADMIN nor RECEPTIONIST nor INTERVIEWER role
  if (!isAdmin && !canAccessInterview) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050506] p-4 text-[#EDEDEF]">
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
          {/* Subtle red/purple glow backdrop */}
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 blur-[80px] pointer-events-none rounded-full" />

          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_24px_rgba(244,63,94,0.15)]">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>

          <span className="inline-block px-2.5 py-1 text-[11px] font-mono tracking-widest uppercase rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
            403 • Access Denied
          </span>

          <h1 className="text-xl font-bold text-white mb-2">
            Không có quyền truy cập
          </h1>

          <p className="text-sm text-[#8A8F98] leading-relaxed mb-6">
            Tài khoản <span className="text-[#EDEDEF] font-semibold">@{user?.username}</span> của bạn không có đặc quyền Quản trị viên (ADMIN) để truy cập hệ thống quản trị này.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#255798] hover:bg-[#316ebf] transition-all shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_12px_rgba(37,87,152,0.3)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Về Trang chủ
            </Link>

            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#8A8F98] hover:text-[#EDEDEF] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Access granted
  return <>{children}</>;
}
