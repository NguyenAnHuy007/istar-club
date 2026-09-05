import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký thành viên | iStar Club",
  description: "Trang đăng ký tài khoản dành cho thành viên Câu lạc bộ Nghệ thuật iStar.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
