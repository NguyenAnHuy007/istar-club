import { Metadata } from "next";
import ApplyPageContent from "@/components/apply/ApplyPageContent";

export const metadata: Metadata = {
  title: "Ứng tuyển thành viên | CLB Nghệ thuật iStar - HaUI",
  description:
    "Đơn đăng ký ứng tuyển thành viên Câu lạc bộ Nghệ thuật iStar - Trường Đại học Công nghiệp Hà Nội.",
};

export default function ApplyPage() {
  return <ApplyPageContent />;
}
