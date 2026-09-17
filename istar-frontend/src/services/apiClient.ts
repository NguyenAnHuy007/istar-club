import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token JWT vào Header Authorization nếu có
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi 401 tập trung (nếu token hết hạn, xóa phiên và chuyển về /login với cảnh báo)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      // Không xóa session nếu là lỗi gõ sai mật khẩu ở màn login
      if (!requestUrl.includes("/api/auth/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
          const redirectQuery = encodeURIComponent(currentPath + window.location.search);
          window.location.href = `/login?expired=true&redirect=${redirectQuery}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
