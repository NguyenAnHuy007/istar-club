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

    @PostMapping("/upload-avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        String url = applicationFormService.uploadPublicAvatar(file);
        return ResponseEntity.ok(ApiResponse.success("Tải lên ảnh đại diện thành công", url));
    }
}
