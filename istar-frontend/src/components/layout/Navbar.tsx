"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Star, LogOut, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/user";

const navLinks = [
  { label: "Giới thiệu", href: "/#about" },
  { label: "Các ban", href: "/#departments" },
  { label: "Thành tích", href: "/#achievements" },
  { label: "Liên hệ", href: "/#footer" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glass backdrop */}
      <div className="absolute inset-0 bg-[#050506]/15 backdrop-blur-xl border-b border-white/[0.06]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#255798] to-[#4d8ee8] flex items-center justify-center shadow-[0_0_20px_rgba(37,87,152,0.35)] group-hover:shadow-[0_0_30px_rgba(37,87,152,0.55)] transition-shadow duration-300">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#EDEDEF]">
              iStar
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200 rounded-lg hover:bg-white/[0.05]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {user.role === Role.ADMIN && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4d8ee8] bg-[#255798]/15 border border-[#255798]/30 rounded-lg hover:bg-[#255798]/25 transition-colors duration-200"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Trang Quản trị</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#255798] to-[#4d8ee8] flex items-center justify-center text-xs font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-[#EDEDEF] max-w-[120px] truncate font-medium">
                    {user.username}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-2 text-[#8A8F98] hover:text-red-400 hover:bg-white/[0.05] rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#255798] rounded-lg hover:bg-[#316ebf] transition-all duration-200 shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_12px_rgba(37,87,152,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_0_1px_rgba(37,87,152,0.6),0_8px_24px_rgba(37,87,152,0.45),inset_0_1px_0_0_rgba(255,255,255,0.2)] active:scale-[0.98]"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] rounded-lg transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden relative bg-[#050506]/95 backdrop-blur-xl border-b border-white/[0.06]"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] rounded-lg transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-white/[0.06]">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#255798] to-[#4d8ee8] flex items-center justify-center text-sm font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#EDEDEF]">
                          {user.username}
                        </p>
                        <p className="text-xs text-[#8A8F98]">{user.email}</p>
                      </div>
                    </div>

                    {user.role === Role.ADMIN && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#4d8ee8] hover:bg-white/[0.05] rounded-lg"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Trang Quản trị</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/[0.05] rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 text-sm font-medium text-white bg-[#255798] rounded-lg hover:bg-[#316ebf] transition-all duration-200 shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_12px_rgba(37,87,152,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
