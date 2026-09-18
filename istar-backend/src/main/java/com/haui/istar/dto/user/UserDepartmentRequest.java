package com.haui.istar.dto.user;

import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDepartmentRequest {
    @NotNull(message = "Ban hoạt động không được để trống")
    private Department department;
    private Position position;
}
