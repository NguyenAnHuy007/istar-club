import apiClient from "./apiClient";
import {
  ApplicationFormDto,
  AdminApplicationSearchCriteria,
  AdminApplicationUpdateRequest,
} from "@/types/application";
import { PageResponse, ApiResponse } from "@/types/user";

const BASE_PATH = "/api/admin/applications";

export const adminApplicationService = {
  /**
   * Tìm kiếm đơn ứng tuyển theo nhiều tiêu chí với phân trang
   */
  searchApplications: async (
    criteria: AdminApplicationSearchCriteria
  ): Promise<PageResponse<ApplicationFormDto>> => {
    const response = await apiClient.post<
      ApiResponse<PageResponse<ApplicationFormDto>>
    >(`${BASE_PATH}/search`, criteria);
    return response.data.data;
  },

  /**
   * Lấy thông tin chi tiết đơn ứng tuyển theo id
   */
  getApplicationById: async (id: number): Promise<ApplicationFormDto> => {
    const response = await apiClient.get<ApiResponse<ApplicationFormDto>>(
      `${BASE_PATH}/${id}`
    );
    return response.data.data;
  },

  /**
   * Cập nhật thông tin đơn ứng tuyển
   */
  updateApplication: async (
    id: number,
    request: AdminApplicationUpdateRequest
  ): Promise<ApplicationFormDto> => {
    const response = await apiClient.put<ApiResponse<ApplicationFormDto>>(
      `${BASE_PATH}/${id}`,
      request
    );
    return response.data.data;
  },

  /**
   * Xóa mềm đơn ứng tuyển
   */
  deleteApplication: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Duyệt đơn ứng tuyển (chuyển sang APPROVED)
   */
  approveApplication: async (id: number): Promise<void> => {
    await apiClient.put(`${BASE_PATH}/${id}/approve`);
  },

  /**
   * Từ chối đơn ứng tuyển (chuyển sang REJECTED)
   */
  rejectApplication: async (id: number): Promise<void> => {
    await apiClient.put(`${BASE_PATH}/${id}/reject`);
  },

  /**
   * Tạo tài khoản thành viên từ đơn đã duyệt
   */
  createAccount: async (id: number): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/${id}/create-account`);
  },

  /**
   * Tải ảnh đại diện cho ứng viên
   */
  uploadAvatar: async (id: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<ApiResponse<string>>(
      `${BASE_PATH}/${id}/upload-avatar`,
      formData
    );
    return response.data.data;
  },

  /**
   * Xóa ảnh đại diện của ứng viên
   */
  deleteAvatar: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}/avatar`);
  },

  /**
   * Xuất danh sách đơn ứng tuyển ra file Excel (có lọc theo bộ lọc hiện tại)
   */
  exportExcel: async (criteria?: AdminApplicationSearchCriteria): Promise<void> => {
    const response = criteria
      ? await apiClient.post(`${BASE_PATH}/export-excel`, criteria, { responseType: "blob" })
      : await apiClient.get(`${BASE_PATH}/export-excel`, { responseType: "blob" });

    downloadBlob(response.data, `danh_sach_ung_tuyen_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  /**
   * Tải template Excel mẫu cho import dữ liệu
   */
  downloadExcelTemplate: async (): Promise<void> => {
    const response = await apiClient.get(`${BASE_PATH}/excel-template`, {
      responseType: "blob",
    });
    downloadBlob(response.data, "istar_template.xlsx");
  },

  /**
   * Upload file Excel để import dữ liệu ứng viên
   */
  importExcel: async (file: File, recruitmentId?: number): Promise<number> => {
    const formData = new FormData();
    formData.append("file", file);
    if (recruitmentId) formData.append("recruitmentId", String(recruitmentId));
    const response = await apiClient.post<ApiResponse<number>>(
      `${BASE_PATH}/import-excel`,
      formData
    );
    return response.data.data;
  },
};

function downloadBlob(data: BlobPart, filename: string) {
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default adminApplicationService;
