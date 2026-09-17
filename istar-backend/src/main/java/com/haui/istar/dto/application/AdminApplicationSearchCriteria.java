package com.haui.istar.dto.application;

import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Area;
import com.haui.istar.model.enums.Department;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminApplicationSearchCriteria {

    private String keyword;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Department department;
    private Area area;
    private ApplicationStatus status;
    private java.util.List<ApplicationStatus> statuses;
    private Long recruitmentId;
    private Boolean activeRecruitmentOnly;
    private java.util.List<Department> allowedDepartments;
    private Boolean deptNotInterviewedOnly;
    private LocalDate birthdayFrom;
    private LocalDate birthdayTo;
    private LocalDate createdFrom;
    private LocalDate createdTo;
    private String school;
    private String course;

    // Pagination
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDirection;
}
