package com.haui.istar.model.enums;

import lombok.Getter;

@Getter
public enum Role {
    ADMIN("Quản trị viên"),
    RECEPTIONIST("Lễ tân"),
    INTERVIEWER("Phỏng vấn viên"),
    REVIEWER("Hội đồng xét duyệt"),
    MEMBER("Thành viên");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }
}
