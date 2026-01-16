package com.haui.istar.model.enums;

import lombok.Getter;

@Getter
public enum SubDepartment {
    NONE("Không có"),
    SINGING("Hát"),
    RAP("Rap"),
    INSTRUMENT("Nhạc cụ");

    private final String displayName;

    SubDepartment(String displayName) {
        this.displayName = displayName;
    }

}
