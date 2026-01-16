package com.haui.istar.model.enums;

import lombok.Getter;

@Getter
public enum ApplicationStatus {

    SUBMITTED("Đã submit"),
    CHECKED_IN("Đã checkin"),
    INTERVIEWED("Đã phỏng vấn"),
    NO_SHOW("Không đến phỏng vấn"),
    APPROVED("Đã duyệt"),
    REJECTED("Bị từ chối");

    private final String displayName;

    ApplicationStatus(String displayName) {
        this.displayName = displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
