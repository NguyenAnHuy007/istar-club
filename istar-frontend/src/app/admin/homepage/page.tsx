"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Save,
  Globe,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Music,
  Mic,
  Footprints,
  Megaphone,
  Camera,
  Heart,
  Palette,
  Film,
  Users,
  Radio,
  Tv,
  Award,
  Layers,
  Info,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Check,
  Crop as CropIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/admin/common/PageHeader";
import ImageEditorModal from "@/components/common/ImageEditorModal";
import { landingService } from "@/services/landingService";
import { useToast } from "@/context/ToastContext";
import {
  HomepageConfig,
  DepartmentItem,
  AchievementItem,
} from "@/types/landing";

// Bộ icon gợi ý cho các ban nghệ thuật
const AVAILABLE_ICONS = [
  { label: "Âm nhạc (Music)", value: "Music", icon: Music },
  { label: "Rap / Micro (Mic)", value: "Mic", icon: Mic },
  { label: "Vũ đạo (Footprints)", value: "Footprints", icon: Footprints },
  { label: "Truyền thông (Megaphone)", value: "Megaphone", icon: Megaphone },
  { label: "Nhiếp ảnh (Camera)", value: "Camera", icon: Camera },
  { label: "Tình nguyện / Yêu thương (Heart)", value: "Heart", icon: Heart },
  { label: "Mỹ thuật / Thiết kế (Palette)", value: "Palette", icon: Palette },
  { label: "Điện ảnh / Video (Film)", value: "Film", icon: Film },
  { label: "Tập thể / Đối ngoại (Users)", value: "Users", icon: Users },
  { label: "Phát thanh / Podcast (Radio)", value: "Radio", icon: Radio },
  { label: "Truyền hình / Media (Tv)", value: "Tv", icon: Tv },
  { label: "Giải thưởng (Award)", value: "Award", icon: Award },
];

// Danh sách preset gradient màu sắc đẹp mắt
const COLOR_PRESETS = [
  {
    name: "Xanh iStar",
    gradient: "from-[#255798] to-[#4d8ee8]",
    glowColor: "rgba(37, 87, 152, 0.25)",
  },
  {
    name: "Hồng Rap",
    gradient: "from-[#EC4899] to-[#F472B6]",
    glowColor: "rgba(236, 72, 153, 0.2)",
  },
  {
    name: "Vàng Vũ đạo",
    gradient: "from-[#F59E0B] to-[#FBBF24]",
    glowColor: "rgba(245, 158, 11, 0.2)",
  },
  {
    name: "Xanh Sự kiện",
    gradient: "from-[#10B981] to-[#34D399]",
    glowColor: "rgba(16, 185, 129, 0.2)",
  },
  {
    name: "Tím Nghệ thuật",
    gradient: "from-[#8B5CF6] to-[#C084FC]",
    glowColor: "rgba(139, 92, 246, 0.2)",
  },
  {
    name: "Đỏ Rực rỡ",
    gradient: "from-[#EF4444] to-[#F87171]",
    glowColor: "rgba(239, 68, 68, 0.2)",
  },
];

/**
 * Dropdown chọn Icon ban theo chuẩn Common UI Kit
 */
function CustomIconSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = AVAILABLE_ICONS.find((ic) => ic.value === value) || AVAILABLE_ICONS[0];
  const IconComp = selected.icon;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative select-none">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-9 px-3 flex items-center justify-between gap-2 text-xs rounded-lg bg-white/[0.03] border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#255798] ${isOpen
            ? "border-[#255798] bg-[#0c0c14] shadow-[0_0_12px_rgba(37,87,152,0.25)]"
            : "border-white/10 hover:border-white/20 text-[#EDEDEF]"
          }`}
      >
        <div className="flex items-center gap-2 truncate">
          <IconComp className="w-3.5 h-3.5 text-[#4d8ee8] shrink-0" />
          <span className="truncate">{selected.label}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8A8F98] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#4d8ee8]" : ""
            }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 min-w-[220px] max-h-56 overflow-y-auto p-1.5 rounded-xl bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.85)] space-y-0.5 scrollbar-thin scrollbar-thumb-white/10"
          >
            {AVAILABLE_ICONS.map((ic) => {
              const ItemIcon = ic.icon;
              const isSelected = ic.value === value;
              return (
                <div
                  key={ic.value}
                  onClick={() => {
                    onChange(ic.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${isSelected
                      ? "bg-[#255798]/20 text-[#4d8ee8] font-medium border border-[#255798]/30"
                      : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06]"
                    }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#4d8ee8]" : "text-[#8A8F98]"}`} />
                    <span className="truncate">{ic.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#4d8ee8]" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Dropdown chọn dải màu gradient theo chuẩn Common UI Kit
 */
function CustomColorPresetSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (preset: (typeof COLOR_PRESETS)[0]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = COLOR_PRESETS.find((p) => p.gradient === value) || COLOR_PRESETS[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative select-none">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-9 px-3 flex items-center justify-between gap-2 text-xs rounded-lg bg-white/[0.03] border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#255798] ${isOpen
            ? "border-[#255798] bg-[#0c0c14] shadow-[0_0_12px_rgba(37,87,152,0.25)]"
            : "border-white/10 hover:border-white/20 text-[#EDEDEF]"
          }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className={`w-4 h-2.5 rounded-full bg-gradient-to-r ${selected.gradient} shrink-0`} />
          <span className="truncate">{selected.name}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8A8F98] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#4d8ee8]" : ""
            }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 min-w-[200px] max-h-56 overflow-y-auto p-1.5 rounded-xl bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.85)] space-y-0.5 scrollbar-thin scrollbar-thumb-white/10"
          >
            {COLOR_PRESETS.map((p) => {
              const isSelected = p.gradient === value;
              return (
                <div
                  key={p.gradient}
                  onClick={() => {
                    onChange(p);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${isSelected
                      ? "bg-[#255798]/20 text-[#4d8ee8] font-medium border border-[#255798]/30"
                      : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06]"
                    }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-4 h-2.5 rounded-full bg-gradient-to-r ${p.gradient} shrink-0`} />
                    <span className="truncate">{p.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#4d8ee8]" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminHomepageManagementPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "departments" | "achievements">("hero");
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<Record<string, { file: File; objectUrl: string }>>({});
  const toast = useToast();

  // Clean up any remaining blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(pendingFiles).forEach((item) => {
        URL.revokeObjectURL(item.objectUrl);
      });
    };
  }, [pendingFiles]);

  // Image Editor Modal State
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    file: File | null;
    aspectRatio?: number;
    title?: string;
    onConfirm: ((file: File) => void) | null;
  }>({
    isOpen: false,
    file: null,
    aspectRatio: undefined,
    title: undefined,
    onConfirm: null,
  });

  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await landingService.getAdminHomepageConfig();
      setConfig(data);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không thể tải cấu hình trang chủ!";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const clearPendingFile = (fieldKey: string) => {
    setPendingFiles((prev) => {
      if (!prev[fieldKey]) return prev;
      URL.revokeObjectURL(prev[fieldKey].objectUrl);
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  const handleSave = async () => {
    if (!config) return;

    // Validate departments
    const deptCount = config.departments?.items?.length || 0;
    if (deptCount < 2 || deptCount > 6) {
      toast.error(`Số lượng ban phải từ 2 đến 6 ban (hiện có ${deptCount} ban)!`);
      setActiveTab("departments");
      return;
    }

    try {
      setIsSaving(true);

      // 1. Tải lên các file đang chờ (deferred pending files) nếu còn được dùng trong cấu hình
      let currentConfig = { ...config };
      const pendingEntries = Object.entries(pendingFiles);

      if (pendingEntries.length > 0) {
        let jsonStr = JSON.stringify(currentConfig);

        for (const [key, pending] of pendingEntries) {
          if (jsonStr.includes(pending.objectUrl)) {
            try {
              setUploadingField(key);
              const serverUrl = await landingService.uploadLandingImage(pending.file);
              jsonStr = jsonStr.replaceAll(pending.objectUrl, serverUrl);
            } catch (uploadErr) {
              const errorMsg =
                (uploadErr as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (uploadErr instanceof Error ? uploadErr.message : "Lỗi khi tải ảnh lên server!");
              toast.error(`Lỗi tải ảnh (${key}): ${errorMsg}`);
              throw uploadErr;
            }
          }
          URL.revokeObjectURL(pending.objectUrl);
        }

        currentConfig = JSON.parse(jsonStr);
        setPendingFiles({});
      }

      // 2. Gửi cấu hình hoàn chỉnh lên server
      const saved = await landingService.updateHomepageConfig(currentConfig);
      setConfig(saved);
      toast.success("Đã lưu toàn bộ cấu hình trang chủ thành công!");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Lỗi khi lưu cấu hình trang chủ!";
      toast.error(errorMsg);
    } finally {
      setUploadingField(null);
      setIsSaving(false);
    }
  };

  /**
   * Chọn file ảnh, validate định dạng & dung lượng, sau đó mở ImageEditorModal
   */
  const handleSelectFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string,
    callback: (url: string) => void,
    aspectPreset?: number,
    title?: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate MIME type và đuôi file
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const isValidType = file.type && ALLOWED_TYPES.includes(file.type.toLowerCase());
    const validExtRegex = /\.(jpe?g|png|webp|gif)$/i;
    const isValidExt = validExtRegex.test(file.name);

    if (!isValidType || !isValidExt) {
      toast.error("Định dạng file không hợp lệ! Vui lòng chọn ảnh định dạng JPG, JPEG, PNG, WEBP hoặc GIF.");
      e.target.value = "";
      return;
    }

    // 2. Validate giới hạn 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      toast.warning(`Dung lượng ảnh (${sizeMB}MB) vượt quá giới hạn 10MB! Hãy dùng trình chỉnh sửa để nén hoặc thu nhỏ ảnh.`);
    }

    // Mở modal chỉnh sửa ảnh
    setEditorState({
      isOpen: true,
      file,
      aspectRatio: aspectPreset,
      title: title || "Chỉnh sửa hình ảnh",
      onConfirm: async (processedFile: File) => {
        if (processedFile.size > MAX_SIZE) {
          toast.warning("Dung lượng ảnh sau xử lý vẫn vượt quá 10MB! Vui lòng nén thêm.");
          return;
        }

        // Thu hồi URL xem trước cũ nếu có cho trường này
        if (pendingFiles[fieldKey]?.objectUrl) {
          URL.revokeObjectURL(pendingFiles[fieldKey].objectUrl);
        }

        // Tạo objectUrl xem trước cục bộ (0 byte gửi server, không gây rác bộ nhớ)
        const objectUrl = URL.createObjectURL(processedFile);
        setPendingFiles((prev) => ({
          ...prev,
          [fieldKey]: { file: processedFile, objectUrl },
        }));

        // Gọi callback cập nhật state xem trước tức thì
        callback(objectUrl);
        toast.info("Đã chọn ảnh xem trước! Nhấn 'Lưu thay đổi' ở góc trên để lưu ảnh lên hệ thống.");
      },
    });

    e.target.value = "";
  };

  if (isLoading || !config) {
    return (
      <div className="max-w-[1720px] w-full mx-auto pb-12">
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#255798] animate-spin" />
          <p className="text-xs text-[#8A8F98]">Đang tải cấu hình trang chủ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1720px] w-full mx-auto pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          badge="Hệ Thống"
          title="Quản lý Trang chủ"
          description="Tùy biến nội dung, hình ảnh và danh mục các ban, thành tích hiển thị trên landing page"
        />

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 inline-flex items-center gap-2 px-4 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-medium text-[#EDEDEF] hover:bg-white/[0.08] hover:text-white transition-all"
          >
            <ExternalLink className="w-4 h-4 text-[#8A8F98]" />
            <span>Xem trang chủ</span>
          </a>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 inline-flex items-center justify-center gap-2 px-5 rounded-xl text-xs font-semibold text-white bg-[#255798] hover:bg-[#316ebf] transition-all shadow-[0_0_16px_rgba(37,87,152,0.4)] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
                {Object.keys(pendingFiles).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Có ảnh mới đang chờ lưu" />
                )}
              </>
            )}
          </button>
        </div>
      </div>


      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0A0B0E] border border-white/[0.08] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeTab === "hero"
              ? "bg-[#255798] text-white shadow-[0_0_16px_rgba(37,87,152,0.35)]"
              : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]"
            }`}
        >
          <Globe className="w-4 h-4" />
          <span>1. Hero Section</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeTab === "about"
              ? "bg-[#255798] text-white shadow-[0_0_16px_rgba(37,87,152,0.35)]"
              : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]"
            }`}
        >
          <Info className="w-4 h-4" />
          <span>2. Về chúng tôi (About)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeTab === "departments"
              ? "bg-[#255798] text-white shadow-[0_0_16px_rgba(37,87,152,0.35)]"
              : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]"
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Các ban hoạt động ({config.departments?.items?.length || 0}/6)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("achievements")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeTab === "achievements"
              ? "bg-[#255798] text-white shadow-[0_0_16px_rgba(37,87,152,0.35)]"
              : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]"
            }`}
        >
          <Award className="w-4 h-4" />
          <span>4. Thành tích nổi bật</span>
        </button>
      </div>

      {/* Tab 1: HERO SECTION */}
      {activeTab === "hero" && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0B0E] p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.06] pb-4">
            <h3 className="text-base font-semibold text-[#EDEDEF]">Cấu hình Hero Section</h3>
            <p className="text-xs text-[#8A8F98] mt-1">
              Phần đầu trang ấn tượng với tiêu đề lớn, thông điệp giới thiệu và ảnh tập thể CLB
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8A8F98] mb-2">
                Badge tiêu đề nhỏ (Trường / Khoa)
              </label>
              <input
                type="text"
                value={config.hero.badge || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfig((prev) => (prev ? { ...prev, hero: { ...prev.hero, badge: val } } : prev));
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                placeholder="Trường Công nghệ Thông tin và Truyền thông - HaUI"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8A8F98] mb-2">
                Đoạn văn giới thiệu ngắn (Subtitle) <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={config.hero.subtitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfig((prev) => (prev ? { ...prev, hero: { ...prev.hero, subtitle: val } } : prev));
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-[#EDEDEF] focus:border-[#255798] focus:outline-none leading-relaxed"
                placeholder="Nơi hội tụ những tài năng nghệ thuật..."
              />
            </div>

            {/* Photo CLB */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-medium text-[#8A8F98]">
                Ảnh tập thể câu lạc bộ (Photo Frame)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="aspect-[16/9] rounded-xl border border-white/[0.1] bg-black/40 overflow-hidden relative flex items-center justify-center">
                  {config.hero.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={config.hero.imageUrl}
                      src={config.hero.imageUrl}
                      alt="Ảnh tập thể CLB"
                      className="w-full h-full object-cover transition-opacity duration-300"
                      onError={(e) => {
                        e.currentTarget.style.opacity = "0.3";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#8A8F98]/50 p-4 text-center">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
                      <span className="text-xs">Chưa có ảnh tập thể (Đang dùng khung vector mặc định)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-[#8A8F98] block mb-1.5">Cách 1: Tải ảnh từ máy tính (Tối đa 10MB)</span>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-medium text-[#EDEDEF] hover:bg-white/[0.08] cursor-pointer transition-all">
                        <Upload className="w-4 h-4 text-[#4d8ee8]" />
                        <span>{uploadingField === "heroImage" ? "Đang tải..." : "Chọn file ảnh mới..."}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingField === "heroImage"}
                          onChange={(e) =>
                            handleSelectFile(
                              e,
                              "heroImage",
                              (url) =>
                                setConfig((prev) =>
                                  prev ? { ...prev, hero: { ...prev.hero, imageUrl: url } } : prev
                                ),
                              16 / 9,
                              "Chỉnh sửa ảnh Hero Banner"
                            )
                          }
                        />
                      </label>
                      {pendingFiles["heroImage"] && (
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-lg">
                          Chờ lưu thay đổi
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8A8F98] block mt-1">Định dạng JPG, PNG, WEBP, GIF (Hỗ trợ cắt, nén & đổi kích thước)</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#8A8F98] block mb-1.5">Cách 2: Nhập trực tiếp đường dẫn URL</span>
                    <input
                      type="text"
                      value={config.hero.imageUrl || ""}
                      onChange={(e) => {
                        clearPendingFile("heroImage");
                        setConfig((prev) =>
                          prev ? { ...prev, hero: { ...prev.hero, imageUrl: e.target.value } } : prev
                        );
                      }}
                      placeholder="https://example.com/club-photo.jpg hoặc /uploads/..."
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                    />
                  </div>

                  {config.hero.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        clearPendingFile("heroImage");
                        setConfig((prev) =>
                          prev ? { ...prev, hero: { ...prev.hero, imageUrl: "" } } : prev
                        );
                      }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Xóa ảnh (trở về khung vector mặc định)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons CTA config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
              <div>
                <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                  Nút chính (Primary CTA)
                </label>
                <input
                  type="text"
                  value={config.hero.primaryButtonText || "Ứng tuyển ngay"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig((prev) =>
                      prev ? { ...prev, hero: { ...prev.hero, primaryButtonText: val } } : prev
                    );
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                  Nút phụ (Secondary CTA)
                </label>
                <input
                  type="text"
                  value={config.hero.secondaryButtonText || "Tìm hiểu thêm"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig((prev) =>
                      prev ? { ...prev, hero: { ...prev.hero, secondaryButtonText: val } } : prev
                    );
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ABOUT SECTION */}
      {activeTab === "about" && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0B0E] p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.06] pb-4">
            <h3 className="text-base font-semibold text-[#EDEDEF]">Cấu hình phần Về Chúng Tôi (About Section)</h3>
            <p className="text-xs text-[#8A8F98] mt-1">
              Chỉnh sửa các đoạn văn bản giới thiệu lịch sử, sứ mệnh và 3 hình ảnh hoạt động
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                Tiêu đề chính
              </label>
              <input
                type="text"
                value={config.about.title || "Nơi nghệ thuật gặp gỡ đam mê"}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfig((prev) => (prev ? { ...prev, about: { ...prev.about, title: val } } : prev));
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
              />
            </div>

            {/* 3 Paragraphs */}
            <div className="space-y-4">
              <label className="block text-xs font-medium text-[#8A8F98]">
                Nội dung các đoạn văn bản giới thiệu
              </label>

              {config.about.paragraphs.map((p, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="text-[11px] text-[#4d8ee8] font-medium">Đoạn văn {idx + 1}:</span>
                  <textarea
                    rows={3}
                    value={p}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) => {
                        if (!prev) return prev;
                        const newP = [...prev.about.paragraphs];
                        newP[idx] = val;
                        return { ...prev, about: { ...prev.about, paragraphs: newP } };
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-[#EDEDEF] focus:border-[#255798] focus:outline-none leading-relaxed"
                  />
                </div>
              ))}
            </div>

            {/* 3 Bento Images */}
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <label className="block text-xs font-medium text-[#8A8F98]">
                Quản lý 3 khung ảnh Bento Grid (Ảnh lớn & 2 ảnh nhỏ)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image 1: Large */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-3">
                  <span className="text-xs font-medium text-[#EDEDEF]">1. Ảnh lớn (Đêm nhạc hội)</span>
                  <div className="aspect-[16/9] rounded-lg border border-white/10 bg-black/40 overflow-hidden relative flex items-center justify-center">
                    {config.about.imageLarge?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={config.about.imageLarge.url}
                        src={config.about.imageLarge.url}
                        alt="Đêm nhạc hội"
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onError={(e) => {
                          e.currentTarget.style.opacity = "0.3";
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#8A8F98]/40" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={config.about.imageLarge?.label || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) =>
                        prev
                          ? {
                            ...prev,
                            about: {
                              ...prev.about,
                              imageLarge: {
                                ...(prev.about.imageLarge || { url: "", icon: "Mic2", label: "" }),
                                label: val,
                              },
                            },
                          }
                          : prev
                      );
                    }}
                    placeholder="Nhãn ảnh (Đêm nhạc hội)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={config.about.imageLarge?.url || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      clearPendingFile("aboutLarge");
                      setConfig((prev) =>
                        prev
                          ? {
                            ...prev,
                            about: {
                              ...prev.about,
                              imageLarge: {
                                ...(prev.about.imageLarge || { label: "Đêm nhạc hội", icon: "Mic2", url: "" }),
                                url: val,
                              },
                            },
                          }
                          : prev
                      );
                    }}
                    placeholder="URL ảnh lớn hoặc tải lên..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                  />
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <label className="inline-flex items-center gap-1.5 text-xs text-[#4d8ee8] cursor-pointer hover:underline">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingField === "aboutLarge" ? "Đang tải..." : "Tải ảnh lớn..."}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingField === "aboutLarge"}
                          onChange={(e) =>
                            handleSelectFile(
                              e,
                              "aboutLarge",
                              (url) =>
                                setConfig((prev) =>
                                  prev
                                    ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        imageLarge: {
                                          ...(prev.about.imageLarge || { label: "Đêm nhạc hội", icon: "Mic2" }),
                                          url,
                                        },
                                      },
                                    }
                                    : prev
                                ),
                              4 / 3,
                              "Chỉnh sửa ảnh lớn (About)"
                            )
                          }
                        />
                      </label>
                      {pendingFiles["aboutLarge"] && (
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                          Chờ lưu
                        </span>
                      )}
                    </div>
                    {config.about.imageLarge?.url && (
                      <button
                        type="button"
                        onClick={() => {
                          clearPendingFile("aboutLarge");
                          setConfig((prev) =>
                            prev
                              ? {
                                ...prev,
                                about: {
                                  ...prev.about,
                                  imageLarge: {
                                    ...(prev.about.imageLarge || { label: "Đêm nhạc hội", icon: "Mic2" }),
                                    url: "",
                                  },
                                },
                              }
                              : prev
                          );
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>

                {/* Image 2: Small 1 */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-3">
                  <span className="text-xs font-medium text-[#EDEDEF]">2. Ảnh vuông 1 (Hoạt động)</span>
                  <div className="aspect-square rounded-lg border border-white/10 bg-black/40 overflow-hidden relative flex items-center justify-center">
                    {config.about.imageSmall1?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={config.about.imageSmall1.url}
                        src={config.about.imageSmall1.url}
                        alt="Hoạt động"
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onError={(e) => {
                          e.currentTarget.style.opacity = "0.3";
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#8A8F98]/40" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={config.about.imageSmall1?.label || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) =>
                        prev
                          ? {
                            ...prev,
                            about: {
                              ...prev.about,
                              imageSmall1: {
                                ...(prev.about.imageSmall1 || { url: "", icon: "Heart", label: "" }),
                                label: val,
                              },
                            },
                          }
                          : prev
                      );
                    }}
                    placeholder="Nhãn ảnh (Hoạt động)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={config.about.imageSmall1?.url || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      clearPendingFile("aboutSmall1");
                      setConfig((prev) =>
                        prev
                          ? {
                            ...prev,
                            about: {
                              ...prev.about,
                              imageSmall1: {
                                ...(prev.about.imageSmall1 || { label: "Hoạt động", icon: "Heart", url: "" }),
                                url: val,
                              },
                            },
                          }
                          : prev
                      );
                    }}
                    placeholder="URL ảnh vuông 1 hoặc tải lên..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                  />
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <label className="inline-flex items-center gap-1.5 text-xs text-[#4d8ee8] cursor-pointer hover:underline">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingField === "aboutSmall1" ? "Đang tải..." : "Tải ảnh vuông 1..."}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingField === "aboutSmall1"}
                          onChange={(e) =>
                            handleSelectFile(
                              e,
                              "aboutSmall1",
                              (url) =>
                                setConfig((prev) =>
                                  prev
                                    ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        imageSmall1: {
                                          ...(prev.about.imageSmall1 || { label: "Hoạt động", icon: "Heart" }),
                                          url,
                                        },
                                      },
                                    }
                                    : prev
                                ),
                              1 / 1,
                              "Chỉnh sửa ảnh vuông 1 (About)"
                            )
                          }
                        />
                      </label>
                      {pendingFiles["aboutSmall1"] && (
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                          Chờ lưu
                        </span>
                      )}
                    </div>
                    {config.about.imageSmall1?.url && (
                      <button
                        type="button"
                        onClick={() => {
                          clearPendingFile("aboutSmall1");
                          setConfig((prev) =>
                            prev
                              ? {
                                ...prev,
                                about: {
                                  ...prev.about,
                                  imageSmall1: {
                                    ...(prev.about.imageSmall1 || { label: "Hoạt động", icon: "Heart" }),
                                    url: "",
                                  },
                                },
                              }
                              : prev
                          );
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>

                {/* Image 3: Small 2 */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-3">
                  <span className="text-xs font-medium text-[#EDEDEF]">3. Ảnh vuông 2 (Tập thể)</span>
                  <div className="aspect-square rounded-lg border border-white/10 bg-black/40 overflow-hidden relative flex items-center justify-center">
                    {config.about.imageSmall2?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={config.about.imageSmall2.url}
                        src={config.about.imageSmall2.url}
                        alt="Tập thể"
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onError={(e) => {
                          e.currentTarget.style.opacity = "0.3";
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#8A8F98]/40" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={config.about.imageSmall2?.label || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) =>
                        prev
                          ? {
                            ...prev,
                            about: {
                              ...prev.about,
                              imageSmall2: {
                                ...(prev.about.imageSmall2 || { url: "", icon: "Users", label: "" }),
                                label: val,
                              },
                            },
                          }
                          : prev
                      );
                    }}
                    placeholder="Nhãn ảnh (Tập thể)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={config.about.imageSmall2?.url || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      clearPendingFile("aboutSmall2");
                      setConfig((prev) =>
                        prev
                          ? {
                            ...prev,
                            about: {
                              ...prev.about,
                              imageSmall2: {
                                ...(prev.about.imageSmall2 || { label: "Tập thể", icon: "Users", url: "" }),
                                url: val,
                              },
                            },
                          }
                          : prev
                      );
                    }}
                    placeholder="URL ảnh vuông 2 hoặc tải lên..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                  />
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <label className="inline-flex items-center gap-1.5 text-xs text-[#4d8ee8] cursor-pointer hover:underline">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingField === "aboutSmall2" ? "Đang tải..." : "Tải ảnh vuông 2..."}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingField === "aboutSmall2"}
                          onChange={(e) =>
                            handleSelectFile(
                              e,
                              "aboutSmall2",
                              (url) =>
                                setConfig((prev) =>
                                  prev
                                    ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        imageSmall2: {
                                          ...(prev.about.imageSmall2 || { label: "Tập thể", icon: "Users" }),
                                          url,
                                        },
                                      },
                                    }
                                    : prev
                                ),
                              1 / 1,
                              "Chỉnh sửa ảnh vuông 2 (About)"
                            )
                          }
                        />
                      </label>
                      {pendingFiles["aboutSmall2"] && (
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                          Chờ lưu
                        </span>
                      )}
                    </div>
                    {config.about.imageSmall2?.url && (
                      <button
                        type="button"
                        onClick={() => {
                          clearPendingFile("aboutSmall2");
                          setConfig((prev) =>
                            prev
                              ? {
                                ...prev,
                                about: {
                                  ...prev.about,
                                  imageSmall2: {
                                    ...(prev.about.imageSmall2 || { label: "Tập thể", icon: "Users" }),
                                    url: "",
                                  },
                                },
                              }
                              : prev
                          );
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DEPARTMENTS SECTION */}
      {activeTab === "departments" && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0B0E] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div>
              <h3 className="text-base font-semibold text-[#EDEDEF]">Cấu hình Các Ban Hoạt Động</h3>
              <p className="text-xs text-[#8A8F98] mt-1">
                Cho phép tạo từ 2 đến 6 ban với icon, tên, mô tả và dải màu gradient tương ứng
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${(config.departments.items.length >= 2 && config.departments.items.length <= 6)
                    ? "bg-[#255798]/20 text-[#4d8ee8] border border-[#255798]/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
              >
                {config.departments.items.length} / 6 ban
              </span>

              <button
                type="button"
                disabled={config.departments.items.length >= 6}
                onClick={() => {
                  if (config.departments.items.length >= 6) return;
                  const newDept: DepartmentItem = {
                    id: `dept-${Date.now()}`,
                    icon: "Music",
                    name: `Ban Mới ${config.departments.items.length + 1}`,
                    description: "Mô tả mục tiêu và định hướng nghệ thuật của ban...",
                    gradient: COLOR_PRESETS[config.departments.items.length % COLOR_PRESETS.length].gradient,
                    glowColor: COLOR_PRESETS[config.departments.items.length % COLOR_PRESETS.length].glowColor,
                  };
                  setConfig((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      departments: {
                        ...prev.departments,
                        items: [...prev.departments.items, newDept],
                      },
                    };
                  });
                }}
                className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium text-white bg-[#255798] hover:bg-[#316ebf] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm ban</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                  Tiêu đề phần các ban <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={config.departments.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig((prev) =>
                      prev
                        ? { ...prev, departments: { ...prev.departments, title: val } }
                        : prev
                    );
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                  placeholder="Bốn ban — Một iStar"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  value={config.departments.subtitle || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig((prev) =>
                      prev
                        ? { ...prev, departments: { ...prev.departments, subtitle: val } }
                        : prev
                    );
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                  placeholder="Mỗi ban mang một màu sắc riêng..."
                />
              </div>
            </div>

            {/* Department cards list */}
            <div className="space-y-4 pt-2">
              {config.departments.items.map((dept, index) => (
                <div
                  key={dept.id || index}
                  className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] relative group space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-[#EDEDEF]">{dept.name}</span>
                    </div>

                    <button
                      type="button"
                      disabled={config.departments.items.length <= 2}
                      onClick={() => {
                        if (config.departments.items.length <= 2) return;
                        setConfig((prev) => {
                          if (!prev) return prev;
                          const filtered = prev.departments.items.filter((_, i) => i !== index);
                          return {
                            ...prev,
                            departments: { ...prev.departments, items: filtered },
                          };
                        });
                      }}
                      className="p-1.5 text-[#8A8F98] hover:text-red-400 hover:bg-white/[0.05] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={
                        config.departments.items.length <= 2
                          ? "Yêu cầu giữ lại tối thiểu 2 ban"
                          : "Xóa ban này"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Tên ban */}
                    <div>
                      <label className="block text-[11px] text-[#8A8F98] mb-1">Tên ban</label>
                      <input
                        type="text"
                        value={dept.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfig((prev) => {
                            if (!prev) return prev;
                            const updated = [...prev.departments.items];
                            updated[index] = { ...updated[index], name: val };
                            return {
                              ...prev,
                              departments: { ...prev.departments, items: updated },
                            };
                          });
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF]"
                      />
                    </div>

                    {/* Icon selector */}
                    <div>
                      <label className="block text-[11px] text-[#8A8F98] mb-1">Biểu tượng (Icon)</label>
                      <CustomIconSelect
                        value={dept.icon}
                        onChange={(val) => {
                          setConfig((prev) => {
                            if (!prev) return prev;
                            const updated = [...prev.departments.items];
                            updated[index] = { ...updated[index], icon: val };
                            return {
                              ...prev,
                              departments: { ...prev.departments, items: updated },
                            };
                          });
                        }}
                      />
                    </div>

                    {/* Preset color */}
                    <div>
                      <label className="block text-[11px] text-[#8A8F98] mb-1">Màu sắc gradient</label>
                      <CustomColorPresetSelect
                        value={dept.gradient || COLOR_PRESETS[0].gradient}
                        onChange={(selectedPreset) => {
                          setConfig((prev) => {
                            if (!prev) return prev;
                            const updated = [...prev.departments.items];
                            updated[index] = {
                              ...updated[index],
                              gradient: selectedPreset.gradient,
                              glowColor: selectedPreset.glowColor || "rgba(37, 87, 152, 0.2)",
                            };
                            return {
                              ...prev,
                              departments: { ...prev.departments, items: updated },
                            };
                          });
                        }}
                      />
                    </div>
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label className="block text-[11px] text-[#8A8F98] mb-1">Nội dung mô tả ban</label>
                    <textarea
                      rows={2}
                      value={dept.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev) => {
                          if (!prev) return prev;
                          const updated = [...prev.departments.items];
                          updated[index] = { ...updated[index], description: val };
                          return {
                            ...prev,
                            departments: { ...prev.departments, items: updated },
                          };
                        });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: ACHIEVEMENTS SECTION */}
      {activeTab === "achievements" && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0B0E] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div>
              <h3 className="text-base font-semibold text-[#EDEDEF]">Cấu hình Thành Tích Nổi Bật</h3>
              <p className="text-xs text-[#8A8F98] mt-1">
                Quản lý các cột mốc, giải thưởng danh giá hiển thị trên thanh carousel trượt
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newAch: AchievementItem = {
                  id: `ach-${Date.now()}`,
                  year: String(new Date().getFullYear()),
                  title: "Thành tích mới",
                  description: "Mô tả giải thưởng hoặc sự kiện nổi bật...",
                  imageUrl: "",
                };
                setConfig((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    achievements: {
                      ...prev.achievements,
                      items: [newAch, ...prev.achievements.items],
                    },
                  };
                });
              }}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium text-white bg-[#255798] hover:bg-[#316ebf] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm thành tích</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8A8F98] mb-1.5">
                Mô tả phần thành tích
              </label>
              <textarea
                rows={2}
                value={config.achievements.subtitle || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfig((prev) =>
                    prev
                      ? {
                        ...prev,
                        achievements: { ...prev.achievements, subtitle: val },
                      }
                      : prev
                  );
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                placeholder="Hành trình hơn 10 năm với hàng chục giải thưởng lớn nhỏ..."
              />
            </div>

            {/* Achievement cards list */}
            <div className="space-y-4 pt-2">
              {config.achievements.items.map((ach, index) => (
                <div
                  key={ach.id || `ach-item-${index}`}
                  className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-4 relative group"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#255798]/20 text-[#4d8ee8] border border-[#255798]/30">
                        {ach.year}
                      </span>
                      <span className="text-sm font-semibold text-[#EDEDEF]">{ach.title || "Chưa đặt tiêu đề"}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setConfig((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            achievements: {
                              ...prev.achievements,
                              items: prev.achievements.items.filter((item) => item.id !== ach.id),
                            },
                          };
                        });
                      }}
                      className="p-1.5 text-[#8A8F98] hover:text-red-400 hover:bg-white/[0.05] rounded-lg transition-colors cursor-pointer"
                      title="Xóa thành tích này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main card content with 3:4 Image Thumbnail */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Thumbnail Preview 3:4 */}
                    <div className="w-28 sm:w-32 aspect-[3/4] rounded-xl border border-white/10 bg-black/40 overflow-hidden relative group shrink-0 flex items-center justify-center shadow-md">
                      {ach.imageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            key={ach.imageUrl}
                            src={ach.imageUrl}
                            alt={ach.title}
                            className="w-full h-full object-cover transition-opacity duration-300"
                            onError={(e) => {
                              e.currentTarget.style.opacity = "0.3";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                            <button
                              type="button"
                              onClick={() => {
                                clearPendingFile(ach.id);
                                setConfig((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    achievements: {
                                      ...prev.achievements,
                                      items: prev.achievements.items.map((item) =>
                                        item.id === ach.id ? { ...item, imageUrl: "" } : item
                                      ),
                                    },
                                  };
                                });
                              }}
                              className="text-[10px] text-red-300 hover:text-red-200 bg-red-500/20 px-2 py-1 rounded border border-red-500/30 transition-all cursor-pointer"
                            >
                              Xóa ảnh
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#8A8F98]/40 p-2 text-center">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
                          <span className="text-[10px] text-[#8A8F98]/60">Chưa có ảnh (3:4)</span>
                        </div>
                      )}

                      {uploadingField === ach.id && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1.5 text-[#4d8ee8]">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span className="text-[10px] font-medium text-white">Đang tải...</span>
                        </div>
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 space-y-3 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-[11px] text-[#8A8F98] mb-1">Năm</label>
                          <input
                            type="text"
                            value={ach.year}
                            onChange={(e) => {
                              const val = e.target.value;
                              setConfig((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  achievements: {
                                    ...prev.achievements,
                                    items: prev.achievements.items.map((item) =>
                                      item.id === ach.id ? { ...item, year: val } : item
                                    ),
                                  },
                                };
                              });
                            }}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] text-[#8A8F98] mb-1">Tiêu đề giải thưởng / sự kiện</label>
                          <input
                            type="text"
                            value={ach.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setConfig((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  achievements: {
                                    ...prev.achievements,
                                    items: prev.achievements.items.map((item) =>
                                      item.id === ach.id ? { ...item, title: val } : item
                                    ),
                                  },
                                };
                              });
                            }}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#8A8F98] mb-1">Mô tả ngắn thành tích</label>
                        <textarea
                          rows={2}
                          value={ach.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                achievements: {
                                  ...prev.achievements,
                                  items: prev.achievements.items.map((item) =>
                                    item.id === ach.id ? { ...item, description: val } : item
                                  ),
                                },
                              };
                            });
                          }}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                        />
                      </div>

                      {/* Ảnh minh chứng thành tích */}
                      <div>
                        <label className="block text-[11px] text-[#8A8F98] mb-1">Ảnh minh chứng / kỷ niệm (Tỉ lệ 3:4, tối đa 10MB)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={ach.imageUrl || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              clearPendingFile(ach.id);
                              setConfig((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  achievements: {
                                    ...prev.achievements,
                                    items: prev.achievements.items.map((item) =>
                                      item.id === ach.id ? { ...item, imageUrl: val } : item
                                    ),
                                  },
                                };
                              });
                            }}
                            placeholder="Đường dẫn ảnh hoặc tải ảnh..."
                            className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-[#EDEDEF] focus:border-[#255798] focus:outline-none"
                          />

                          <div className="flex items-center gap-1.5 shrink-0">
                            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-medium text-[#EDEDEF] hover:bg-white/[0.08] cursor-pointer transition-all shrink-0">
                              <Upload className="w-3.5 h-3.5 text-[#4d8ee8]" />
                              <span>{uploadingField === ach.id ? "Đang tải..." : "Tải ảnh mới"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingField === ach.id}
                                onChange={(e) =>
                                  handleSelectFile(
                                    e,
                                    ach.id,
                                    (url) => {
                                      setConfig((prev) => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          achievements: {
                                            ...prev.achievements,
                                            items: prev.achievements.items.map((item) =>
                                              item.id === ach.id ? { ...item, imageUrl: url } : item
                                            ),
                                          },
                                        };
                                      });
                                    },
                                    3 / 4,
                                    `Chỉnh sửa ảnh thành tích (${ach.year})`
                                  )
                                }
                              />
                            </label>
                            {pendingFiles[ach.id] && (
                              <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-1 rounded-lg">
                                Chờ lưu
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Image Editor Modal for Admin Homepage Management */}
      <ImageEditorModal
        isOpen={editorState.isOpen}
        onClose={() => setEditorState((prev) => ({ ...prev, isOpen: false }))}
        file={editorState.file}
        aspectRatioPreset={editorState.aspectRatio}
        title={editorState.title}
        onConfirm={async (processedFile) => {
          if (editorState.onConfirm) {
            await editorState.onConfirm(processedFile);
          }
        }}
      />
    </div>
  );
}
