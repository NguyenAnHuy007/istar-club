package com.haui.istar.controller.publicapi;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.landing.HomepageConfigDto;
import com.haui.istar.service.LandingConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/homepage")
@RequiredArgsConstructor
public class PublicLandingConfigController {

    private final LandingConfigService landingConfigService;

    @GetMapping
    public ResponseEntity<ApiResponse<HomepageConfigDto>> getHomepageConfig() {
        HomepageConfigDto config = landingConfigService.getHomepageConfig();
        return ResponseEntity.ok(ApiResponse.success("Lấy cấu hình trang chủ thành công", config));
    }
}
