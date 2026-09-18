import CreateApplicationPopupContent from "@/components/admin/interview/CreateApplicationPopupContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo đơn mới (Offline) | iStar Admin",
  description: "Màn hình tạo đơn ứng tuyển offline tại bàn lễ tân CLB Nghệ thuật iStar",
};

export default function CreateApplicationPopupPage() {
  return <CreateApplicationPopupContent />;
}