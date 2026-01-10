package com.haui.istar.dto.user;

import java.time.LocalDate;

import com.haui.istar.model.Department;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationFormRequest {
    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;

    private String firstName;

    private String lastName;

    private LocalDate birthday;

    private String address;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    private Department department;

    @NotBlank
    private String reasonDepartment;

    @NotBlank
    private String knowIStar;

    @NotBlank
    private String reasonIStarer;

    private String cvUrl;

}
