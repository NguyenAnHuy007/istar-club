// java
package com.haui.istar.model.enums;

import lombok.Getter;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

@Getter
public enum Department {
    MUSIC("Âm nhạc", SubDepartment.SINGING, SubDepartment.RAP, SubDepartment.INSTRUMENT, SubDepartment.NONE),
    DANCE("Nhảy"),
    TRADITIONAL_DANCE("Múa"),
    EVENT("Sự kiện");

    private final String displayName;
    private final Set<SubDepartment> subDepartments;

    Department(String displayName, SubDepartment... subDepartments) {
        this.displayName = displayName;
        if (subDepartments == null || subDepartments.length == 0) {
            this.subDepartments = Collections.emptySet();
        } else {
            EnumSet<SubDepartment> set = EnumSet.noneOf(SubDepartment.class);
            Collections.addAll(set, subDepartments);
            this.subDepartments = Collections.unmodifiableSet(set);
        }
    }
}