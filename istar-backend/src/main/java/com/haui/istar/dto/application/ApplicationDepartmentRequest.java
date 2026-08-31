package com.haui.istar.dto.application;

import com.haui.istar.model.enums.Department;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationDepartmentRequest {
    @NotNull(message = "Department is required")
    private Department department;
}
