import apiClient from "./apiClient";
import {
  ApplicationDepartmentDto,
  ApplicationFormDto,
  ApplicationFormRequest,
  ApplicationFormResponse,
} from "@/types/application";
import { ApiResponse } from "@/types/user";

export const interviewService = {
  /**
   * Lễ tân điểm danh ứng viên (chuyển sang CHECKED_IN)
   */
  checkIn: async (applicationId: number): Promise<void> => {
    await apiClient.put(`/api/reception/applications/${applicationId}/checkin`);
  },

  /**
   * Lễ tân đánh dấu vắng mặt (chuyển sang NO_SHOW)
   */
  noShow: async (applicationId: number): Promise<void> => {
    await apiClient.put(`/api/reception/applications/${applicationId}/no-show`);
  },

  /**
   * Hoàn tác về trạng thái đã nộp đơn (SUBMITTED)
   */
  revertSubmitted: async (applicationId: number): Promise<void> => {
    await apiClient.put(`/api/reception/applications/${applicationId}/revert-submitted`);
  },

  /**
   * Lấy hàng chờ phỏng vấn các ban do người dùng phụ trách
   */
  getQueue: async (): Promise<ApplicationDepartmentDto[]> => {
    const response = await apiClient.get<ApplicationDepartmentDto[]>(
      "/api/interview/queue"
    );
    return response.data;
  },

  /**
   * Bắt đầu phỏng vấn nguyện vọng ban (chuyển sang INTERVIEWING)
   */
  startInterview: async (
    applicationDepartmentId: number
  ): Promise<ApplicationDepartmentDto> => {
    const response = await apiClient.put<ApplicationDepartmentDto>(
      `/api/interview/applications/${applicationDepartmentId}/start`
    );
    return response.data;
  },

  /**
   * Hoàn thành phỏng vấn (chấm điểm & nhận xét, chuyển ban sang INTERVIEWED)
   */
  completeInterview: async (
    applicationDepartmentId: number,
    data: { interviewScore: number; interviewNotes: string }
  ): Promise<ApplicationDepartmentDto> => {
    const response = await apiClient.put<ApplicationDepartmentDto>(
      `/api/interview/applications/${applicationDepartmentId}/complete`,
      data
    );
    return response.data;
  },

  /**
   * Bắt đầu phỏng vấn cho nhiều ban được chọn cùng lúc
   */
  startMultiInterview: async (
    applicationId: number,
    departmentIds: number[]
  ): Promise<ApplicationFormDto> => {
    const response = await apiClient.put<ApplicationFormDto>(
      `/api/interview/applications/${applicationId}/start-multi`,
      { departmentIds }
    );
    return response.data;
  },

  /**
   * Hoàn thành phỏng vấn đa ban (chấm điểm & nhận xét nhiều ban)
   */
  completeMultiInterview: async (
    applicationId: number,
    scores: { departmentId: number; interviewScore: number; interviewNotes: string }[]
  ): Promise<ApplicationFormDto> => {
    const response = await apiClient.put<ApplicationFormDto>(
      `/api/interview/applications/${applicationId}/complete-multi`,
      { scores }
    );
    return response.data;
  },

  /**
   * Lễ tân / Quản trị viên tạo đơn ứng tuyển mới trực tiếp
   */
  createApplication: async (
    data: ApplicationFormRequest
  ): Promise<ApplicationFormResponse> => {
    const response = await apiClient.post<ApiResponse<ApplicationFormResponse>>(
      "/api/admin/applications",
      data
    );
    return response.data.data;
  },
};

export default interviewService;
