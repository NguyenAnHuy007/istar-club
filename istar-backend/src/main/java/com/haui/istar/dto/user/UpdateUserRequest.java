package com.haui.istar.dto.user;

import com.haui.istar.model.enums.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;

    @Email(message = "Email không hợp lệ")
    private String email;

    @Size(min = 6, message = "Password phải có ít nhất 6 ký tự")
    private String password;

    private String firstName;
    private String lastName;
    private LocalDate birthday;
    private String address;
    private Department department;
    private SubDepartment subDepartment;
    private String phoneNumber;
    private Boolean isActive;
    private Boolean isDeleted;
    private Role role;
    private Position position;
    private Area area;
    private Long generationId;
}
