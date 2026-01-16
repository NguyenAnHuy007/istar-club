package com.haui.istar.model.enums;

import lombok.Getter;

@Getter
public enum Role {
    ADMIN("Admin"),
    HEAD("Trưởng ban"),
    MEMBER("Thành viên");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

}
