package com.haui.istar.dto.user;

import com.haui.istar.model.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
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
public class UpdateUserRequest {

    @Pattern(regexp = "^$|^[a-zA-Z0-9_.-]{3,50}$", message = "Username phải từ 3-50 ký tự và chỉ gồm chữ cái, số, dấu gạch dưới, gạch ngang hoặc chấm")
    private String username;

    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;

    @Pattern(regexp = "^$|^\\s*$|^.{6,100}$", message = "Mật khẩu phải có từ 6 đến 100 ký tự nếu thay đổi")
    private String password;

    @Size(max = 50, message = "Tên không được vượt quá 50 ký tự")
    private String firstName;

    @Size(max = 50, message = "Họ đệm không được vượt quá 50 ký tự")
    private String lastName;

    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate birthday;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @Size(max = 100, message = "Trường/khoa không được vượt quá 100 ký tự")
    private String school;

    @Size(max = 100, message = "Lớp chuyên ngành không được vượt quá 100 ký tự")
    private String majorClass;

    @Size(max = 20, message = "Khóa học không được vượt quá 20 ký tự")
    private String course;

    @Pattern(regexp = "^$|^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ (VD: 0912345678)")
    private String phoneNumber;

    private Boolean isActive;
    private Boolean isDeleted;
    private Role role;
    private List<String> permissionGroupCodes;
    private Position position;
    private Area area;
    private Long generationId;

    @Valid
    private List<UserDepartmentRequest> userDepartments;
}
