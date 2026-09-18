import InterviewPopupPage from "@/components/admin/interview/InterviewPopupContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phỏng vấn ứng viên | iStar Admin",
  description: "Màn hình phỏng vấn chi tiết ứng viên CLB Nghệ thuật iStar",
};

export default async function InterviewDetailPopupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InterviewPopupPage applicationId={Number(id)} />;
}