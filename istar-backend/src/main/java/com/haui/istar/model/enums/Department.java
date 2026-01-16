package com.haui.istar.model.enums;

import lombok.Getter;

@Getter
public enum Department {
    MUSIC("Âm nhạc"),
    DANCE("Nhảy"),
    TRADITIONAL_DANCE("Múa"),
    EVENT("Sự kiện");

    private final String displayName;

    Department(String displayName) {
        this.displayName = displayName;
    }

}
