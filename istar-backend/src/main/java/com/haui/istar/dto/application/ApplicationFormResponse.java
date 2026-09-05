package com.haui.istar.dto.application;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationFormResponse {
    private Long id;

    private String fullName;
    
    private String email;

    private String firstName;

    private String lastName;

    private LocalDate birthday;

    private String phoneNumber;

    private List<ApplicationDepartmentDto> applicationDepartments;

    private String school;

    private String majorClass;

    private String course;

    private String avatarUrl;
}
