import apiClient from "./apiClient";
import {
  User,
  UserSearchCriteria,
  UpdateUserRequest,
  PageResponse,
  ApiResponse,
  Position,
  Department,
} from "@/types/user";

const BASE_PATH = "/api/admin/users";

export const adminUserService = {
  /**
   * Lấy danh sách tất cả user với phân trang
   */
  getAllUsers: async (
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<User>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<User>>>(
      BASE_PATH,
      {
        params: { page, size },
      }
    );
    return response.data.data;
  },

  /**
   * Tìm kiếm user theo nhiều tiêu chí với phân trang
   */
  searchUsers: async (
    criteria: UserSearchCriteria
  ): Promise<PageResponse<User>> => {
    const response = await apiClient.post<ApiResponse<PageResponse<User>>>(
      `${BASE_PATH}/search`,
      criteria
    );
    return response.data.data;
  },

  /**
   * Lấy thông tin chi tiết user theo id
   */
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`${BASE_PATH}/${id}`);
    return response.data.data;
  },

  /**
   * Cập nhật thông tin user
   */
  updateUser: async (
    id: number,
    request: UpdateUserRequest
  ): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${BASE_PATH}/${id}`,
      request
    );
    return response.data.data;
  },

  /**
   * Xóa mềm user (đánh dấu isDeleted = true)
   */
  softDeleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Vô hiệu hóa tài khoản user
   */
  deactivateUser: async (id: number): Promise<void> => {
    await apiClient.put(`${BASE_PATH}/${id}/deactivate`);
  },

  /**
   * Vô hiệu hóa hàng loạt tài khoản user
   */
  bulkDeactivateUsers: async (userIds: number[]): Promise<void> => {
    await apiClient.put(`${BASE_PATH}/bulk-deactivate`, { userIds });
  },

  /**
   * Xóa mềm hàng loạt user
   */
  bulkDeleteUsers: async (userIds: number[]): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/bulk-delete`, { userIds });
  },

  /**
   * Kích hoạt lại tài khoản user
   */
  activateUser: async (id: number): Promise<void> => {
    await apiClient.put(`${BASE_PATH}/${id}/activate`);
  },

  /**
   * Lấy danh sách các Position cho bộ lọc
   */
  getPositions: async (): Promise<Position[]> => {
    const response = await apiClient.get<ApiResponse<Position[]>>(
      `${BASE_PATH}/filters/positions`
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách các Department cho bộ lọc
   */
  getDepartments: async (): Promise<Department[]> => {
    const response = await apiClient.get<ApiResponse<Department[]>>(
      `${BASE_PATH}/filters/departments`
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách các Course cho bộ lọc
   */
  getCourses: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>(
      `${BASE_PATH}/filters/courses`
    );
    return response.data.data;
  },
};
