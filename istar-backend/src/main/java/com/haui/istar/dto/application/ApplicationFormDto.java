package com.haui.istar.dto.application;

import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.School;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationFormDto {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDate birthday;
    private String address;
    private String phoneNumber;
    private School school;
    private String majorClass;
    private String course;
    private String reasonDepartment;
    private String knowIStar;
    private String reasonIStarer;
    private String avatarUrl;
    private String cvUrl;
    private ApplicationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long version;
    
    private Long recruitmentId;
    private String recruitmentName;
    private List<ApplicationDepartmentDto> applicationDepartments;
}
