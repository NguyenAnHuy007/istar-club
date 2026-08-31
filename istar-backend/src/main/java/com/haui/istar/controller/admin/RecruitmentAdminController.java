package com.haui.istar.controller.admin;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.recruitment.CreateRecruitmentRequest;
import com.haui.istar.dto.recruitment.RecruitmentDto;
import com.haui.istar.service.RecruitmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/recruitments")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PERM_RECRUITMENT_MANAGE')")
public class RecruitmentAdminController {

    private final RecruitmentService recruitmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RecruitmentDto>>> getAllRecruitments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách đợt tuyển thành công",
                recruitmentService.getAllRecruitments(page, size)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecruitmentDto>> getRecruitmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông tin đợt tuyển thành công",
                recruitmentService.getRecruitmentById(id)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecruitmentDto>> createRecruitment(
            @Valid @RequestBody CreateRecruitmentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Tạo đợt tuyển thành công",
                recruitmentService.createRecruitment(request)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecruitmentDto>> updateRecruitment(
            @PathVariable Long id,
            @Valid @RequestBody CreateRecruitmentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật đợt tuyển thành công",
                recruitmentService.updateRecruitment(id, request)
        ));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<Void>> closeRecruitment(@PathVariable Long id) {
        recruitmentService.closeRecruitment(id);
        return ResponseEntity.ok(ApiResponse.success("Đóng đợt tuyển thành công", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecruitment(@PathVariable Long id) {
        recruitmentService.softDeleteRecruitment(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa đợt tuyển thành công", null));
    }
}
