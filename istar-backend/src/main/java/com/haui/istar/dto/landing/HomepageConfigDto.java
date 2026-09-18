package com.haui.istar.dto.landing;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomepageConfigDto {

    @Valid
    @NotNull(message = "Cấu hình Hero section không được null!")
    private HeroConfig hero;

    @Valid
    @NotNull(message = "Cấu hình About section không được null!")
    private AboutConfig about;

    @Valid
    @NotNull(message = "Cấu hình Department section không được null!")
    private DepartmentSectionConfig departments;

    @Valid
    @NotNull(message = "Cấu hình Achievement section không được null!")
    private AchievementSectionConfig achievements;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HeroConfig {
        private String badge;
        private String headline;

        @NotBlank(message = "Subtitle của Hero không được để trống!")
        private String subtitle;

        private String imageUrl;
        private String primaryButtonText;
        private String primaryButtonUrl;
        private String secondaryButtonText;
        private String secondaryButtonUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AboutConfig {
        private String badge;
        private String title;

        @NotNull(message = "Danh sách đoạn văn giới thiệu không được null!")
        @Size(min = 1, message = "Phải có ít nhất 1 đoạn văn giới thiệu!")
        private List<String> paragraphs;

        private AboutImageDto imageLarge;
        private AboutImageDto imageSmall1;
        private AboutImageDto imageSmall2;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentSectionConfig {
        private String badge;

        @NotBlank(message = "Tiêu đề phần các ban không được để trống!")
        private String title;

        private String subtitle;

        @NotNull(message = "Danh sách ban không được null!")
        @Size(min = 2, max = 6, message = "Số lượng ban phải từ 2 đến 6 ban!")
        @Valid
        private List<DepartmentItemDto> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AchievementSectionConfig {
        private String badge;

        @NotBlank(message = "Tiêu đề phần thành tích không được để trống!")
        private String title;

        private String subtitle;

        @NotNull(message = "Danh sách thành tích không được null!")
        @Valid
        private List<AchievementItemDto> items;
    }
}
