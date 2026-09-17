package com.haui.istar.controller.publicapi;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.recruitment.RecruitmentDto;
import com.haui.istar.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/recruitments")
@RequiredArgsConstructor
public class PublicRecruitmentController {

    private final RecruitmentService recruitmentService;

    /**
     * API public lấy thông tin đợt tuyển thành viên đang hoạt động (active).
     * Trả về null trong data nếu hiện tại không có đợt nào đang mở.
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<RecruitmentDto>> getActiveRecruitment() {
        RecruitmentDto activeRecruitment = recruitmentService.getActiveRecruitment();
        return ResponseEntity.ok(ApiResponse.success("Lấy đợt tuyển đang hoạt động thành công", activeRecruitment));
    }
}
