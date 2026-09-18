import { useState, useRef, useCallback, useEffect } from "react";
import { compressImageToMaxSize } from "@/utils/imageProcessing";

interface UseFileUploadOptions {
  maxSizeBytes?: number; // default 5MB hard limit after compression
  compressThresholdBytes?: number; // default 3MB threshold to trigger auto-compression
  autoCompress?: boolean; // default true
  allowedTypes?: string[]; // default ["image/"]
  onCompressed?: (info: { originalSize: number; compressedSize: number }) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxSizeBytes = 5 * 1024 * 1024,
    compressThresholdBytes = 3 * 1024 * 1024,
    autoCompress = true,
    allowedTypes = ["image/"],
    onCompressed,
  } = options;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [wasCompressed, setWasCompressed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL when previewUrl changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = useCallback(
    async (file: File): Promise<boolean> => {
      const isAllowedType = allowedTypes.some((type) => file.type.startsWith(type));
      if (!isAllowedType) {
        setErrorMsg("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP).");
        return false;
      }

      let fileToUse = file;
      let compressed = false;

      // Auto-compress if exceeds threshold (3MB)
      if (autoCompress && file.size > compressThresholdBytes) {
        try {
          setIsCompressing(true);
          const res = await compressImageToMaxSize(
            file,
            compressThresholdBytes,
            "image/jpeg"
          );
          fileToUse = res.file;
          compressed = res.wasCompressed;
          if (res.wasCompressed && onCompressed) {
            onCompressed({
              originalSize: res.originalSize,
              compressedSize: res.compressedSize,
            });
          }
        } catch {
          // If auto-compression fails, keep original file for standard validation
        } finally {
          setIsCompressing(false);
        }
      }

      if (fileToUse.size > maxSizeBytes) {
        const mb = Math.round(maxSizeBytes / (1024 * 1024));
        setErrorMsg(`Ảnh không được vượt quá ${mb}MB.`);
        return false;
      }

      setErrorMsg(null);
      setWasCompressed(compressed);
      setSelectedFile(fileToUse);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(fileToUse);
      setPreviewUrl(url);
      return true;
    },
    [maxSizeBytes, compressThresholdBytes, autoCompress, allowedTypes, onCompressed, previewUrl]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        await handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrorMsg(null);
    setWasCompressed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  return {
    selectedFile,
    previewUrl,
    errorMsg,
    setErrorMsg,
    isDragging,
    isCompressing,
    wasCompressed,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemoveFile,
  };
}
