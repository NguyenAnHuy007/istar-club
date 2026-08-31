package com.haui.istar.dto.application;

import java.time.LocalDate;
import java.util.List;

import com.haui.istar.model.enums.School;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "recruitmentId không được để trống")
    private Long recruitmentId;

    @NotEmpty(message = "Phải chọn ít nhất một ban")
    private List<ApplicationDepartmentRequest> departments;

    private School school;

    private String majorClass;

    private String course;

    @NotBlank
    private String reasonDepartment;

    @NotBlank
    private String knowIStar;

    @NotBlank
    private String reasonIStarer;

    private String avatarUrl;

    private String cvUrl;

}
