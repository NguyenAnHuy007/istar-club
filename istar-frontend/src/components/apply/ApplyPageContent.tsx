"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Loader2,
  CalendarX2,
  ExternalLink,
  User,
  GraduationCap,
  Compass,
  HelpCircle,
  MapPin,
  CalendarRange,
} from "lucide-react";
import { Facebook } from "@/components/common/Icons";
import { isAxiosError } from "axios";
import DepartmentPicker from "./DepartmentPicker";
import SelectWithOther, {
  SelectOption,
} from "@/components/common/SelectWithOther";
import FilterDatePicker from "@/components/admin/common/FilterDatePicker";
import commonCodeService from "@/services/commonCodeService";
import { useToast } from "@/context/ToastContext";
import publicRecruitmentService from "@/services/publicRecruitmentService";
import publicApplicationService from "@/services/publicApplicationService";
import {
  ApplicationFormData,
  DepartmentCode,
  ApplicationFormRequest,
} from "@/types/application";
import { Department, Area } from "@/types/user";
import { RecruitmentDto } from "@/types/recruitment";
import { HAUI_SCHOOLS } from "@/constants/schools";

const initialForm: ApplicationFormData = {
  email: "",
  firstName: "",
  lastName: "",
  birthday: "",
  phoneNumber: "",
  address: "",
  facebookUrl: "",
  school: "",
  majorClass: "",
  course: "",
  area: Area.NINH_BINH,
  departments: [],
  knowIStar: "",
  reasonIStarer: "",
};

