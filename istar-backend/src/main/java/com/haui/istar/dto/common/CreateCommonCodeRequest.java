package com.haui.istar.dto.common;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCommonCodeRequest {

    @NotBlank(message = "Category không được để trống")
    @Size(max = 50, message = "Category tối đa 50 ký tự")
    private String category;

    @NotBlank(message = "Code không được để trống")
    @Size(max = 50, message = "Code tối đa 50 ký tự")
    private String code;

    @NotBlank(message = "Tên hiển thị không được để trống")
    @Size(max = 255, message = "Tên tối đa 255 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String description;

    @Builder.Default
    private Integer orderIndex = 0;
}
