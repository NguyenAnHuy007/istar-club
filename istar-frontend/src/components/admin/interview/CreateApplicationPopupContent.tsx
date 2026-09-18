"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, Check, AlertCircle, ImagePlus, Trash2, Info, X, Loader2, MapPin, User, GraduationCap, Compass, HelpCircle } from "lucide-react";
import { Facebook } from "@/components/common/Icons";
import { isAxiosError } from "axios";
import SelectWithOther from "@/components/common/SelectWithOther";
import FilterDatePicker from "@/components/admin/common/FilterDatePicker";
import adminApplicationService from "@/services/adminApplicationService";
import interviewService from "@/services/interviewService";
import adminRecruitmentService from "@/services/adminRecruitmentService";
import { Department, Area } from "@/types/user";
import { ApplicationStatus } from "@/types/application";
import { RecruitmentDto } from "@/types/recruitment";
import { DEPARTMENTS_LIST } from "@/constants/departments";
import { notifyOpener } from "@/utils/broadcast";
import { getStoredArea } from "@/utils/area";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/context/ToastContext";
import { processCheckinPhoto } from "@/utils/imageProcessing";

export default function CreateApplicationPopupContent() {
  const [activeRecruitment, setActiveRecruitment] = useState<RecruitmentDto | null>(null);
  const [loadingRecruitment, setLoadingRecruitment] = useState(true);

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

  const {
    selectedFile,
    previewUrl,
    isDragging,
    fileInputRef,
    errorMsg: fileErrorMsg,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemoveFile,
  } = useFileUpload({
    maxSizeBytes: 10 * 1024 * 1024,
    autoCompress: false,
  });

  const { coursesList, schoolOptions } = useCommonCodes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const toast = useToast();

  const handleIncomingPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP).");
      return;
    }
    try {
      setIsProcessingPhoto(true);
      const processed = await processCheckinPhoto(file);
      await handleFileSelect(processed);
      toast.info("Ảnh đã tự động chuyển sang 3:4 (1500×2000px, ~1MB JPG)");
    } catch {
      toast.error("Không thể tự động xử lý ảnh. Vui lòng thử lại với ảnh khác.");
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const r = await adminRecruitmentService.getActiveRecruitment();
        setActiveRecruitment(r);
      } catch { /* no active */ } finally { setLoadingRecruitment(false); }
    };
    fetchActive();
  }, []);

  const handleDeptToggle = (dept: Department) => {
    setSelectedDepts((prev) => prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileErrorMsg) { toast.error(fileErrorMsg); return; }
    if (!activeRecruitment) { toast.warning("Hiện tại không có đợt tuyển nào đang mở."); return; }
    if (!email.trim() || !phoneNumber.trim()) { toast.warning("Vui lòng nhập Email và Số điện thoại."); return; }
    if (selectedDepts.length === 0) { toast.warning("Vui lòng chọn ít nhất một ban ứng tuyển."); return; }
    if (!knowIStar.trim() || !reasonIStarer.trim()) {
      toast.warning("Vui lòng điền đầy đủ câu hỏi tìm hiểu (Kênh biết đến iStar và Lý do ứng tuyển).");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await interviewService.createApplication({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
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
        status: ApplicationStatus.CHECKED_IN,
      });
      // Upload avatar if selected
      if (selectedFile && res?.id) {
        try {
          await adminApplicationService.uploadAvatar(res.id, selectedFile);
        } catch (uploadErr) {
          console.error("Lỗi khi tải ảnh đại diện:", uploadErr);
          toast.warning("Đã tạo đơn thành công nhưng chưa lưu được ảnh đại diện.");
        }
      }
      notifyOpener("APPLICATION_CREATED");
      setSuccessMsg("Đã tạo đơn thành công! Đơn có trạng thái ĐÃ CHECK-IN và sẵn sàng phỏng vấn.");
      toast.success("Tạo đơn offline thành công!");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Đã có lỗi xảy ra khi tạo đơn.");
      } else {
        toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally { setIsSubmitting(false); }
  };

  if (loadingRecruitment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0B0E]">
        <div className="w-8 h-8 border-2 border-[#255798] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (successMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0B0E] p-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Tạo đơn thành công!</h2>
          <p className="text-sm text-[#8A8F98]">{successMsg}</p>
          <button type="button" onClick={() => window.close()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-[#255798] hover:bg-[#316ebf] transition-all cursor-pointer">
            <X className="w-4 h-4" /><span>Đóng cửa sổ</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B0E] text-[#EDEDEF]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0D0E12]/85 backdrop-blur-md border-b border-white/[0.06]">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#255798]/60 to-transparent" />
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#255798]/20 border border-[#255798]/40 flex items-center justify-center text-[#4d8ee8] shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-white truncate">Tạo đơn ứng tuyển mới (Offline)</h1>
              <p className="text-xs text-[#8A8F98] truncate">Đợt tuyển: <span className="text-[#4d8ee8] font-medium">{activeRecruitment?.name || "Không có đợt active"}</span></p>
            </div>
          </div>
          <button type="button" onClick={() => window.close()}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#8A8F98] hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer">
            <X className="w-3.5 h-3.5" /><span>Đóng</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 p-3.5 sm:p-6 max-w-3xl mx-auto w-full">
        {/* Note banner */}
        <div className="flex gap-3 p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-[#8A8F98] leading-relaxed">
            <span className="font-semibold text-amber-400">Đơn tạo offline: </span>
            Đơn được tạo trực tiếp tại bàn lễ tân sẽ tự động có trạng thái <span className="text-white font-semibold">ĐÃ CHECK-IN</span> và được đưa vào hàng chờ phỏng vấn ngay lập tức.
          </div>
        </div>

        {!activeRecruitment && (
          <div className="flex gap-3 p-3.5 sm:p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-6">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-400">Hiện không có đợt tuyển nào đang hoạt động. Vui lòng kích hoạt một đợt tuyển trước.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-4">Ảnh chân dung ứng viên (tùy chọn)</h3>
            {previewUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-white/[0.08] bg-black/30 flex items-center justify-center min-h-[140px] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="max-h-56 max-w-full object-contain rounded-lg shadow-md aspect-[3/4]" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : isProcessingPhoto ? (
              <div className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border border-white/10 bg-white/[0.02]">
                <Loader2 className="w-6 h-6 text-[#4d8ee8] animate-spin" />
                <span className="text-xs text-[#8A8F98]">Đang tự động chuẩn hóa ảnh về 3:4 (1500×2000px, ~1MB JPG)...</span>
              </div>
            ) : (
              <div
                role="button" tabIndex={0}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleIncomingPhoto(f);
                }}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${isDragging ? "border-[#255798] bg-[#255798]/10" : "border-white/[0.1] hover:border-white/[0.2] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                <ImagePlus className={`w-8 h-8 ${isDragging ? "text-[#4d8ee8]" : "text-[#8A8F98]"}`} />
                <p className="text-sm text-[#8A8F98] text-center"><span className="text-[#4d8ee8] font-medium">Nhấn để chọn</span> hoặc kéo thả ảnh</p>
                <p className="text-xs text-[#8A8F98]/60">PNG, JPG, WEBP (Tự động crop chuẩn 3:4 dọc, 1500×2000px, ~1MB JPG)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleIncomingPhoto(f);
                e.target.value = "";
              }}
            />
          </div>

          {/* Thông tin cá nhân */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <div className="text-xs font-semibold text-[#EDEDEF] uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#4d8ee8]" />
              <span>1. Thông tin cá nhân</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div><label className="block text-xs font-medium text-[#8A8F98] mb-1">Họ đệm</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nguyễn Văn" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-[#8A8F98] mb-1">Tên <span className="text-rose-400">*</span></label>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="An" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-[#8A8F98] mb-1">Email <span className="text-rose-400">*</span></label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ungvien@gmail.com" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-[#8A8F98] mb-1">Số điện thoại <span className="text-rose-400">*</span></label>
                <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0912345678" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-[#8A8F98] mb-1">Ngày sinh</label>
                <FilterDatePicker
                  id="popup-birthday"
                  value={birthday}
                  onChange={setBirthday}
                  placeholder="Chọn ngày sinh..."
                  maxDate={new Date().toISOString().substring(0, 10)}
                />
              </div>
              <div><label className="block text-xs font-medium text-[#8A8F98] mb-1">Địa chỉ</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Hà Nội" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-medium text-[#8A8F98] mb-1">Link Facebook</label>
                <div className="relative">
                  <input type="url" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." className="w-full px-3 py-2 text-sm pl-9 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" />
                  <Facebook className="w-4 h-4 text-[#1877F2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Học vấn */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <div className="text-xs font-semibold text-[#EDEDEF] uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#4d8ee8]" />
              <span>2. Thông tin học tập</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div><label className="block text-xs font-medium text-[#8A8F98] mb-1">Trường / Khoa</label>
                <SelectWithOther value={school} onChange={setSchool} options={schoolOptions} placeholder="Chọn trường/khoa" /></div>
              <div><label className="block text-xs font-medium text-[#8A8F98] mb-1">Ngành / Lớp</label>
                <input type="text" value={majorClass} onChange={(e) => setMajorClass(e.target.value)} placeholder="CNTT 01 - K18" className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-[#255798] focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-[#8A8F98] mb-1">Khóa</label>
                <SelectWithOther value={course} onChange={setCourse} options={coursesList} placeholder="Chọn khóa (K18, K19...)" /></div>
            </div>
          </div>

          {/* Cơ sở phỏng vấn */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#4d8ee8]" />
              <div className="text-xs font-semibold text-[#EDEDEF] uppercase tracking-wider">3. Cơ sở phỏng vấn <span className="text-rose-400">*</span></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setArea(Area.NINH_BINH)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  area === Area.NINH_BINH
                    ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
                    : "bg-white/[0.02] border-white/[0.08] text-[#8A8F98] hover:border-white/20"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    Cơ sở 3 (Ninh Bình)
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Mặc định</span>
                  </div>
                </div>
                {area === Area.NINH_BINH && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setArea(Area.HANOI)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
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

          {/* Ban đăng ký */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-semibold text-[#EDEDEF] uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#4d8ee8]" />
                <span>4. Nguyện vọng ban <span className="text-rose-400">*</span></span>
              </div>
              <span className="text-xs text-[#8A8F98]">Đã chọn: {selectedDepts.length} ban</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEPARTMENTS_LIST.map((dept) => {
                const isSelected = selectedDepts.includes(dept.code);
                return (
                  <div key={dept.code} onClick={() => handleDeptToggle(dept.code)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${isSelected ? "bg-[#255798]/15 border-[#255798]/60 shadow-[0_0_15px_rgba(37,87,152,0.2)]" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"}`}>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected ? "bg-[#255798] border-[#4d8ee8] text-white" : "border-white/20 bg-white/[0.02]"}`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div><p className="text-sm font-medium text-white">{dept.name}</p></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Câu hỏi tìm hiểu */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <div className="text-xs font-semibold text-[#EDEDEF] uppercase tracking-wider mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#4d8ee8]" />
              <span>5. Câu hỏi tìm hiểu <span className="text-rose-400">*</span></span>
            </div>
            <div className="space-y-4">
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

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pb-6">
            <button type="button" onClick={() => window.close()} disabled={isSubmitting}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#8A8F98] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/[0.08] transition-colors cursor-pointer">
              <X className="w-3.5 h-3.5" /><span>Hủy</span>
            </button>
            <button type="submit" disabled={isSubmitting || !activeRecruitment}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#255798] to-[#3a75c4] hover:from-[#316ebf] hover:to-[#4d8ee8] shadow-[0_0_20px_rgba(37,87,152,0.35)] transition-all cursor-pointer disabled:opacity-50">
              {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Đang tạo đơn...</span></>) : (<><UserCheck className="w-4 h-4" /><span>Tạo đơn & Check-in</span></>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}