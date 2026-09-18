import { useState, useEffect, useRef, useCallback } from "react";
import { isAxiosError } from "axios";
import {
  ApplicationFormDto,
  AdminApplicationUpdateRequest,
  ApplicationStatus,
} from "@/types/application";
import { Department } from "@/types/user";
import adminApplicationService from "@/services/adminApplicationService";
import interviewService from "@/services/interviewService";
import { notifyOpener } from "@/utils/broadcast";

interface UserRoleContext {
  isAdmin?: boolean;
  isReceptionist?: boolean;
  isInterviewer?: boolean;
  userDepartments?: { department: Department }[];
}

interface UseApplicationEditingProps {
  application: ApplicationFormDto | null;
  userRole: UserRoleContext;
  onRefresh?: () => void | Promise<void>;
}

export function isCandidateEditableByRole(
  userRole: { isAdmin?: boolean; isReceptionist?: boolean },
  status?: ApplicationStatus
): boolean {
  if (userRole.isAdmin) return true;
  if (userRole.isReceptionist) {
    return (
      status === ApplicationStatus.SUBMITTED ||
      status === ApplicationStatus.CHECKED_IN ||
      status === ApplicationStatus.NO_SHOW
    );
  }
  return false;
}

export function useApplicationEditing({
  application,
  userRole,
  onRefresh,
}: UseApplicationEditingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState<AdminApplicationUpdateRequest>({});
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Avatar upload state
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  // Sync edit form when application changes
  useEffect(() => {
    if (application) {
      setEditForm({
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phoneNumber: application.phoneNumber || "",
        birthday: application.birthday || "",
        address: application.address || "",
        facebookUrl: application.facebookUrl || "",
        school: application.school || "",
        majorClass: application.majorClass || "",
        course: application.course || "",
        area: application.area,
        knowIStar: application.knowIStar || "",
        reasonIStarer: application.reasonIStarer || "",
        status: application.status,
      });
      setIsEditing(false);
      setActionMessage(null);
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [application]);

  const isEditable = isCandidateEditableByRole(userRole, application?.status);

  const canScoreDept = useCallback(
    (deptCode: Department): boolean => {
      if (userRole.isAdmin) return true;
      if (!userRole.isInterviewer) return false;
      const depts = userRole.userDepartments?.map((ud) => ud.department) || [];
      return depts.includes(deptCode);
    },
    [userRole]
  );

  const handleAvatarFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setActionMessage({ type: "error", text: "Vui lòng chọn file hình ảnh (PNG, JPG, WEBP)." });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setActionMessage({ type: "error", text: "Ảnh không được vượt quá 5MB." });
        return false;
      }
      setSelectedAvatarFile(file);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
      setAvatarPreviewUrl(URL.createObjectURL(file));
      return true;
    },
    [avatarPreviewUrl]
  );

  const clearAvatarFile = useCallback(() => {
    setSelectedAvatarFile(null);
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  }, [avatarPreviewUrl]);

  const handleDeleteAvatar = useCallback(async () => {
    if (!application) return;
    if (!confirm("Xác nhận XÓA ảnh đại diện của ứng viên?")) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.deleteAvatar(application.id);
      clearAvatarFile();
      setActionMessage({ type: "success", text: "Đã xóa ảnh đại diện thành công!" });
      notifyOpener("APPLICATION_UPDATED");
      await onRefresh?.();
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi xóa ảnh đại diện." });
    } finally {
      setIsSubmitting(false);
    }
  }, [application, clearAvatarFile, onRefresh]);

  const handleSaveEdit = useCallback(async () => {
    if (!application) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.updateApplication(application.id, editForm);
      if (selectedAvatarFile) {
        await adminApplicationService.uploadAvatar(application.id, selectedAvatarFile);
      }
      setIsEditing(false);
      clearAvatarFile();
      setActionMessage({ type: "success", text: "Cập nhật thông tin ứng viên thành công!" });
      notifyOpener("APPLICATION_UPDATED");
      await onRefresh?.();
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi cập nhật thông tin" });
    } finally {
      setIsSubmitting(false);
    }
  }, [application, editForm, selectedAvatarFile, clearAvatarFile, onRefresh]);

  const handleCheckIn = useCallback(async () => {
    if (!application) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await interviewService.checkIn(application.id);
      setActionMessage({ type: "success", text: "Đã điểm danh ứng viên thành công!" });
      notifyOpener("INTERVIEW_UPDATED");
      await onRefresh?.();
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi điểm danh ứng viên" });
    } finally {
      setIsSubmitting(false);
    }
  }, [application, onRefresh]);

  const handleNoShow = useCallback(async () => {
    if (!application) return;
    if (!confirm("Xác nhận đánh dấu ứng viên VẮNG MẶT?")) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await interviewService.noShow(application.id);
      setActionMessage({ type: "success", text: "Đã đánh dấu vắng mặt cho ứng viên!" });
      notifyOpener("INTERVIEW_UPDATED");
      await onRefresh?.();
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi báo vắng mặt" });
    } finally {
      setIsSubmitting(false);
    }
  }, [application, onRefresh]);

  const handleRevertSubmitted = useCallback(async () => {
    if (!application) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await interviewService.revertSubmitted(application.id);
      setActionMessage({ type: "success", text: "Đã hoàn tác về trạng thái Đã nộp đơn!" });
      notifyOpener("INTERVIEW_UPDATED");
      await onRefresh?.();
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi hoàn tác trạng thái" });
    } finally {
      setIsSubmitting(false);
    }
  }, [application, onRefresh]);

  const handleApprove = useCallback(async () => {
    if (!application) return;
    const name = `${application.lastName || ""} ${application.firstName || ""}`.trim();
    if (!confirm(`Xác nhận DUYỆT TRÚNG TUYỂN cho ứng viên ${name}?`)) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.approveApplication(application.id);
      setActionMessage({ type: "success", text: "Duyệt trúng tuyển ứng viên thành công!" });
      notifyOpener("APPLICATION_UPDATED");
      await onRefresh?.();
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi duyệt đơn" });
    } finally {
      setIsSubmitting(false);
    }
  }, [application, onRefresh]);

  const handleReject = useCallback(async () => {
    if (!application) return;
    const name = `${application.lastName || ""} ${application.firstName || ""}`.trim();
    if (!confirm(`Xác nhận TỪ CHỐI ứng viên ${name}?`)) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.rejectApplication(application.id);
      setActionMessage({ type: "success", text: "Đã từ chối đơn ứng tuyển." });
      notifyOpener("APPLICATION_UPDATED");
      await onRefresh?.();
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi từ chối đơn" });
    } finally {
      setIsSubmitting(false);
    }
  }, [application, onRefresh]);

  const handleCreateAccount = useCallback(async () => {
    if (!application) return;
    const name = `${application.lastName || ""} ${application.firstName || ""}`.trim();
    if (!confirm(`Tạo tài khoản thành viên mới cho ứng viên ${name}?`)) return;
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await adminApplicationService.createAccount(application.id);
      setActionMessage({ type: "success", text: "Đã tạo tài khoản thành viên thành công!" });
      notifyOpener("APPLICATION_UPDATED");
      await onRefresh?.();
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : null;
      setActionMessage({ type: "error", text: msg || "Lỗi khi tạo tài khoản" });
    } finally {
      setIsSubmitting(false);
    }
  }, [application, onRefresh]);

  return {
    isEditing,
    setIsEditing,
    isSubmitting,
    editForm,
    setEditForm,
    actionMessage,
    setActionMessage,
    isEditable,
    canScoreDept,
    selectedAvatarFile,
    avatarPreviewUrl,
    avatarInputRef,
    handleAvatarFileSelect,
    clearAvatarFile,
    handleDeleteAvatar,
    handleSaveEdit,
    handleCheckIn,
    handleNoShow,
    handleRevertSubmitted,
    handleApprove,
    handleReject,
    handleCreateAccount,
  };
}
