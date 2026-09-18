package com.haui.istar.service;

import com.haui.istar.dto.landing.HomepageConfigDto;
import org.springframework.web.multipart.MultipartFile;

public interface LandingConfigService {

    HomepageConfigDto getHomepageConfig();

    HomepageConfigDto updateHomepageConfig(HomepageConfigDto request, String updatedBy);

    String uploadLandingImage(MultipartFile file);

    HomepageConfigDto getDefaultHomepageConfig();
}
