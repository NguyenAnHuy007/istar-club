import apiClient from "./apiClient";
import { RecruitmentDto } from "@/types/recruitment";
import { ApiResponse } from "@/types/user";

export const publicRecruitmentService = {
  /**
   * Lấy thông tin đợt tuyển thành viên đang hoạt động (active).
   * Trả về null nếu hiện tại không có đợt nào đang mở.
   */
  getActiveRecruitment: async (): Promise<RecruitmentDto | null> => {
    const response = await apiClient.get<ApiResponse<RecruitmentDto | null>>(
      "/api/public/recruitments/active"
    );
    return response.data.data;
  },
};

export default publicRecruitmentService;
