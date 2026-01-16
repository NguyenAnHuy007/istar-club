package com.haui.istar.model.enums;

import lombok.Getter;

@Getter
public enum School {
    CNTT("Trường Công nghệ Thông tin"),
    KINH_TE("Trường Kinh tế"),
    CO_KHI_O_TO("Trường Cơ khí - Ô tô"),
    DIEN_DIEN_TU("Trường Điện - Điện tử"),
    NGOAI_NGU_DU_LICH("Trường Ngoại ngữ Du lịch"),
    MAY_THIET_KE("Khoa May và Thiết kế Thời trang"),
    HOA("Khoa Hóa"),
    VIET_NHAT("Trung tâm Việt Nhật");

    private final String displayName;

    School(String displayName) {
        this.displayName = displayName;
    }
}
