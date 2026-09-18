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
public class DepartmentItemDto {

    private String id;

    @NotBlank(message = "Icon của ban không được để trống!")
    private String icon;

    @NotBlank(message = "Tên ban không được để trống!")
    private String name;

    @NotBlank(message = "Mô tả của ban không được để trống!")
    private String description;

    private String gradient;

    private String glowColor;
}
