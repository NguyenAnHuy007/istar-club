package com.haui.istar.dto.application;

import java.time.LocalDate;

import com.haui.istar.model.enums.School;

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

    private java.util.List<ApplicationDepartmentDto> applicationDepartments;

    private School school;

    private String majorClass;

    private String course;

    private String avatarUrl;

    private String cvUrl;
}
