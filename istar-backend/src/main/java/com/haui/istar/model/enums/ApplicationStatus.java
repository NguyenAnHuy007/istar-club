package com.haui.istar.model.enums;

import lombok.Getter;

@Getter
public enum ApplicationStatus {

    SUBMITTED("Đã nộp đơn"),
    CHECKED_IN("Đã điểm danh"),
    INTERVIEWING("Đang phỏng vấn"),
    INTERVIEWED("Đã phỏng vấn"),
    NO_SHOW("Không đến phỏng vấn"),
    APPROVED("Đã duyệt"),
    REJECTED("Bị từ chối");

    private final String displayName;

    ApplicationStatus(String displayName) {
        this.displayName = displayName;
    }

    @com.fasterxml.jackson.annotation.JsonCreator
    public static ApplicationStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (ApplicationStatus status : ApplicationStatus.values()) {
            if (status.name().equalsIgnoreCase(value.trim()) || status.displayName.equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown ApplicationStatus: " + value);
    }

    @com.fasterxml.jackson.annotation.JsonValue
    public String toValue() {
        return this.name();
    }
}
