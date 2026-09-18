import apiClient from "./apiClient";
import { DashboardStats } from "@/types/dashboard";
import { ApiResponse } from "@/types/user";

export const adminDashboardService = {
  /**
   * Lấy dữ liệu thống kê tổng quan và phân tích chuyên sâu cho Dashboard
   * @param recruitmentId Tùy chọn ID đợt tuyển
   */
  getDashboardStats: async (recruitmentId?: number): Promise<DashboardStats> => {
    const params = recruitmentId ? { recruitmentId } : undefined;
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      "/api/admin/dashboard/stats",
      { params }
    );
    return response.data.data;
  },
};

export default adminDashboardService;
