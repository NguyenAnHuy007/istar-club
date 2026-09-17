import apiClient from "./apiClient";

export interface CommonCodeItem {
  id: number;
  category: string;
  code: string;
  name: string;
  description?: string;
  orderIndex: number;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const commonCodeService = {
  /**
   * Lấy toàn bộ danh sách 8 trường học / khoa thuộc HaUI
   */
  async getSchools(): Promise<CommonCodeItem[]> {
    const res = await apiClient.get<ApiResponse<CommonCodeItem[]>>(
      "/api/public/common-codes/schools"
    );
    return res.data.data;
  },

  /**
   * Lấy tất cả các khóa sinh viên (sắp xếp giảm dần K21 -> K12)
   */
  async getAllCourses(): Promise<CommonCodeItem[]> {
    const res = await apiClient.get<ApiResponse<CommonCodeItem[]>>(
      "/api/public/common-codes/courses"
    );
    return res.data.data;
  },

  /**
   * Lấy các khóa sinh viên gần nhất (mặc định 6 khóa)
   */
  async getRecentCourses(limit = 6): Promise<CommonCodeItem[]> {
    const res = await apiClient.get<ApiResponse<CommonCodeItem[]>>(
      `/api/public/common-codes/recent-courses?limit=${limit}`
    );
    return res.data.data;
  },

  /**
   * Lấy danh mục chung theo category
   */
  async getByCategory(category: string): Promise<CommonCodeItem[]> {
    const res = await apiClient.get<ApiResponse<CommonCodeItem[]>>(
      `/api/public/common-codes?category=${encodeURIComponent(category)}`
    );
    return res.data.data;
  },
};

export default commonCodeService;
