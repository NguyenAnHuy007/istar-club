package com.haui.istar.dto.application;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartInterviewRequest {
    @NotEmpty(message = "Danh sách ban phỏng vấn không được để trống")
    private List<Long> departmentIds;
}
