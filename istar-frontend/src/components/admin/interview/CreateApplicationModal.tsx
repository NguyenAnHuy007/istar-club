"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Check, AlertCircle, MapPin, User, GraduationCap, Compass, HelpCircle } from "lucide-react";
import { Facebook } from "@/components/common/Icons";
import { isAxiosError } from "axios";
import SelectWithOther from "@/components/common/SelectWithOther";
import FilterDatePicker from "@/components/admin/common/FilterDatePicker";
import interviewService from "@/services/interviewService";
import { Department, Area } from "@/types/user";
import { RecruitmentDto } from "@/types/recruitment";
import { DEPARTMENTS_LIST } from "@/constants/departments";
import { getStoredArea } from "@/utils/area";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { useToast } from "@/context/ToastContext";

interface CreateApplicationModalProps {
  isOpen: boolean;
  activeRecruitment: RecruitmentDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateApplicationModal({
  isOpen,
  activeRecruitment,
  onClose,
  onSuccess,
}: CreateApplicationModalProps) {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [address, setAddress] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [school, setSchool] = useState("");
  const [majorClass, setMajorClass] = useState("");
  const [course, setCourse] = useState("");
  const [area, setArea] = useState<Area>(() => getStoredArea() || Area.NINH_BINH);
  const [selectedDepts, setSelectedDepts] = useState<Department[]>([]);
  const [knowIStar, setKnowIStar] = useState("");
  const [reasonIStarer, setReasonIStarer] = useState("");

  const { coursesList, schoolOptions } = useCommonCodes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleDeptToggle = (dept: Department) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeRecruitment) {
      toast.warning("Hiện tại không có đợt tuyển thành viên nào đang mở.");
      return;
    }

    if (!email.trim() || !phoneNumber.trim()) {
      toast.warning("Vui lòng nhập Email và Số điện thoại.");
      return;
    }

    if (selectedDepts.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một ban ứng tuyển.");
      return;
    }

    if (!knowIStar.trim() || !reasonIStarer.trim()) {
      toast.warning("Vui lòng trả lời đầy đủ 2 câu hỏi tìm hiểu.");
      return;
    }

    setIsSubmitting(true);

