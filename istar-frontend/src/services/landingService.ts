import { apiClient } from "./apiClient";
import { HomepageConfig } from "@/types/landing";

export const landingService = {
  /**
   * Lấy cấu hình trang chủ công khai (dành cho visitor)
   */
  async getPublicHomepageConfig(): Promise<HomepageConfig> {
    const response = await apiClient.get("/api/public/homepage");
    return response.data.data;
  },

  /**
   * Lấy cấu hình trang chủ trong trang quản trị
   */
  async getAdminHomepageConfig(): Promise<HomepageConfig> {
    const response = await apiClient.get("/api/admin/homepage");
    return response.data.data;
  },

  /**
   * Cập nhật toàn bộ cấu hình trang chủ (dành cho Admin)
   */
  async updateHomepageConfig(config: HomepageConfig): Promise<HomepageConfig> {
    const response = await apiClient.put("/api/admin/homepage", config);
    return response.data.data;
  },

  /**
   * Tải ảnh lên phục vụ các section trên trang chủ
   */
  async uploadLandingImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/api/admin/homepage/upload-image", formData);
    const responseData = response.data.data;
    // Handle both Map.of("url", fileUrl) and direct fileUrl string
    if (typeof responseData === "string") {
      return responseData;
    } else if (responseData && responseData.url) {
      return responseData.url;
    }
    return String(responseData);
  },
};
