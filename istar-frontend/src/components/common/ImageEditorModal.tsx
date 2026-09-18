"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
} from "react-image-crop";
import {
  X,
  Crop as CropIcon,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Check,
  AlertTriangle,
  Sliders,
  FileDown,
  RefreshCw,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  onConfirm: (processedFile: File) => Promise<void> | void;
  aspectRatioPreset?: number; // e.g. 1 (1:1), 16/9, 3/4, or undefined for free
  title?: string;
}

const ASPECT_RATIOS = [
  { label: "Tự do", value: undefined },
  { label: "1 : 1 (Vuông)", value: 1 / 1 },
  { label: "16 : 9 (Ngang)", value: 16 / 9 },
  { label: "4 : 3", value: 4 / 3 },
  { label: "3 : 4 (Dọc)", value: 3 / 4 },
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function ImageEditorModal({
  isOpen,
  onClose,
  file,
  onConfirm,
  aspectRatioPreset,
  title = "Chỉnh sửa hình ảnh",
}: ImageEditorModalProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(aspectRatioPreset);

  // Transforms
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [scalePercent, setScalePercent] = useState<number>(100);

  // Quality & Format
  const [quality, setQuality] = useState<number>(85); // 10-100
  const [outputFormat, setOutputFormat] = useState<string>("image/jpeg");

  // Stats
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [outputDimensions, setOutputDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Initialize state when file changes
  useEffect(() => {
    if (!file) {
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setImgSrc(objectUrl);

    // Reset settings
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setScalePercent(100);
    setQuality(85);
    setAspect(aspectRatioPreset);

    if (file.type === "image/png") {
      setOutputFormat("image/png");
    } else if (file.type === "image/webp") {
      setOutputFormat("image/webp");
    } else {
      setOutputFormat("image/jpeg");
    }

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, aspectRatioPreset]);

  // Handle image load
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight, width, height } = e.currentTarget;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });

    let initialCrop: Crop;
    if (aspect) {
      initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 90,
          },
          aspect,
          width,
          height
        ),
        width,
        height
      );
    } else {
      initialCrop = {
        unit: "%",
        x: 5,
        y: 5,
        width: 90,
        height: 90,
      };
    }
    setCrop(initialCrop);
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
  };

  // Switch aspect ratio
  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;

    if (newAspect) {
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 90,
          },
          newAspect,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
      setCompletedCrop(convertToPixelCrop(newCrop, width, height));
    } else {
      const freeCrop: Crop = {
        unit: "%",
        x: 5,
        y: 5,
        width: 90,
        height: 90,
      };
      setCrop(freeCrop);
      setCompletedCrop(convertToPixelCrop(freeCrop, width, height));
    }
  };

  // Generate cropped and transformed canvas
  const generateCanvas = useCallback((): HTMLCanvasElement | null => {
    const image = imgRef.current;
    if (!image || !image.width || !image.height || !image.naturalWidth || !image.naturalHeight) {
      return null;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Determine crop dimensions in natural image coordinates
    let cropX = 0;
    let cropY = 0;
    let cropW = image.naturalWidth;
    let cropH = image.naturalHeight;

    const effectiveCrop =
      completedCrop && completedCrop.width > 0 && completedCrop.height > 0
        ? completedCrop
        : crop
        ? convertToPixelCrop(crop, image.width, image.height)
        : undefined;

    if (effectiveCrop && effectiveCrop.width > 0 && effectiveCrop.height > 0) {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      cropX = effectiveCrop.x * scaleX;
      cropY = effectiveCrop.y * scaleY;
      cropW = effectiveCrop.width * scaleX;
      cropH = effectiveCrop.height * scaleY;
    }

    // Apply scalePercent to final dimensions
    const scaleFactor = scalePercent / 100;
    const finalW = Math.max(1, Math.round(cropW * scaleFactor));
    const finalH = Math.max(1, Math.round(cropH * scaleFactor));

    // For rotation 90 or 270, width and height swap
    const isSideways = rotation % 180 !== 0;
    canvas.width = isSideways ? finalH : finalW;
    canvas.height = isSideways ? finalW : finalH;

    ctx.save();
    // Move to center of canvas for rotation and flipping
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Draw the cropped section onto canvas
    const drawW = finalW;
    const drawH = finalH;
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropW,
      cropH,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    );

    ctx.restore();
    return canvas;
  }, [completedCrop, crop, scalePercent, rotation, flipH, flipV]);

  // Recalculate estimated size and dimensions with debounce
  useEffect(() => {
    if (!imgSrc) return;

    const timer = setTimeout(() => {
      const canvas = generateCanvas();
      if (!canvas) return;

      setOutputDimensions({ width: canvas.width, height: canvas.height });

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setEstimatedSize(blob.size);
          }
        },
        outputFormat,
        quality / 100
      );
    }, 150);

    return () => clearTimeout(timer);
  }, [generateCanvas, outputFormat, quality, imgSrc]);

  // Confirm and export
  const handleConfirm = async () => {
    try {
      setIsExporting(true);
      const canvas = generateCanvas();
      if (!canvas) {
        throw new Error("Không thể khởi tạo canvas xử lý ảnh!");
      }

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setIsExporting(false);
            return;
          }

          let ext = ".jpg";
          if (outputFormat === "image/jpeg") ext = ".jpg";
          else if (outputFormat === "image/png") ext = ".png";
          else if (outputFormat === "image/webp") ext = ".webp";

          const rawBaseName = file?.name?.replace(/\.[^/.]+$/, "") || "image";
          const safeBaseName =
            rawBaseName.replace(/[^a-zA-Z0-9_-]/g, "_") || "image";
          const newFileName = `${safeBaseName}-edited${ext}`;
          const processedFile = new File([blob], newFileName, {
            type: outputFormat,
            lastModified: Date.now(),
          });

          try {
            await onConfirm(processedFile);
            onClose();
          } finally {
            setIsExporting(false);
          }
        },
        outputFormat,
        quality / 100
      );
    } catch {
      setIsExporting(false);
    }
  };

  if (!isOpen || !file) return null;

  const isOverLimit = (estimatedSize || 0) > MAX_FILE_SIZE_BYTES;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#090A0F] border border-white/[0.12] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#0D0E14]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#255798]/20 border border-[#255798]/30 flex items-center justify-center text-[#4d8ee8]">
                <CropIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#EDEDEF]">{title}</h3>
                <p className="text-[11px] text-[#8A8F98]">
                  Cắt xén, xoay lật, đổi kích thước và nén dung lượng ảnh chất lượng cao
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 no-scrollbar">
            {/* Warning if over 10MB limit */}
            {isOverLimit && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">Dung lượng vượt quá giới hạn 10MB!</span>
                  <p className="text-[11px] text-red-300/80">
                    Dung lượng ảnh hiện tại là{" "}
                    <strong>{formatBytes(estimatedSize || 0)}</strong>. Vui lòng kéo thanh trượt giảm{" "}
                    <strong>Chất lượng</strong> hoặc <strong>Kích thước</strong> bên dưới để đảm bảo file nhỏ hơn 10MB trước khi tiếp tục.
                  </p>
                </div>
              </div>
            )}

            {/* Crop Stage Area */}
            <div className="w-full min-h-[300px] max-h-[460px] bg-[#030406] rounded-xl border border-white/[0.08] overflow-hidden flex items-center justify-center relative p-3 select-none">
              {imgSrc ? (
                <div className="max-h-[420px] max-w-full flex items-center justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    className="max-h-[420px] max-w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={imgSrc}
                      alt="Crop target"
                      onLoad={onImageLoad}
                      style={{
                        maxHeight: "400px",
                        maxWidth: "100%",
                        objectFit: "contain",
                        transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                        transition: "transform 0.15s ease",
                      }}
                    />
                  </ReactCrop>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#8A8F98]/50">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#255798]" />
                  <span className="text-xs">Đang tải ảnh...</span>
                </div>
              )}
            </div>

            {/* Toolbar Row 1: Aspect Ratio Presets & Rotation / Flip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Aspect Ratio Presets */}
              <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-2">
                <span className="text-xs font-medium text-[#8A8F98] block">Tỉ lệ cắt (Aspect Ratio)</span>
                <div className="flex flex-wrap gap-1.5">
                  {ASPECT_RATIOS.map((item) => {
                    const isSelected = aspect === item.value;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleAspectChange(item.value)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#255798] text-white shadow-[0_0_12px_rgba(37,87,152,0.4)]"
                            : "bg-white/[0.04] text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transform Tools: Rotate & Flip */}
              <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-2">
                <span className="text-xs font-medium text-[#8A8F98] block">Xoay & Lật ảnh</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                    className="flex-1 h-8 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg bg-white/[0.04] text-[#EDEDEF] hover:bg-white/[0.08] transition-all cursor-pointer"
                    title="Xoay trái 90°"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#4d8ee8]" />
                    <span>-90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="flex-1 h-8 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg bg-white/[0.04] text-[#EDEDEF] hover:bg-white/[0.08] transition-all cursor-pointer"
                    title="Xoay phải 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#4d8ee8]" />
                    <span>+90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipH((prev) => !prev)}
                    className={`h-8 px-2.5 inline-flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                      flipH
                        ? "bg-[#255798] text-white"
                        : "bg-white/[0.04] text-[#EDEDEF] hover:bg-white/[0.08]"
                    }`}
                    title="Lật ngang"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipV((prev) => !prev)}
                    className={`h-8 px-2.5 inline-flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                      flipV
                        ? "bg-[#255798] text-white"
                        : "bg-white/[0.04] text-[#EDEDEF] hover:bg-white/[0.08]"
                    }`}
                    title="Lật dọc"
                  >
                    <FlipVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Toolbar Row 2: Resize Scale & Quality / Compression */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resize Scale */}
              <div className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#EDEDEF]">
                    <Maximize2 className="w-3.5 h-3.5 text-[#4d8ee8]" />
                    <span>Thu phóng kích thước (Resize)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#4d8ee8]">{scalePercent}%</span>
                </div>

                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={scalePercent}
                  onChange={(e) => setScalePercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#255798]"
                />

                <div className="flex items-center justify-between text-[11px] text-[#8A8F98]">
                  <span>
                    Xuất: <strong className="text-[#EDEDEF]">{outputDimensions.width} × {outputDimensions.height} px</strong>
                  </span>
                  <span>Gốc: {naturalSize.width} × {naturalSize.height} px</span>
                </div>
              </div>

              {/* Quality & Format Selection */}
              <div className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#EDEDEF]">
                    <Sliders className="w-3.5 h-3.5 text-[#4d8ee8]" />
                    <span>Nén & Chất lượng (Compression)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#4d8ee8]">{quality}%</span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#255798]"
                />

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8A8F98]">Định dạng xuất:</span>
                  <div className="flex items-center gap-1">
                    {(["image/webp", "image/jpeg", "image/png"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setOutputFormat(fmt)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          outputFormat === fmt
                            ? "bg-[#255798]/30 text-[#4d8ee8] border border-[#255798]/50"
                            : "text-[#8A8F98] hover:text-[#EDEDEF]"
                        }`}
                      >
                        {fmt.replace("image/", "")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Output File Size Summary & Comparison Bar */}
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0D0E14] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#4d8ee8] shrink-0">
                  <FileDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8A8F98]">Dung lượng dự kiến:</span>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                        isOverLimit
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                      }`}
                    >
                      {estimatedSize ? formatBytes(estimatedSize) : "Đang tính..."}
                    </span>
                    <span className="text-[11px] text-[#8A8F98]">
                      (Tối đa: 10 MB)
                    </span>
                  </div>
                  {file && estimatedSize && (
                    <p className="text-[11px] text-[#8A8F98] mt-0.5">
                      File gốc: <span className="text-[#EDEDEF]">{formatBytes(file.size)}</span>
                      {file.size > estimatedSize && (
                        <span className="text-emerald-400 font-medium ml-1">
                          (Giảm {Math.round(((file.size - estimatedSize) / file.size) * 100)}%)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right text-[11px] text-[#8A8F98] hidden sm:block">
                Độ phân giải: <strong className="text-[#EDEDEF]">{outputDimensions.width} × {outputDimensions.height} px</strong>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.08] bg-[#0D0E14]">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-medium text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isOverLimit || isExporting}
                onClick={handleConfirm}
                className="h-9 px-5 rounded-xl text-xs font-semibold text-white bg-[#255798] hover:bg-[#316ebf] transition-all shadow-[0_0_16px_rgba(37,87,152,0.4)] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xử lý & Tải lên...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Xác nhận & Áp dụng</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
