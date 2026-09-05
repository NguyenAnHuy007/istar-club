package com.haui.istar.dto.application;

import com.haui.istar.model.enums.ApplicationStatus;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminApplicationUpdateRequest {

    @Email(message = "Email không hợp lệ")
    private String email;

    private String firstName;
    private String lastName;
    private LocalDate birthday;
    private String address;
    private String phoneNumber;
    private List<ApplicationDepartmentRequest> departments;
    private String school;
    private String majorClass;
    private String course;
    private String knowIStar;
    private String reasonIStarer;
    private String avatarUrl;
    private ApplicationStatus status;
}
