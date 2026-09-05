"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  LayoutDashboard,
  FileText,
  Users,
  ArrowLeft,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  {
    label: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Đơn ứng tuyển",
    href: "/admin/applications",
    icon: FileText,
  },
  {
    label: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
        <Link href="/admin" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#255798] to-[#4d8ee8] flex items-center justify-center shadow-[0_0_20px_rgba(37,87,152,0.35)] group-hover:shadow-[0_0_30px_rgba(37,87,152,0.55)] transition-shadow duration-300">
            <Star className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-[#EDEDEF] leading-none">
              iStar
            </span>
            <span className="text-[10px] text-[#8A8F98] uppercase tracking-widest leading-none mt-0.5">
              Admin
            </span>
          </div>
        </Link>

        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] rounded-lg transition-colors duration-200"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                active
                  ? "bg-[#255798]/15 text-[#EDEDEF] shadow-[inset_0_0_0_1px_rgba(37,87,152,0.3)]"
                  : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]"
              }`}
            >
              <item.icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200 ${
                  active
                    ? "text-[#4d8ee8]"
                    : "text-[#8A8F98] group-hover:text-[#EDEDEF]"
                }`}
              />
              <span className="font-medium">{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4d8ee8] shadow-[0_0_8px_rgba(77,142,232,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#255798] to-[#4d8ee8] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#EDEDEF] truncate leading-tight">
                {user.username}
              </p>
              <p className="text-[10px] text-[#4d8ee8] truncate leading-tight mt-0.5">
                {user.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 text-[#8A8F98] hover:text-red-400 hover:bg-white/[0.05] rounded-md transition-colors duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 text-xs text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04] rounded-lg transition-all duration-200 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span>Quay về trang chủ</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-40 bg-[#050506]/80 backdrop-blur-xl border-r border-white/[0.06]">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay + Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#050506]/95 backdrop-blur-xl border-r border-white/[0.06] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
