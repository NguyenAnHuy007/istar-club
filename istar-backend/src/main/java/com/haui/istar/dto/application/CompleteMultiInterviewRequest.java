package com.haui.istar.dto.application;

import jakarta.validation.Valid;
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
public class CompleteMultiInterviewRequest {

    @NotEmpty(message = "Danh sách kết quả phỏng vấn không được để trống")
    @Valid
    private List<DepartmentScoreItem> scores;
}
