package com.haui.istar.dto.application;

import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.SubDepartment;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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
    private Department department;
    private SubDepartment subDepartment;
    private String reasonDepartment;
    private String knowIStar;
    private String reasonIStarer;
    private String cvUrl;
    private ApplicationStatus status;
}
