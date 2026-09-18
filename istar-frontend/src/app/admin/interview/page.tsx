import InterviewPageContent from "@/components/admin/interview/InterviewPageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phỏng vấn & Điểm danh | iStar Admin",
  description: "Không gian tác nghiệp phỏng vấn, điểm danh và đánh giá ứng viên CLB Nghệ thuật iStar",
};

export default function InterviewPage() {
  return (
    <div className="max-w-[1720px] w-full mx-auto">
      <InterviewPageContent />
    </div>
  );
}
