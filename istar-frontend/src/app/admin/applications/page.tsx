"use client";

import { motion } from "framer-motion";
import { FileText, Construction } from "lucide-react";
import Link from "next/link";

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export default function ApplicationsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div {...fadeUp(0)} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
          Đơn ứng tuyển
        </h1>
        <p className="text-sm text-[#8A8F98]">
          Xem và quản lý danh sách đơn ứng tuyển.
        </p>
      </motion.div>

      {/* Placeholder */}
      <motion.div
        {...fadeUp(0.15)}
        className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-12 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#255798]/15 flex items-center justify-center">
            <Construction className="w-7 h-7 text-[#4d8ee8]" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-[#EDEDEF] mb-2">
          Đang phát triển
        </h2>
        <p className="text-sm text-[#8A8F98] max-w-md mx-auto mb-6">
          Danh sách đơn ứng tuyển chi tiết sẽ được triển khai trong bản cập nhật
          tiếp theo. Bạn sẽ có thể xem, duyệt và quản lý từng đơn tại đây.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#8A8F98] hover:text-[#EDEDEF] rounded-lg border border-white/[0.08] hover:bg-white/[0.04] transition-all duration-200"
        >
          <FileText className="w-4 h-4" />
          Quay lại Tổng quan
        </Link>
      </motion.div>
    </div>
  );
}
