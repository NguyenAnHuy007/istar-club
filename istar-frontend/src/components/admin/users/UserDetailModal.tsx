"use client";

import { useState, useEffect } from "react";
import {
  User,
  UpdateUserRequest,
  Role,
  Position,
  Area,
  Department,
} from "@/types/user";
import { adminUserService } from "@/services/adminUserService";
import {
  X,
  Save,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Check,
  Music,
  Mic,
  Activity,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect, { Option } from "@/components/common/CustomSelect";
import { HAUI_SCHOOLS } from "@/constants/schools";

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

const DEPARTMENTS_DATA: {
  code: Department;
  name: string;
  icon: typeof Music;
  desc: string;
}[] = [
  {
    code: Department.MUSIC,
    name: "Ban Âm nhạc",
    icon: Music,
    desc: "Thanh nhạc, nhạc cụ & biểu diễn",
  },
  {
    code: Department.RAP,
    name: "Ban Rap",
    icon: Mic,
    desc: "Sáng tác, lyric & freestyle",
  },
  {
    code: Department.DANCE,
    name: "Ban Vũ đạo",
    icon: Activity,
    desc: "K-pop, hip-hop, choreography",
  },
  {
    code: Department.MEDIA_AND_EVENT,
    name: "Ban Truyền thông & Sự kiện",
    icon: Video,
    desc: "Nhiếp ảnh, thiết kế & tổ chức",
  },
];

const ROLE_OPTIONS: Option[] = [
  { value: Role.ADMIN, label: "Quản trị viên (ADMIN)" },
  { value: Role.MODERATOR, label: "Điều phối viên (MODERATOR)" },
  { value: Role.MEMBER, label: "Thành viên (MEMBER)" },
];

const POSITION_OPTIONS: Option[] = [
  { value: Position.PRESIDENT, label: "Chủ nhiệm (PRESIDENT)" },
  { value: Position.VICE_PRESIDENT, label: "Phó chủ nhiệm (VICE_PRESIDENT)" },
  { value: Position.HEAD_OF_DEPARTMENT, label: "Trưởng ban (HEAD_OF_DEPARTMENT)" },
  { value: Position.DEPUTY_HEAD_OF_DEPARTMENT, label: "Phó ban (DEPUTY_HEAD_OF_DEPARTMENT)" },
  { value: Position.MEMBER, label: "Thành viên (MEMBER)" },
  { value: Position.CANDIDATE, label: "Ứng viên (CANDIDATE)" },
];

const AREA_OPTIONS: Option[] = [
  { value: Area.HANOI, label: "Hà Nội" },
  { value: Area.NINH_BINH, label: "Ninh Bình" },
];

export default function UserDetailModal({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}: UserDetailModalProps) {
  const [formData, setFormData] = useState<UpdateUserRequest>({});
  const [selectedDepts, setSelectedDepts] = useState<Department[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        birthday: user.birthday,
        address: user.address,
        school: user.school,
        majorClass: user.majorClass,
        course: user.course,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        role: user.role,
        position: user.position,
        area: user.area,
        generationId: user.generationId,
      });

      // Lấy danh sách ban từ userDepartments
      const existingDepts =
        user.userDepartments?.map((ud) => ud.department) || [];
      setSelectedDepts(existingDepts);

      setError(null);
    }
  }, [user, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof UpdateUserRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDepartment = (deptCode: Department) => {
    setSelectedDepts((prev) => {
      if (prev.includes(deptCode)) {
        return prev.filter((d) => d !== deptCode);
      } else {
        return [...prev, deptCode];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError(null);

    // Chuyển danh sách ban được chọn thành userDepartments
    const updatedPayload: UpdateUserRequest = {
      ...formData,
      userDepartments: selectedDepts.map((d) => ({
        department: d,
        position: formData.position || Position.MEMBER,
      })),
    };

    try {
      await adminUserService.updateUser(user.id, updatedPayload);
      onUserUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi cập nhật.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    setIsSaving(true);
    setError(null);
    try {
      if (user.isActive) {
        await adminUserService.deactivateUser(user.id);
      } else {
        await adminUserService.activateUser(user.id);
      }
      onUserUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi thay đổi trạng thái.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa (Soft delete) tài khoản @${user.username} không?`
    );
    if (!confirmDelete) return;

    setIsSaving(true);
    setError(null);
    try {
      await adminUserService.softDeleteUser(user.id);
      onUserUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi xóa người dùng.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !user) return null;

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#09090e] border border-white/[0.1] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#255798] to-[#4d8ee8] flex items-center justify-center text-white font-bold text-base shadow-[0_0_20px_rgba(37,87,152,0.4)] shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-[#EDEDEF] truncate">
                    {displayName}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      user.isActive
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        : "bg-red-500/15 text-red-400 border border-red-500/25"
                    }`}
                  >
                    {user.isActive ? "Đang hoạt động" : "Đã vô hiệu"}
                  </span>
                </div>
                <p className="text-xs text-[#8A8F98] font-mono">
                  @{user.username}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#8A8F98] hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form
              id="user-update-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* PHẦN 1: BAN HOẠT ĐỘNG (DEPARTMENT CHECKBOXES) */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#EDEDEF]">
                      Ban tham gia hoạt động (Department)
                    </h3>
                    <p className="text-xs text-[#8A8F98] mt-0.5">
                      Thành viên có thể tham gia cùng lúc một hoặc nhiều ban của
                      CLB.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#4d8ee8] bg-[#255798]/20 px-2.5 py-1 rounded-lg border border-[#255798]/30">
                    {selectedDepts.length} ban đã chọn
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEPARTMENTS_DATA.map((dept) => {
                    const isChecked = selectedDepts.includes(dept.code);
                    const DeptIcon = dept.icon;

                    return (
                      <div
                        key={dept.code}
                        onClick={() => toggleDepartment(dept.code)}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                          isChecked
                            ? "bg-[#255798]/20 border-[#4d8ee8] shadow-[0_0_16px_rgba(37,87,152,0.25)]"
                            : "bg-black/30 hover:bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isChecked
                              ? "bg-[#255798] border-[#4d8ee8] text-white"
                              : "border-white/30 bg-black/40"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <DeptIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isChecked ? "text-[#4d8ee8]" : "text-[#8A8F98]"
                              }`}
                            />
                            <p
                              className={`text-sm font-medium leading-tight truncate ${
                                isChecked ? "text-[#EDEDEF]" : "text-[#8A8F98]"
                              }`}
                            >
                              {dept.name}
                            </p>
                          </div>
                          <p className="text-[11px] text-[#8A8F98]/70 mt-1 leading-tight line-clamp-1">
                            {dept.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN 2: THÔNG TIN CÁ NHÂN */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-4">
                <h3 className="text-sm font-semibold text-[#EDEDEF]">
                  Thông tin cá nhân & Liên hệ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                      Họ đệm
                    </label>
                    <input
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Hoàng"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm text-[#EDEDEF] focus:border-[#4d8ee8] focus:ring-1 focus:ring-[#4d8ee8] outline-none transition-all placeholder-[#8A8F98]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                      Tên
                    </label>
                    <input
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      placeholder="Việt"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm text-[#EDEDEF] focus:border-[#4d8ee8] focus:ring-1 focus:ring-[#4d8ee8] outline-none transition-all placeholder-[#8A8F98]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm text-[#EDEDEF] focus:border-[#4d8ee8] focus:ring-1 focus:ring-[#4d8ee8] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                      Số điện thoại
                    </label>
                    <input
                      name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleInputChange}
                      placeholder="0912345678"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm text-[#EDEDEF] focus:border-[#4d8ee8] focus:ring-1 focus:ring-[#4d8ee8] outline-none transition-all placeholder-[#8A8F98]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                      Trường / Khoa
                    </label>
                    <input
                      name="school"
                      list="school-options"
                      value={formData.school || ""}
                      onChange={handleInputChange}
                      placeholder="Trường Công nghệ Thông tin"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm text-[#EDEDEF] focus:border-[#4d8ee8] focus:ring-1 focus:ring-[#4d8ee8] outline-none transition-all placeholder-[#8A8F98]/40"
                    />
                    <datalist id="school-options">
                      {HAUI_SCHOOLS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                        Lớp chuyên ngành
                      </label>
                      <input
                        name="majorClass"
                        value={formData.majorClass || ""}
                        onChange={handleInputChange}
                        placeholder="KTPM01"
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm text-[#EDEDEF] focus:border-[#4d8ee8] focus:ring-1 focus:ring-[#4d8ee8] outline-none transition-all placeholder-[#8A8F98]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                        Khóa
                      </label>
                      <input
                        name="course"
                        value={formData.course || ""}
                        onChange={handleInputChange}
                        placeholder="K17"
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm text-[#EDEDEF] focus:border-[#4d8ee8] focus:ring-1 focus:ring-[#4d8ee8] outline-none transition-all placeholder-[#8A8F98]/40"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PHẦN 3: PHÂN QUYỀN & CHỨC VỤ */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-4">
                <h3 className="text-sm font-semibold text-[#EDEDEF]">
                  Phân quyền & Chức vụ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                      Role hệ thống
                    </label>
                    <CustomSelect
                      value={formData.role || ""}
                      onChange={(val) => handleSelectChange("role", val)}
                      options={ROLE_OPTIONS}
                      placeholder="Chọn role..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                      Chức vụ trong CLB
                    </label>
                    <CustomSelect
                      value={formData.position || ""}
                      onChange={(val) => handleSelectChange("position", val)}
                      options={POSITION_OPTIONS}
                      placeholder="Chọn chức vụ..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                      Cơ sở / Khu vực
                    </label>
                    <CustomSelect
                      value={formData.area || ""}
                      onChange={(val) => handleSelectChange("area", val)}
                      options={AREA_OPTIONS}
                      placeholder="Chọn cơ sở..."
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 4: ĐỔI MẬT KHẨU */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                  Đổi mật khẩu mới (Bỏ trống nếu giữ nguyên mật khẩu cũ)
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm text-[#EDEDEF] focus:border-[#4d8ee8] focus:ring-1 focus:ring-[#4d8ee8] outline-none transition-all placeholder-[#8A8F98]/40"
                />
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-shrink-0 items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] gap-4">
            {/* Quick Status / Delete Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isSaving}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                  user.isActive
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                {user.isActive ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Vô hiệu hóa</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Kích hoạt</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                title="Xóa mềm tài khoản"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa mềm</span>
              </button>
            </div>

            {/* Save & Cancel */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-medium text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05] rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="user-update-form"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#255798] hover:bg-[#316ebf] text-white text-xs font-medium rounded-xl transition-all duration-200 disabled:opacity-50 shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_16px_rgba(37,87,152,0.35)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
