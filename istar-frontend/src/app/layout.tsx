import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "iStar — Câu lạc bộ Nghệ thuật | HaUI",
  description:
    "Câu lạc bộ Nghệ thuật iStar - Trường Công nghệ Thông tin và Truyền thông, Đại học Công nghiệp Hà Nội",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} antialiased`}>
      <body className="min-h-[100dvh] min-w-[320px] bg-[#050506] text-[#EDEDEF] font-[family-name:var(--font-inter)] noise-overlay grid-overlay">
        {/* Ambient Background System */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Base radial gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]" />

          {/* Primary blob — top center */}
          <div
            className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[1400px] rounded-full opacity-25 blur-[150px]"
            style={{
              background: "radial-gradient(circle, #255798 0%, transparent 70%)",
              animation: "float-1 10s ease-in-out infinite",
            }}
          />

          {/* Secondary blob — left */}
          <div
            className="absolute top-[30%] left-[-100px] w-[600px] h-[800px] rounded-full opacity-15 blur-[120px]"
            style={{
              background: "radial-gradient(circle, #1d4ed8 0%, #0284c7 50%, transparent 70%)",
              animation: "float-2 8s ease-in-out infinite",
            }}
          />

          {/* Tertiary blob — right */}
          <div
            className="absolute top-[50%] right-[-100px] w-[500px] h-[700px] rounded-full opacity-12 blur-[100px]"
            style={{
              background: "radial-gradient(circle, #255798 0%, #0369a1 50%, transparent 70%)",
              animation: "float-3 9s ease-in-out infinite",
            }}
          />

          {/* Bottom accent — pulsing */}
          <div
            className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px]"
            style={{
              background: "radial-gradient(circle, #255798 0%, transparent 70%)",
              animation: "pulse-glow 6s ease-in-out infinite",
            }}
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
