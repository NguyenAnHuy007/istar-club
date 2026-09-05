"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin": "Tổng quan",
  "/admin/applications": "Đơn ứng tuyển",
  "/admin/users": "Người dùng",
};

interface AdminTopBarProps {
  onMenuToggle: () => void;
}

export default function AdminTopBar({ onMenuToggle }: AdminTopBarProps) {
  const pathname = usePathname();

  const title =
    Object.entries(pageTitles).find(([path]) =>
      pathname === path || (path !== "/admin" && pathname.startsWith(path))
    )?.[1] ?? "Admin";

  return (
    <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center gap-3 px-4 bg-[#050506]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <button
        onClick={onMenuToggle}
        className="p-2 -ml-2 text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] rounded-lg transition-colors duration-200"
        aria-label="Mở menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-[#EDEDEF] truncate">
          {title}
        </span>
      </div>
    </header>
  );
}
