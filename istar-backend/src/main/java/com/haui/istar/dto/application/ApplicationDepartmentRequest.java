package com.haui.istar.dto.application;

import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Department;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationDepartmentRequest {
    @NotNull(message = "Ban ứng tuyển không được để trống")
    private Department department;

    private ApplicationStatus status;

    @DecimalMin(value = "0.0", message = "Điểm phỏng vấn phải >= 0.0")
    @DecimalMax(value = "10.0", message = "Điểm phỏng vấn phải <= 10.0")
    private Double interviewScore;

    @Size(max = 1000, message = "Nhận xét phỏng vấn tối đa 1000 ký tự")
    private String interviewNotes;
}

