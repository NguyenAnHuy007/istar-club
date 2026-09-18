package com.haui.istar.dto.user;

import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDepartmentDto {
    private Long id;
    private Department department;
    private Position position;
}
