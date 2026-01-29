package com.haui.istar.dto.user;

import com.haui.istar.model.enums.*;
import com.haui.istar.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jspecify.annotations.NonNull;

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

    public static UserDto fromEntity(@NonNull User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthday(user.getBirthday())
                .address(user.getAddress())
                .department(user.getDepartment())
                .subDepartment(user.getSubDepartment())
                .school(user.getSchool())
                .majorClass(user.getMajorClass())
                .course(user.getCourse())
                .phoneNumber(user.getPhoneNumber())
                .isActive(user.getIsActive())
                .isDeleted(user.getIsDeleted())
                .role(user.getRole())
                .position(user.getPosition())
                .area(user.getArea())
                .generationId(user.getGeneration() != null ? user.getGeneration().getId() : null)
                .generationName(user.getGeneration() != null ? user.getGeneration().getName() : null)
                .build();
    }
}
