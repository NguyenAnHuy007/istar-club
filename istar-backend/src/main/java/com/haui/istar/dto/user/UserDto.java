package com.haui.istar.dto.user;

import com.haui.istar.model.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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
    private SubDepartment subDepartment;
    private School school;
    private String majorClass;
    private String course;
    private String phoneNumber;
    private Boolean isActive;
    private Boolean isDeleted;
    private Role role;
    private Position position;
    private Area area;
    private Long generationId;
    private String generationName;
}
