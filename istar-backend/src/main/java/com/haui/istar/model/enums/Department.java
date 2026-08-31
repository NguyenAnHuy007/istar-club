package com.haui.istar.model.enums;

import lombok.Getter;

@Getter
public enum Department {
    MUSIC("Ban âm nhạc"),
    RAP("Ban rap"),
    MEDIA_AND_EVENT("Ban Truyền thông và tổ chức sự kiện"),
    DANCE("Ban vũ đạo");

    private final String displayName;

    Department(String displayName) {
        this.displayName = displayName;
    }
}