package com.haui.istar.dto.generation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    private String name;

    @NotNull(message = "Năm tham gia không được để trống")
    private Integer yearJoined;

    private String description;
}