export default function ApplyPageContent() {
  const [formData, setFormData] = useState<ApplicationFormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const [deptError, setDeptError] = useState(false);

  // Trạng thái đợt tuyển active
  const [activeRecruitment, setActiveRecruitment] =
    useState<RecruitmentDto | null>(null);
  const [isLoadingRecruitment, setIsLoadingRecruitment] = useState(true);

  // Danh mục trường học và khóa học từ API
  const [schoolOptions, setSchoolOptions] = useState<SelectOption[]>(
    HAUI_SCHOOLS.map((s) => ({ value: s, label: s }))
  );
  const [courseOptions, setCourseOptions] = useState<SelectOption[]>(
    ["K21", "K20", "K19", "K18"].map((c) => ({
      value: c,
      label: c,
    }))
  );

  useEffect(() => {
    let isMounted = true;
    const fetchInitData = async () => {
      try {
        const [recruitment, schools, courses] = await Promise.all([
          publicRecruitmentService.getActiveRecruitment().catch(() => null),
          commonCodeService.getSchools().catch(() => null),
          commonCodeService.getRecentCourses(4).catch(() => null),
        ]);

        if (isMounted) {
          setActiveRecruitment(recruitment);

          if (schools && schools.length > 0) {
            setSchoolOptions(
              schools.map((item) => ({
                value: item.name,
                label: item.name,
              }))
            );
          }

          if (courses && courses.length > 0) {
            setCourseOptions(
              courses.map((item) => ({
                value: item.code,
                label: item.code || item.name,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu khởi tạo trang nộp đơn:", err);
      } finally {
        if (isMounted) {
          setIsLoadingRecruitment(false);
        }
      }
    };

    fetchInitData();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.departments.length === 0) {
      setDeptError(true);
      toast.warning("Vui lòng chọn ít nhất một Ban nghệ thuật ứng tuyển.");
      const element = document.getElementById("dept-picker-section");
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: ApplicationFormRequest = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        birthday: formData.birthday || undefined,
        address: formData.address.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim(),
        facebookUrl: formData.facebookUrl.trim() || undefined,
        recruitmentId: activeRecruitment?.id,
        area: formData.area || Area.NINH_BINH,
        departments: formData.departments.map((d) => ({
          department: d as unknown as Department,
        })),
        school: formData.school.trim() || undefined,
        majorClass: formData.majorClass.trim() || undefined,
        course: formData.course.trim() || undefined,
        knowIStar: formData.knowIStar.trim(),
        reasonIStarer: formData.reasonIStarer.trim(),
      };

      await publicApplicationService.submitApplication(payload);
      setSubmitted(true);
      toast.success("Nộp đơn ứng tuyển thành công!");
    } catch (err: unknown) {
      console.error("Lỗi khi nộp đơn ứng tuyển:", err);
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(msg || "Đã xảy ra lỗi khi nộp đơn. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = (delay: number = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  // 1. Loading State
  if (isLoadingRecruitment) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[#255798] animate-spin" />
          <p className="text-xs text-[#8A8F98] tracking-wider uppercase font-mono">
            Đang kiểm tra đợt tuyển thành viên...
          </p>
        </div>
      </div>
    );
  }

  // 2. No Active Recruitment State
  if (!activeRecruitment) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        {/* Back to home */}
        <motion.div {...fadeUp(0)} className="w-full max-w-xl mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về trang chủ
          </Link>
        </motion.div>

        {/* Closed Announcement Card */}
        <motion.div
          {...fadeUp(0.1)}
          className="w-full max-w-xl p-8 sm:p-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] text-center relative overflow-hidden"
        >
          {/* Subtle amber glow backdrop */}
          <div className="absolute top-[-90px] left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <CalendarX2 className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 text-[11px] font-mono tracking-widest uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            Cổng đăng ký hiện đang đóng
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Chưa có đợt tuyển thành viên nào đang mở
          </h1>

          <p className="text-sm text-[#8A8F98] leading-relaxed max-w-md mx-auto mb-8">
            Câu lạc bộ Nghệ thuật iStar (HaUI) hiện chưa mở đợt nhận hồ sơ mới hoặc đợt tuyển gần nhất đã kết thúc thời hạn đăng ký. Bạn hãy theo dõi Fanpage chính thức của CLB để không bỏ lỡ thông tin tuyển chọn các Gen tiếp theo nhé!
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#255798] rounded-xl hover:bg-[#316ebf] transition-all duration-200 shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_16px_rgba(37,87,152,0.3)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              Trở về trang chủ
            </Link>

            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-[#8A8F98] hover:text-[#EDEDEF] rounded-xl border border-white/[0.08] hover:bg-white/[0.04] transition-all duration-200"
            >
              <span>Theo dõi Fanpage iStar</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          {...fadeUp(0.3)}
          className="text-xs text-[#8A8F98]/50 mt-8 text-center"
        >
          © 2026 iStar — Câu lạc bộ Nghệ thuật | Đại học Công nghiệp Hà Nội (HaUI)
        </motion.p>
      </div>
    );
  }

  // 3. Active Recruitment: Render Application Form
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
              <p className="text-sm text-[#8A8F98] max-w-md mx-auto mb-2 leading-relaxed">
                Cảm ơn bạn đã gửi hồ sơ tham gia đợt tuyển{" "}
                <strong className="text-[#EDEDEF]">
                  {activeRecruitment.name}
                </strong>
                .
              </p>
              <p className="text-sm text-[#8A8F98] max-w-md mx-auto mb-8 leading-relaxed">
                Ban Chủ nhiệm sẽ sớm xem xét hồ sơ và liên hệ với bạn qua
                email hoặc số điện thoại để thông báo lịch phỏng vấn!
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
                <motion.div
                  {...fadeUp(0.15)}
                  className="flex justify-center mb-4"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(37,87,152,0.4)]">
                    <Image
                      src="/logo.png"
                      alt="iStar Club Logo"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </motion.div>

                {/* Active Campaign Badge */}
                <motion.div {...fadeUp(0.18)} className="mb-3">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#255798]/15 border border-[#255798]/30 text-[#4d8ee8] text-xs font-medium shadow-[0_0_20px_rgba(37,87,152,0.15)]">
                    <span className="w-2 h-2 rounded-full bg-[#4d8ee8] animate-pulse" />
                    <span>
                      Đang mở: <strong>{activeRecruitment.name}</strong>
                    </span>
                  </span>
                </motion.div>

                <motion.h1
                  {...fadeUp(0.2)}
                  className="text-2xl sm:text-3xl font-bold gradient-text mb-2"
                >
                  Ứng tuyển thành viên iStar
                </motion.h1>
                <motion.p {...fadeUp(0.25)} className="text-sm text-[#8A8F98]">
                  Điền đầy đủ thông tin bên dưới để nộp hồ sơ xét tuyển
                </motion.p>
              </div>

              {/* Campaign Description (Rich Text HTML Card) */}
              {activeRecruitment.description && (
                <motion.div
                  {...fadeUp(0.28)}
                  className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-left backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.06] text-xs font-semibold text-[#4d8ee8] uppercase tracking-wider">
                    <CalendarRange className="w-4 h-4 text-[#4d8ee8]" />
                    <span>Thông tin & Kế hoạch tuyển thành viên</span>
                  </div>
                  <div
                    className="text-sm text-[#EDEDEF]/90 leading-relaxed rich-text-content"
                    dangerouslySetInnerHTML={{ __html: activeRecruitment.description }}
                  />
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ===== 1. THÔNG TIN CÁ NHÂN ===== */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#4d8ee8]" />
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
                      <label htmlFor="lastName" className="form-label">
                        Họ và tên đệm
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Nguyễn Văn"
                      />
                    </div>
                    <div>
                      <label htmlFor="firstName" className="form-label">
                        Tên
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="An"
                      />
                    </div>
                  </div>

                  {/* Birthday & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="birthday" className="form-label">
                        Ngày sinh
                      </label>
                      <FilterDatePicker
                        id="birthday"
                        value={formData.birthday}
                        onChange={(date) =>
                          setFormData((prev) => ({ ...prev, birthday: date }))
                        }
                        placeholder="Chọn ngày sinh..."
                        maxDate={new Date().toISOString().substring(0, 10)}
                      />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="form-label">
                        Số điện thoại <span className="required">*</span>
                      </label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="0912345678"
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="form-label">
                      Địa chỉ (Quê quán / Nơi ở hiện tại)
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Bắc Từ Liêm, Hà Nội"
                    />
                  </div>

                  {/* Link Facebook cá nhân */}
                  <div>
                    <label htmlFor="facebookUrl" className="form-label">
                      Link Facebook cá nhân
                    </label>
                    <div className="relative">
                      <input
                        id="facebookUrl"
                        type="url"
                        value={formData.facebookUrl}
                        onChange={handleInputChange}
                        className="form-input !pl-10"
                        placeholder="https://facebook.com/username..."
                      />
                      <Facebook className="w-4 h-4 text-[#1877F2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="section-divider" />

                {/* ===== 2. THÔNG TIN HỌC TẬP ===== */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#4d8ee8]" />
                    Thông tin học tập
                  </div>

                  {/* Trường / Khoa (Dropdown + Khác) */}
                  <div>
                    <label htmlFor="school" className="form-label">
                      Trường / Khoa
                    </label>
                    <SelectWithOther
                      id="school"
                      value={formData.school}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, school: val }))
                      }
                      options={schoolOptions}
                      placeholder="-- Chọn Trường / Khoa --"
                      otherLabel="Khác (Nhập trường/khoa khác)..."
                      otherPlaceholder="Nhập tên Trường / Khoa của bạn..."
                    />
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
                      <SelectWithOther
                        id="course"
                        value={formData.course}
                        onChange={(val) =>
                          setFormData((prev) => ({ ...prev, course: val }))
                        }
                        options={courseOptions}
                        placeholder="-- Chọn Khóa --"
                        otherLabel="Khác (Nhập khóa khác)..."
                        otherPlaceholder="Nhập khóa (VD: K22, Khóa 2025...)"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="section-divider" />

                {/* ===== 3. ĐỊA ĐIỂM / CƠ SỞ PHỎNG VẤN ===== */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#4d8ee8]" />
                    Địa điểm phỏng vấn / Cơ sở <span className="required">*</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          area: Area.NINH_BINH,
                        }))
                      }
                      className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        formData.area === Area.NINH_BINH
                          ? "bg-emerald-500/10 border-emerald-500/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
                          : "bg-white/[0.02] border-white/10 text-[#8A8F98] hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                            formData.area === Area.NINH_BINH
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                              : "bg-white/[0.04] border-white/10 text-[#8A8F98]"
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#EDEDEF]">
                            Cơ sở 3 (Ninh Bình)
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          formData.area === Area.NINH_BINH
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-white/30 bg-transparent"
                        }`}
                      >
                        {formData.area === Area.NINH_BINH && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          area: Area.HANOI,
                        }))
                      }
                      className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        formData.area === Area.HANOI
                          ? "bg-[#255798]/20 border-[#255798]/60 text-white shadow-[0_0_20px_rgba(37,87,152,0.2)] ring-1 ring-[#255798]/60"
                          : "bg-white/[0.02] border-white/10 text-[#8A8F98] hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                            formData.area === Area.HANOI
                              ? "bg-[#255798]/30 border-[#255798]/40 text-[#4d8ee8]"
                              : "bg-white/[0.04] border-white/10 text-[#8A8F98]"
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#EDEDEF]">
                            Cơ sở 1 (Hà Nội)
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          formData.area === Area.HANOI
                            ? "border-[#4d8ee8] bg-[#4d8ee8]"
                            : "border-white/30 bg-transparent"
                        }`}
                      >
                        {formData.area === Area.HANOI && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="section-divider" />

                {/* ===== 4. NGUYỆN VỌNG BAN ===== */}
                <div id="dept-picker-section" className="space-y-4">
                  <div className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#4d8ee8]" />
                    Nguyện vọng tham gia <span className="required">*</span>
                  </div>
                  <p className="text-xs text-[#8A8F98] -mt-2 mb-3">
                    Chọn ít nhất một ban bạn muốn ứng tuyển (có thể chọn nhiều
                    ban)
                  </p>

                  <DepartmentPicker
                    selected={formData.departments}
                    onChange={handleDepartmentChange}
                    hasError={deptError}
                  />
                </div>

                {/* Divider */}
                <div className="section-divider" />

                {/* ===== 4. CÂU HỎI TÌM HIỂU ===== */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-[#EDEDEF] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#4d8ee8]" />
                    Câu hỏi tìm hiểu
                  </div>

                  {/* knowIStar */}
                  <div>
                    <label htmlFor="knowIStar" className="form-label">
                      Bạn biết đến iStar qua kênh nào?{" "}
                      <span className="required">*</span>
                    </label>
                    <input
                      id="knowIStar"
                      type="text"
                      value={formData.knowIStar}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="VD: Fanpage iStar, Bạn bè giới thiệu, Buổi chào tân sinh viên..."
                      required
                    />
                  </div>

                  {/* reasonIStarer */}
                  <div>
                    <label htmlFor="reasonIStarer" className="form-label">
                      Lý do bạn muốn trở thành một iStar-er?{" "}
                      <span className="required">*</span>
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

                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-white bg-[#255798] rounded-xl hover:bg-[#316ebf] transition-all duration-300 shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_16px_rgba(37,87,152,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_0_1px_rgba(37,87,152,0.6),0_8px_32px_rgba(37,87,152,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang gửi hồ sơ...
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
      <motion.p
        {...fadeUp(0.5)}
        className="text-xs text-[#8A8F98]/50 mt-6 text-center"
      >
        © 2026 iStar — Câu lạc bộ Nghệ thuật | Đại học Công nghiệp Hà Nội (HaUI)
      </motion.p>
    </div>
  );
}
