package com.haui.istar.dto.user;

import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDepartmentRequest {
    private Department department;
    private Position position;
}
