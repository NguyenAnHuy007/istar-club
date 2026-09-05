"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  ArrowLeft,
  UserPlus,
  ShieldAlert,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { RegisterFormData } from "@/types/auth";
import { HAUI_SCHOOLS } from "@/constants/schools";
import authService from "@/services/authService";
import apiClient from "@/services/apiClient";
import axios from "axios";

interface CommonCodeItem {
  id: number;
  code: string;
  name: string;
}

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    school: "",
    majorClass: "",
    course: "",
    password: "",
    confirmPassword: "",
  });

  const [schools, setSchools] = useState<string[]>(HAUI_SCHOOLS);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Tải danh mục trường học từ backend (nếu có)
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: CommonCodeItem[] }>(
          "/api/public/common-codes?category=SCHOOL"
        );
        if (res.data.success && res.data.data?.length > 0) {
          setSchools(res.data.data.map((item) => item.name));
        }
      } catch {
        // Sử dụng danh sách tĩnh mặc định nếu API lỗi
      }
    };
    fetchSchools();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate tên đăng nhập
    const trimmedUsername = formData.username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      setErrorMsg("Tên đăng nhập phải có độ dài từ 3 đến 50 ký tự!");
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUsername)) {
      setErrorMsg("Tên đăng nhập chỉ bao gồm chữ cái, số, dấu gạch dưới hoặc chấm!");
      return;
    }

    // Validate mật khẩu
    if (formData.password.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        username: trimmedUsername,
        password: formData.password,
        email: formData.email.trim(),
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        school: formData.school.trim() || undefined,
        majorClass: formData.majorClass.trim() || undefined,
        course: formData.course.trim() || undefined,
      });

      setIsSuccess(true);
      // Chờ 1.5 giây rồi điều hướng sang trang login
      setTimeout(() => {
        router.push(`/login?registered=true`);
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!";
        setErrorMsg(msg);
      } else {
        setErrorMsg("Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fadeUp = (delay: number = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-lg">
        {/* Back to home */}
        <motion.div {...fadeUp(0)} className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về trang chủ
          </Link>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          {...fadeUp(0.05)}
          className="flex items-start gap-3 px-4 py-3 mb-4 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5"
        >
          <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-[#F59E0B]/90 leading-relaxed">
            Trang đăng ký <strong>chỉ dành cho thành viên</strong> câu lạc bộ
            iStar. Nếu bạn muốn ứng tuyển gia nhập, vui lòng truy cập{" "}
            <Link
              href="/apply"
              className="underline hover:text-[#F59E0B] font-medium transition-colors"
            >
              trang ứng tuyển
            </Link>
            .
          </p>
        </motion.div>

        {/* Register Card */}
        <motion.div {...fadeUp(0.1)} className="form-card p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div {...fadeUp(0.15)} className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#255798] to-[#4d8ee8] flex items-center justify-center shadow-[0_0_30px_rgba(37,87,152,0.4)]">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
            </motion.div>
            <motion.h1
              {...fadeUp(0.2)}
              className="text-2xl font-bold gradient-text mb-1"
            >
              Đăng ký tài khoản
            </motion.h1>
            <motion.p {...fadeUp(0.25)} className="text-sm text-[#8A8F98]">
              Tạo tài khoản dành cho thành viên iStar
            </motion.p>
          </div>

          {/* Banner thành công */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-medium">Đăng ký thành công!</p>
                <p className="text-xs text-emerald-400/80">
                  Đang chuyển hướng sang trang đăng nhập...
                </p>
              </div>
            </motion.div>
          )}

          {/* Banner lỗi */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username & Email row */}
            <motion.div {...fadeUp(0.28)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="form-label">
                  Tên đăng nhập <span className="required">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="form-input"
                  placeholder="nguyenvanan"
                  required
                  autoComplete="username"
                  disabled={isLoading || isSuccess}
                />
                <span className="text-[11px] text-[#8A8F98]/70 mt-1 block">
                  3-50 ký tự, viết liền không dấu
                </span>
              </div>
              <div>
                <label htmlFor="email" className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="form-input"
                  placeholder="email@example.com"
                  required
                  autoComplete="email"
                  disabled={isLoading || isSuccess}
                />
              </div>
            </motion.div>

            {/* Name row */}
            <motion.div {...fadeUp(0.32)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="form-label">
                  Họ đệm <span className="required">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="form-input"
                  placeholder="Nguyễn Văn"
                  required
                  disabled={isLoading || isSuccess}
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
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="form-input"
                  placeholder="An"
                  required
                  disabled={isLoading || isSuccess}
                />
              </div>
            </motion.div>

            {/* School with datalist */}
            <motion.div {...fadeUp(0.34)}>
              <label htmlFor="school" className="form-label">
                Trường / Khoa
              </label>
              <input
                id="school"
                type="text"
                list="school-list"
                value={formData.school}
                onChange={(e) =>
                  setFormData({ ...formData, school: e.target.value })
                }
                className="form-input"
                placeholder="Chọn hoặc nhập tên Trường / Khoa"
                disabled={isLoading || isSuccess}
              />
              <datalist id="school-list">
                {schools.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </motion.div>

            {/* Class + Course */}
            <motion.div {...fadeUp(0.36)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="majorClass" className="form-label">
                  Lớp chuyên ngành
                </label>
                <input
                  id="majorClass"
                  type="text"
                  value={formData.majorClass}
                  onChange={(e) =>
                    setFormData({ ...formData, majorClass: e.target.value })
                  }
                  className="form-input"
                  placeholder="KTPM01"
                  disabled={isLoading || isSuccess}
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
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  className="form-input"
                  placeholder="K16, K17..."
                  disabled={isLoading || isSuccess}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div {...fadeUp(0.38)}>
              <label htmlFor="password" className="form-label">
                Mật khẩu <span className="required">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="form-input"
                placeholder="Tối thiểu 6 ký tự"
                required
                autoComplete="new-password"
                disabled={isLoading || isSuccess}
              />
            </motion.div>

            {/* Confirm Password */}
            <motion.div {...fadeUp(0.4)}>
              <label htmlFor="confirmPassword" className="form-label">
                Xác nhận mật khẩu <span className="required">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="form-input"
                placeholder="Nhập lại mật khẩu"
                required
                autoComplete="new-password"
                disabled={isLoading || isSuccess}
              />
            </motion.div>

            {/* Submit */}
            <motion.div {...fadeUp(0.42)} className="pt-1">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#255798] rounded-xl hover:bg-[#316ebf] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_16px_rgba(37,87,152,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_0_1px_rgba(37,87,152,0.6),0_8px_32px_rgba(37,87,152,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang đăng ký...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Đăng ký thành viên</span>
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="section-divider my-6" />

          {/* Login link */}
          <motion.div {...fadeUp(0.45)} className="text-center">
            <p className="text-sm text-[#8A8F98]">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-[#255798] hover:text-[#316ebf] font-medium transition-colors duration-200"
              >
                Đăng nhập
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
