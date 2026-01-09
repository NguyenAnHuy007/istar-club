package com.haui.istar.dto.user;

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
public class UpdateProfileRequest {

    @Email(message = "Email không hợp lệ")
    private String email;

    private String firstName;

    private String lastName;

    private LocalDate birthday;

    private String address;

    private String part;

    private String phoneNumber;
}

