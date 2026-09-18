import apiClient from "./apiClient";
import { RecruitmentDto, CreateRecruitmentRequest } from "@/types/recruitment";
import { PageResponse, ApiResponse } from "@/types/user";

const BASE_PATH = "/api/admin/recruitments";

export const adminRecruitmentService = {
  /**
   * Lấy thông tin đợt tuyển đang active
   */
  getActiveRecruitment: async (): Promise<RecruitmentDto | null> => {
    const response = await apiClient.get<ApiResponse<RecruitmentDto>>(
      `${BASE_PATH}/active`
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách đợt tuyển với phân trang
   */
  getAllRecruitments: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<RecruitmentDto>> => {
    const response = await apiClient.get<
      ApiResponse<PageResponse<RecruitmentDto>>
    >(BASE_PATH, {
      params: { page, size },
    });
    return response.data.data;
  },

  /**
   * Lấy thông tin chi tiết đợt tuyển theo id
   */
  getRecruitmentById: async (id: number): Promise<RecruitmentDto> => {
    const response = await apiClient.get<ApiResponse<RecruitmentDto>>(
      `${BASE_PATH}/${id}`
    );
    return response.data.data;
  },

  /**
   * Tạo đợt tuyển thành viên mới
   */
  createRecruitment: async (
    request: CreateRecruitmentRequest
  ): Promise<RecruitmentDto> => {
    const response = await apiClient.post<ApiResponse<RecruitmentDto>>(
      BASE_PATH,
      request
    );
    return response.data.data;
  },

  /**
   * Cập nhật đợt tuyển thành viên
   */
  updateRecruitment: async (
    id: number,
    request: CreateRecruitmentRequest
  ): Promise<RecruitmentDto> => {
    const response = await apiClient.put<ApiResponse<RecruitmentDto>>(
      `${BASE_PATH}/${id}`,
      request
    );
    return response.data.data;
  },

  /**
   * Kích hoạt đợt tuyển thành viên
   */
  activateRecruitment: async (id: number): Promise<void> => {
    await apiClient.put(`${BASE_PATH}/${id}/activate`);
  },

  /**
   * Đóng đợt tuyển thành viên
   */
  closeRecruitment: async (id: number): Promise<void> => {
    await apiClient.put(`${BASE_PATH}/${id}/close`);
  },

  /**
   * Xóa mềm đợt tuyển thành viên
   */
  deleteRecruitment: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};

export default adminRecruitmentService;
