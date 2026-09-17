"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminGuard from "@/components/admin/AdminGuard";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchParams = useSearchParams();
  const isPopup = searchParams.get("popup") === "true";

  // Popup mode: render without sidebar/topbar (standalone interview or create window)
  if (isPopup) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] text-[#EDEDEF]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Mobile Top Bar */}
        <AdminTopBar onMenuToggle={() => setMobileOpen((prev) => !prev)} />

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <Suspense fallback={<div className="min-h-screen bg-[#0A0B0E]" />}>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </Suspense>
    </AdminGuard>
  );
}
