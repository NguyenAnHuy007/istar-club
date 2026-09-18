"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { Upload, X, Camera, Crop } from "lucide-react";
import ImageEditorModal from "@/components/common/ImageEditorModal";

interface AvatarUploaderProps {
  onFileSelect: (file: File | null) => void;
}

export default function AvatarUploader({ onFileSelect }: AvatarUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn định dạng ảnh (JPG, PNG, WEBP)");
      return;
    }
    // Save raw file and open editor
    setSelectedRawFile(file);
    setIsEditorOpen(true);
  };

  const handleEditorConfirm = (processedFile: File) => {
    if (processedFile.size > 5 * 1024 * 1024) {
      setErrorMsg("Kích thước ảnh đại diện sau xử lý tối đa là 5MB");
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(processedFile);
    setPreviewUrl(objectUrl);
    onFileSelect(processedFile);
    setErrorMsg(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedRawFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect(null);
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleChange}
      />

      <div className="flex items-center gap-4 mt-1">
        {/* Preview / Drop Box */}
        <div
          onClick={triggerSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-20 h-20 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-300 flex items-center justify-center shrink-0 ${
            isDragging
              ? "border-[#3b82f6] bg-[#255798]/20 scale-105"
              : previewUrl
              ? "border-white/20 hover:border-white/40"
              : "border-white/[0.15] bg-white/[0.02] hover:border-white/[0.3] hover:bg-white/[0.05]"
          }`}
        >
          {previewUrl ? (
            <>
              <Image
                src={previewUrl}
                alt="Avatar Preview"
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </>
          ) : (
            <Upload className="w-6 h-6 text-[#8A8F98]/50" />
          )}
        </div>

        {/* Buttons & Info */}
        <div className="flex flex-col items-start gap-1">
          {previewUrl ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerSelect}
                className="text-sm text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors cursor-pointer"
              >
                Đổi ảnh khác
              </button>
              {selectedRawFile && (
                <>
                  <span className="text-white/20">•</span>
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(true)}
                    className="inline-flex items-center gap-1 text-sm text-[#4d8ee8] hover:text-[#60a5fa] font-medium transition-colors cursor-pointer"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    Chỉnh sửa
                  </button>
                </>
              )}
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Xóa ảnh
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={triggerSelect}
              className="text-sm text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors cursor-pointer"
            >
              Chọn ảnh thẻ / ảnh chân dung
            </button>
          )}

          <p className="text-xs text-[#8A8F98]/60">
            Hỗ trợ JPG, PNG, WEBP (Tự động cắt tỉ lệ 1:1, nén tối đa 5MB)
          </p>

          {errorMsg && (
            <p className="text-xs text-red-400 font-medium mt-0.5">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Image Editor Modal for Candidate Avatar */}
      <ImageEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        file={selectedRawFile}
        aspectRatioPreset={1 / 1}
        title="Chỉnh sửa ảnh đại diện (1:1)"
        onConfirm={handleEditorConfirm}
      />
    </div>
  );
}
