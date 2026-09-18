package com.haui.istar.service;

import com.haui.istar.dto.dashboard.DashboardStatsDto;

public interface AdminDashboardService {
    /**
     * Lấy dữ liệu thống kê tổng quan và phân tích chuyên sâu cho Dashboard quản trị.
     *
     * @param recruitmentId ID của đợt tuyển (tùy chọn; nếu null sẽ ưu tiên đợt active hoặc toàn bộ)
     * @return DashboardStatsDto chứa các chỉ số, phân bổ ban, phổ trạng thái và xu hướng
     */
    DashboardStatsDto getDashboardStats(Long recruitmentId);
}
