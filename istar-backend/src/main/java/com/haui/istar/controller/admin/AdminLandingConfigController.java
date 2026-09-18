package com.haui.istar.controller.admin;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.landing.HomepageConfigDto;
import com.haui.istar.security.UserPrincipal;
import com.haui.istar.service.LandingConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/homepage")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('PERM_SYSTEM_CONFIG', 'SYSTEM_CONFIG', 'ROLE_ADMIN')")
public class AdminLandingConfigController {

    private final LandingConfigService landingConfigService;

    @GetMapping
    public ResponseEntity<ApiResponse<HomepageConfigDto>> getHomepageConfig() {
        HomepageConfigDto config = landingConfigService.getHomepageConfig();
        return ResponseEntity.ok(ApiResponse.success("Lấy cấu hình trang chủ thành công", config));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<HomepageConfigDto>> updateHomepageConfig(
            @Valid @RequestBody HomepageConfigDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String username = principal != null ? principal.getUsername() : "system";
        HomepageConfigDto updated = landingConfigService.updateHomepageConfig(request, username);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật cấu hình trang chủ thành công", updated));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadLandingImage(
            @RequestParam("file") MultipartFile file
    ) {
        String fileUrl = landingConfigService.uploadLandingImage(file);
        return ResponseEntity.ok(ApiResponse.success("Tải lên ảnh thành công", Map.of("url", fileUrl)));
    }
}
