package com.haui.istar.dto.user;

import com.haui.istar.model.enums.Department;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelfUserDepartmentRequest {
    @NotNull(message = "Ban hoạt động không được để trống")
    private Department department;
}
