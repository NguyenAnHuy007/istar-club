package com.haui.istar.dto.user;

import com.haui.istar.model.enums.Department;
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
public class UserDto {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDate birthday;
    private String address;
    private Department department;
    private String phoneNumber;
    private Boolean isActive;
    private Boolean isDeleted;
    private List<Integer> roles;
}

