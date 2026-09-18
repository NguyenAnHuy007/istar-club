import apiClient from "./apiClient";
import {
  ApplicationFormRequest,
  ApplicationFormResponse,
} from "@/types/application";
import { ApiResponse } from "@/types/user";

export const publicApplicationService = {
  /**
   * Nộp đơn ứng tuyển thành viên mới
   */
  submitApplication: async (
    data: ApplicationFormRequest
  ): Promise<ApplicationFormResponse> => {
    const response = await apiClient.post<ApiResponse<ApplicationFormResponse>>(
      "/api/auth/applications",
      data
    );
    return response.data.data;
  },

  /**
   * Tải ảnh chân dung / ảnh thẻ của ứng viên khi nộp đơn online
   */
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<ApiResponse<string>>(
      "/api/auth/applications/upload-avatar",
      formData
    );
    return response.data.data;
  },
};

export default publicApplicationService;
