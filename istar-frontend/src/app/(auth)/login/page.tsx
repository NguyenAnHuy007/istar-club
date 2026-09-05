import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập | iStar Club",
  description: "Đăng nhập hệ thống quản lý Câu lạc bộ Nghệ thuật iStar.",
};

export default function LoginPage() {
  return <LoginForm />;
}
