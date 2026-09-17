import { useState, useRef, useCallback, useEffect } from "react";

interface UseFileUploadOptions {
  maxSizeBytes?: number; // default 5MB
  allowedTypes?: string[]; // default ["image/"]
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxSizeBytes = 5 * 1024 * 1024,
    allowedTypes = ["image/"],
  } = options;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
    (file: File) => {
      const isAllowedType = allowedTypes.some((type) => file.type.startsWith(type));
      if (!isAllowedType) {
        setErrorMsg("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP).");
        return false;
      }

      if (file.size > maxSizeBytes) {
        const mb = Math.round(maxSizeBytes / (1024 * 1024));
        setErrorMsg(`Ảnh không được vượt quá ${mb}MB.`);
        return false;
      }

      setErrorMsg(null);
      setSelectedFile(file);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return true;
    },
    [maxSizeBytes, allowedTypes, previewUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
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
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemoveFile,
  };
}
