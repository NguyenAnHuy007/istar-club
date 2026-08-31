package com.haui.istar.controller.admin;

import com.haui.istar.dto.application.*;
import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.service.AdminApplicationService;
import com.haui.istar.service.ApplicationFormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/admin/applications")
@RequiredArgsConstructor
public class AdminApplicationController {

    private final ApplicationFormService applicationFormService;
    private final AdminApplicationService adminApplicationService;

    @PostMapping("/search")
    @PreAuthorize("hasAuthority('APPLICATION_VIEW')")
    public ResponseEntity<ApiResponse<Page<ApplicationFormDto>>> searchApplications(
            @RequestBody AdminApplicationSearchCriteria criteria) {
        Page<ApplicationFormDto> applications = adminApplicationService.searchApplications(criteria);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm đơn ứng tuyển thành công", applications));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('APPLICATION_VIEW')")
    public ResponseEntity<ApiResponse<ApplicationFormDto>> getApplicationById(@PathVariable Long id) {
        ApplicationFormDto application = adminApplicationService.getApplicationById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn thành công", application));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('APPLICATION_EDIT')")
    public ResponseEntity<ApiResponse<ApplicationFormDto>> updateApplication(
            @PathVariable Long id,
            @RequestBody @Valid AdminApplicationUpdateRequest request) {
        ApplicationFormDto updated = adminApplicationService.updateApplication(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('APPLICATION_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(@PathVariable Long id) {
        adminApplicationService.deleteApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mềm đơn ứng tuyển thành công", null));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('APPLICATION_REVIEW')")
    public ResponseEntity<ApiResponse<Void>> approveApplication(@PathVariable Long id) {
        adminApplicationService.approveApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Duyệt đơn thành công", null));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('APPLICATION_REVIEW')")
    public ResponseEntity<ApiResponse<Void>> rejectApplication(@PathVariable Long id) {
        adminApplicationService.rejectApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Từ chối đơn thành công", null));
    }

    @GetMapping("/export-excel")
    @PreAuthorize("hasAuthority('APPLICATION_EXPORT')")
    public ResponseEntity<byte[]> exportExcel() throws IOException {
        ByteArrayInputStream in = applicationFormService.exportExcel();
        byte[] excelBytes = in.readAllBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=istar_applications.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentLength(excelBytes.length)
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ))
                .body(excelBytes);
    }

    @PostMapping("/{id}/upload-avatar")
    @PreAuthorize("hasAuthority('APPLICATION_EDIT')")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        String url = adminApplicationService.uploadAvatar(id, file);
        return ResponseEntity.ok(ApiResponse.success("Tải lên ảnh đại diện thành công", url));
    }

    @PostMapping("/{id}/upload-cv")
    @PreAuthorize("hasAuthority('APPLICATION_EDIT')")
    public ResponseEntity<ApiResponse<String>> uploadCv(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        String url = adminApplicationService.uploadCv(id, file);
        return ResponseEntity.ok(ApiResponse.success("Tải lên CV thành công", url));
    }

    @PostMapping("/{id}/create-account")
    @PreAuthorize("hasAuthority('APPLICATION_CREATE_ACCOUNT')")
    public ResponseEntity<ApiResponse<Void>> createAccount(@PathVariable Long id) {
        adminApplicationService.createAccountFromApprovedApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản thành công", null));
    }
}
