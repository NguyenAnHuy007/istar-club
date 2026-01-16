package com.haui.istar.model.enums;

import lombok.Getter;

@Getter
public enum Area {
    HANOI("Hà Nội"),
    NINH_BINH("Ninh Bình");

    private final String displayName;

    Area(String displayName) {
        this.displayName = displayName;
    }

}
