"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowLeft, Send, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import AvatarUploader from "./AvatarUploader";
import DepartmentPicker from "./DepartmentPicker";
import { ApplicationFormData, DepartmentCode } from "@/types/application";
import { HAUI_SCHOOLS } from "@/constants/schools";

const initialForm: ApplicationFormData = {
  email: "",
  firstName: "",
  lastName: "",
  birthday: "",
  phoneNumber: "",
  address: "",
  school: "",
  majorClass: "",
  course: "",
  departments: [],
  knowIStar: "",
  reasonIStarer: "",
  avatarFile: null,
};

export default function ApplyPageContent() {
  const [formData, setFormData] = useState<ApplicationFormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deptError, setDeptError] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleDepartmentChange = (depts: DepartmentCode[]) => {
    setFormData((prev) => ({ ...prev, departments: depts }));
    if (depts.length > 0) {
      setDeptError(false);
    }
  };

  const handleAvatarChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, avatarFile: file }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.departments.length === 0) {
      setDeptError(true);
      const element = document.getElementById("dept-picker-section");
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    // Giả lập gửi form (sau này kết nối API /api/auth/applications)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const fadeUp = (delay: number = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12">
      {/* Back to home */}
      <motion.div {...fadeUp(0)} className="w-full max-w-2xl mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay về trang chủ
        </Link>
      </motion.div>

      {/* Main Container */}
      <motion.div
        {...fadeUp(0.1)}
        className="w-full max-w-2xl form-card p-6 sm:p-8 md:p-10 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            /* Success State */
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 px-4 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">
                Nộp đơn ứng tuyển thành công!
              </h2>
              <p className="text-sm text-[#8A8F98] max-w-md mx-auto mb-8 leading-relaxed">
                Cảm ơn bạn đã gửi hồ sơ gia nhập đại gia đình iStar. Ban Chủ nhiệm
                sẽ xem xét đơn ứng tuyển và liên hệ qua email/số điện thoại của bạn trong thời gian sớm nhất!
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/"
                  className="px-6 py-3 text-sm font-medium text-white bg-[#255798] rounded-xl hover:bg-[#316ebf] transition-all duration-200 shadow-md"
                >
                  Trở về trang chủ
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData(initialForm);
                  }}
                  className="px-6 py-3 text-sm font-medium text-[#8A8F98] hover:text-[#EDEDEF] rounded-xl border border-white/[0.08] hover:bg-white/[0.04] transition-all duration-200"
                >
                  Nộp đơn khác
                </button>
              </div>
            </motion.div>
          ) : (
            /* Form Screen */
            <div key="form-screen">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div {...fadeUp(0.15)} className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#255798] to-[#4d8ee8] flex items-center justify-center shadow-[0_0_30px_rgba(37,87,152,0.4)]">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                </motion.div>
                <motion.h1
                  {...fadeUp(0.2)}
                  className="text-2xl sm:text-3xl font-bold gradient-text mb-2"
                >
                  Ứng tuyển thành viên iStar
                </motion.h1>
                <motion.p {...fadeUp(0.25)} className="text-sm text-[#8A8F98]">
                  Điền đầy đủ thông tin bên dưới để nộp đơn ứng tuyển
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ===== 1. THÔNG TIN CÁ NHÂN ===== */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#255798]" />
                    Thông tin cá nhân
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="form-label">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="form-label">
                        Họ đệm
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Nguyễn Văn"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="form-label">
                        Tên <span className="required">*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="An"
                        required
                      />
                    </div>
                  </div>

                  {/* Birthday + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="birthday" className="form-label">
                        Ngày sinh
                      </label>
                      <input
                        id="birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        style={{ colorScheme: "dark" }}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="form-label">
                        Số điện thoại
                      </label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="0912 345 678"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="form-label">
                      Địa chỉ / Quê quán
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Quê quán hoặc địa chỉ hiện tại"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="section-divider" />

                {/* ===== 2. THÔNG TIN HỌC TẬP ===== */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#255798]" />
                    Thông tin học tập
                  </div>

                  {/* School with Datalist */}
                  <div>
                    <label htmlFor="school" className="form-label">
                      Trường / Khoa
                    </label>
                    <input
                      id="school"
                      type="text"
                      list="school-suggestions"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Chọn hoặc nhập tên Trường / Khoa"
                    />
                    <datalist id="school-suggestions">
                      {HAUI_SCHOOLS.map((school) => (
                        <option key={school} value={school} />
                      ))}
                    </datalist>
                  </div>

                  {/* Class + Course */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="majorClass" className="form-label">
                        Lớp chuyên ngành
                      </label>
                      <input
                        id="majorClass"
                        type="text"
                        value={formData.majorClass}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="KTPM01"
                      />
                    </div>
                    <div>
                      <label htmlFor="course" className="form-label">
                        Khóa
                      </label>
                      <input
                        id="course"
                        type="text"
                        value={formData.course}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="K16, K17, K18..."
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="section-divider" />

                {/* ===== 3. THÔNG TIN ỨNG TUYỂN ===== */}
                <div id="dept-picker-section" className="space-y-4">
                  <div className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#255798]" />
                    Thông tin ứng tuyển
                  </div>

                  {/* Department Checkboxes */}
                  <div>
                    <label className="form-label">
                      Ban ứng tuyển <span className="required">*</span>
                    </label>
                    <DepartmentPicker
                      selected={formData.departments}
                      onChange={handleDepartmentChange}
                      hasError={deptError}
                    />
                  </div>

                  {/* Know iStar */}
                  <div>
                    <label htmlFor="knowIStar" className="form-label">
                      Bạn biết đến iStar qua đâu? <span className="required">*</span>
                    </label>
                    <textarea
                      id="knowIStar"
                      value={formData.knowIStar}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Mạng xã hội, bạn bè giới thiệu, sự kiện chào tân..."
                      required
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label htmlFor="reasonIStarer" className="form-label">
                      Lý do bạn muốn gia nhập iStar? <span className="required">*</span>
                    </label>
                    <textarea
                      id="reasonIStarer"
                      value={formData.reasonIStarer}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Chia sẻ về đam mê nghệ thuật, nguyện vọng và mục tiêu của bạn..."
                      required
                    />
                  </div>

                  {/* Avatar Upload */}
                  <div>
                    <label className="form-label">Ảnh đại diện (Ảnh thẻ/chân dung)</label>
                    <AvatarUploader onFileSelect={handleAvatarChange} />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-white bg-[#255798] rounded-xl hover:bg-[#316ebf] transition-all duration-300 shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_16px_rgba(37,87,152,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_0_1px_rgba(37,87,152,0.6),0_8px_32px_rgba(37,87,152,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang gửi đơn...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Nộp đơn ứng tuyển
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer note */}
      <motion.p {...fadeUp(0.5)} className="text-xs text-[#8A8F98]/50 mt-6 text-center">
        © 2024 iStar — Câu lạc bộ Nghệ thuật | HaUI
      </motion.p>
    </div>
  );
}
