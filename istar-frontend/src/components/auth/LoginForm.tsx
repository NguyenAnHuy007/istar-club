"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Star, ArrowLeft, LogIn, Loader2, AlertCircle } from "lucide-react";
import { LoginFormData } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/user";
import axios from "axios";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const registered = searchParams.get("registered");

  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await login({
        username: formData.email.trim(),
        password: formData.password,
      });

      // Điều hướng theo quyền hoặc redirect param
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (res.role === Role.ADMIN) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!";
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
      <div className="w-full max-w-md">
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

        {/* Login Card */}
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
              Đăng nhập
            </motion.h1>
            <motion.p {...fadeUp(0.25)} className="text-sm text-[#8A8F98]">
              Chào mừng trở lại, iStarer!
            </motion.p>
          </div>

          {/* Banner thông báo đăng ký thành công nếu có param */}
          {registered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2"
            >
              <Star className="w-4 h-4 shrink-0 fill-emerald-400 text-emerald-400" />
              <span>Đăng ký tài khoản thành công! Vui lòng đăng nhập.</span>
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
            {/* Email / Username */}
            <motion.div {...fadeUp(0.3)}>
              <label htmlFor="email" className="form-label">
                Tên đăng nhập hoặc Email <span className="required">*</span>
              </label>
              <input
                id="email"
                type="text"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="form-input"
                placeholder="username hoặc email@example.com"
                required
                autoComplete="username"
                disabled={isLoading}
              />
            </motion.div>

            {/* Password */}
            <motion.div {...fadeUp(0.35)}>
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
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </motion.div>

            {/* Submit */}
            <motion.div {...fadeUp(0.4)} className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#255798] rounded-xl hover:bg-[#316ebf] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_16px_rgba(37,87,152,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_0_1px_rgba(37,87,152,0.6),0_8px_32px_rgba(37,87,152,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="section-divider my-6" />

          {/* Register link */}
          <motion.div {...fadeUp(0.45)} className="text-center space-y-2">
            <p className="text-sm text-[#8A8F98]">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-[#255798] hover:text-[#316ebf] font-medium transition-colors duration-200"
              >
                Đăng ký
              </Link>
            </p>
            <p className="text-xs text-[#8A8F98]/50 italic">
              Đăng ký chỉ dành cho thành viên câu lạc bộ
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
