import { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập | iStar Club",
  description: "Đăng nhập hệ thống quản lý Câu lạc bộ Nghệ thuật iStar.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#255798] border-t-[#4d8ee8] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
