package com.haui.istar.dto.generation;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateGenerationRequest {

    @NotBlank(message = "Tên gen không được để trống")
    @Size(max = 100, message = "Tên gen tối đa 100 ký tự")
    private String name;

    @NotNull(message = "Năm tham gia không được để trống")
    @Min(value = 2000, message = "Năm tham gia phải từ năm 2000")
    @Max(value = 2100, message = "Năm tham gia không hợp lệ")
    private Integer yearJoined;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String description;
}
