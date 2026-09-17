package com.haui.istar.controller.user;

import com.haui.istar.dto.application.ApplicationFormRequest;
import com.haui.istar.dto.application.ApplicationFormResponse;
import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.service.ApplicationFormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth/applications")
@RequiredArgsConstructor
public class ApplicationFormController {

    private final ApplicationFormService applicationFormService;

    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationFormResponse>> submitApplication(
            @RequestBody @Valid ApplicationFormRequest request) {
        ApplicationFormResponse response = applicationFormService.submitApplication(request);
        return ResponseEntity.ok(ApiResponse.success("Nộp đơn ứng tuyển thành công!", response));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('APPLICATION_EDIT', 'ROLE_ADMIN', 'PERM_APPLICATION_EDIT')")
    public ResponseEntity<ApiResponse<ApplicationFormResponse>> updateApplication(
            @PathVariable Long id,
            @RequestBody @Valid ApplicationFormRequest request) {
        ApplicationFormResponse response = applicationFormService.updateById(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn ứng tuyển thành công!", response));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('APPLICATION_DELETE', 'ROLE_ADMIN', 'PERM_APPLICATION_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(@PathVariable Long id) {
        applicationFormService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn ứng tuyển thành công!", null));
    }

    @PostMapping("/{id}/upload-avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        String url = applicationFormService.uploadAvatar(id, file);
        return ResponseEntity.ok(ApiResponse.success("Tải lên ảnh đại diện thành công!", url));
    }
}