    try {
      await interviewService.createApplication({
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        birthday: birthday || undefined,
        address: address.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        school: school.trim() || undefined,
        majorClass: majorClass.trim() || undefined,
        course: course.trim() || undefined,
        area: area || Area.NINH_BINH,
        departments: selectedDepts.map((d) => ({ department: d })),
        recruitmentId: activeRecruitment.id,
        knowIStar: knowIStar.trim(),
        reasonIStarer: reasonIStarer.trim(),
      });

      toast.success("Tạo đơn ứng tuyển thành công!");
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error("Lỗi tạo đơn:", err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Đã có lỗi xảy ra khi tạo đơn.");
      } else {
        toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setLastName("");
    setFirstName("");
    setEmail("");
    setPhoneNumber("");
    setBirthday("");
    setAddress("");
    setFacebookUrl("");
    setSchool("");
    setMajorClass("");
    setCourse("");
    setArea(getStoredArea() || Area.NINH_BINH);
    setSelectedDepts([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0D0E12] border border-white/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.7)] text-[#EDEDEF] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/[0.06] gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#255798]/20 border border-[#255798]/40 flex items-center justify-center text-[#4d8ee8] shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-semibold text-white truncate">
                  Tạo đơn ứng tuyển mới (Offline)
                </h2>
                <p className="text-xs text-[#8A8F98] truncate">
                  Đợt tuyển:{" "}
                  <span className="text-[#4d8ee8] font-medium">
                    {activeRecruitment?.name || "Không có đợt active"}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-[#8A8F98] hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Basic Info */}
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#EDEDEF] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#4d8ee8]" />
                <span>1. Thông tin cá nhân</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Họ đệm
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nguyễn Văn"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Tên <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="An"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ungvien@gmail.com"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Số điện thoại <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Ngày sinh
                  </label>
                  <FilterDatePicker
                    id="modal-birthday"
                    value={birthday}
                    onChange={setBirthday}
                    placeholder="Chọn ngày sinh..."
                    maxDate={new Date().toISOString().substring(0, 10)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Hà Nội"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Link Facebook
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 text-sm pl-9 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none transition-colors"
                    />
                    <Facebook className="w-4 h-4 text-[#1877F2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Education Info */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#EDEDEF] uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#4d8ee8]" />
                <span>2. Thông tin học tập</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Trường / Khoa
                  </label>
                  <SelectWithOther
                    value={school}
                    onChange={setSchool}
                    options={schoolOptions}
                    placeholder="Chọn trường/khoa"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Ngành / Lớp
                  </label>
                  <input
                    type="text"
                    value={majorClass}
                    onChange={(e) => setMajorClass(e.target.value)}
                    placeholder="CNTT 01 - K18"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Khóa
                  </label>
                  <SelectWithOther
                    value={course}
                    onChange={setCourse}
                    options={coursesList}
                    placeholder="Chọn khóa (K18, K19...)"
                  />
                </div>
              </div>
            </div>

            {/* Area selection */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#EDEDEF] uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#4d8ee8]" />
                <span>3. Cơ sở phỏng vấn <span className="text-rose-400">*</span></span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setArea(Area.NINH_BINH)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    area === Area.NINH_BINH
                      ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
                      : "bg-white/[0.02] border-white/[0.08] text-[#8A8F98] hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      Cơ sở 3 (Ninh Bình)
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        Mặc định
                      </span>
                    </div>
                  </div>
                  {area === Area.NINH_BINH && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setArea(Area.HANOI)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    area === Area.HANOI
                      ? "bg-[#255798]/20 border-[#255798]/60 text-white shadow-[0_0_15px_rgba(37,87,152,0.2)] ring-1 ring-[#255798]/50"
                      : "bg-white/[0.02] border-white/[0.08] text-[#8A8F98] hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">Cơ sở 1 (Hà Nội)</div>
                  </div>
                  {area === Area.HANOI && <Check className="w-4 h-4 text-[#4d8ee8]" />}
                </button>
              </div>
            </div>

            {/* Department selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-[#EDEDEF] uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#4d8ee8]" />
                  <span>4. Nguyện vọng ban <span className="text-rose-400">*</span></span>
                </div>
                <span className="text-xs text-[#8A8F98]">
                  Đã chọn: {selectedDepts.length} ban
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEPARTMENTS_LIST.map((dept) => {
                  const isSelected = selectedDepts.includes(dept.code);
                  return (
                    <div
                      key={dept.code}
                      onClick={() => handleDeptToggle(dept.code)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-[#255798]/15 border-[#255798]/60 shadow-[0_0_15px_rgba(37,87,152,0.2)]"
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "bg-[#255798] border-[#4d8ee8] text-white"
                            : "border-white/20 bg-white/[0.02]"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {dept.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Questionnaire */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#EDEDEF] uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#4d8ee8]" />
                <span>5. Câu hỏi tìm hiểu <span className="text-rose-400">*</span></span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Bạn biết đến iStar qua kênh nào? <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={knowIStar}
                    onChange={(e) => setKnowIStar(e.target.value)}
                    placeholder="VD: Fanpage iStar, Bạn bè giới thiệu, Buổi chào tân sinh viên..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8A8F98] mb-1">
                    Lý do bạn muốn trở thành một iStar-er? <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={reasonIStarer}
                    ref={(el) => {
                      if (el) {
                        el.style.height = "auto";
                        el.style.height = `${Math.max(el.scrollHeight, 60)}px`;
                      }
                    }}
                    onInput={(e) => {
                      const target = e.currentTarget;
                      target.style.height = "auto";
                      target.style.height = `${Math.max(target.scrollHeight, 60)}px`;
                    }}
                    onChange={(e) => setReasonIStarer(e.target.value)}
                    placeholder="Chia sẻ về đam mê nghệ thuật, nguyện vọng và mục tiêu của bạn..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none resize-y overflow-y-auto min-h-[60px]"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 border-t border-white/[0.06] bg-white/[0.01]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#8A8F98] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Hủy</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#255798] to-[#3a75c4] hover:from-[#316ebf] hover:to-[#4d8ee8] shadow-[0_0_20px_rgba(37,87,152,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? "Đang tạo đơn..." : "Tạo đơn ứng tuyển"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
