package com.haui.istar.dto.auth;

import com.haui.istar.dto.user.UserDepartmentRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
public class RegisterRequest {

    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "Tên đăng nhập chỉ bao gồm chữ cái, số, dấu gạch dưới, gạch ngang hoặc chấm")
    private String username;

    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, max = 100, message = "Password phải từ 6 đến 100 ký tự")
    private String password;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;

    @Size(max = 50, message = "Tên không được vượt quá 50 ký tự")
    private String firstName;

    @Size(max = 50, message = "Họ đệm không được vượt quá 50 ký tự")
    private String lastName;

    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate birthday;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @Valid
    private List<UserDepartmentRequest> userDepartments;

    @Size(max = 100, message = "Trường/khoa không được vượt quá 100 ký tự")
    private String school;

    @Size(max = 100, message = "Lớp chuyên ngành không được vượt quá 100 ký tự")
    private String majorClass;

    @Size(max = 20, message = "Khóa học không được vượt quá 20 ký tự")
    private String course;
}
