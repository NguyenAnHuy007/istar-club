package com.haui.istar.dto.application;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
public class DepartmentScoreItem {

    @NotNull(message = "Department ID không được để trống")
    private Long departmentId;

    @NotNull(message = "Điểm phỏng vấn không được để trống")
    @DecimalMin(value = "0.0", message = "Điểm phỏng vấn phải >= 0")
    @DecimalMax(value = "10.0", message = "Điểm phỏng vấn phải <= 10")
    private Double interviewScore;

    @NotBlank(message = "Nhận xét phỏng vấn không được để trống")
    private String interviewNotes;
}
