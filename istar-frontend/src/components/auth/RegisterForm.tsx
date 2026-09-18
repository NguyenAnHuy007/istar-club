"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
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
import commonCodeService from "@/services/commonCodeService";
import CustomSelect from "@/components/common/CustomSelect";
import axios from "axios";

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    school: "",
    password: "",
    confirmPassword: "",
  });

  const [schools, setSchools] = useState<string[]>(HAUI_SCHOOLS);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Tải danh mục trường học từ backend
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await commonCodeService.getSchools();
        if (data && data.length > 0) {
          setSchools(data.map((item) => item.name));
        }
      } catch {
        // Sử dụng danh sách tĩnh HAUI_SCHOOLS nếu API lỗi
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
      });

      setIsSuccess(true);
      // Chờ 2.5 giây rồi điều hướng sang trang login với cờ pending_activation
      setTimeout(() => {
        router.push(`/login?pending_activation=true`);
      }, 2500);
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
              className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm flex items-start gap-3 shadow-[0_0_24px_rgba(245,158,11,0.1)]"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div className="space-y-1 text-left">
                <p className="font-semibold text-emerald-400">Đăng ký tài khoản thành công!</p>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Tài khoản của bạn đã được tạo và đang ở trạng thái <strong>Chờ Quản trị viên kích hoạt</strong>. Bạn sẽ có thể đăng nhập sau khi được phê duyệt.
                </p>
                <p className="text-[11px] text-[#8A8F98] pt-1">
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

            {/* School with CustomSelect */}
            <motion.div {...fadeUp(0.34)}>
              <label htmlFor="school" className="form-label">
                Trường / Khoa
              </label>
              <CustomSelect
                value={formData.school}
                onChange={(val) =>
                  setFormData({ ...formData, school: val })
                }
                options={schools.map((s) => ({ value: s, label: s }))}
                placeholder="-- Chọn Trường / Khoa --"
                disabled={isLoading || isSuccess}
              />
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
