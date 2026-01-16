package com.haui.istar.model.enums;

import lombok.Getter;

@Getter
public enum Position {
    PRESIDENT("Chủ nhiệm"),
    VICE_PRESIDENT("Phó chủ nhiệm"),
    DEPARTMENT_HEAD("Trưởng ban"),
    AREA_MANAGER("Ban phụ trách khu vực"),
    MEMBER("Thành viên");

    private final String displayName;

    Position(String displayName) {
        this.displayName = displayName;
    }

}
