package com.haui.istar.dto.landing;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchievementItemDto {

    private String id;

    @NotBlank(message = "Năm đạt giải không được để trống!")
    private String year;

    @NotBlank(message = "Tiêu đề thành tích không được để trống!")
    private String title;

    @NotBlank(message = "Mô tả thành tích không được để trống!")
    private String description;

    private String imageUrl;
}
