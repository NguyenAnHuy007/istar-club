package com.haui.istar.controller.admin;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.dashboard.DashboardStatsDto;
import com.haui.istar.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN', 'APPLICATION_VIEW', 'PERM_APPLICATION_VIEW', 'RECRUITMENT_MANAGE', 'PERM_RECRUITMENT_MANAGE')")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats(
            @RequestParam(required = false) Long recruitmentId
    ) {
        DashboardStatsDto stats = adminDashboardService.getDashboardStats(recruitmentId);
        return ResponseEntity.ok(ApiResponse.success("Lấy dữ liệu thống kê tổng quan thành công", stats));
    }
}
