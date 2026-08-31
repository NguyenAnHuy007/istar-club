package com.haui.istar.dto.user;

import com.haui.istar.model.enums.*;
import com.haui.istar.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jspecify.annotations.NonNull;

import com.haui.istar.model.UserDepartment;
import java.time.LocalDate;
import java.util.ArrayList;
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
    private School school;
    private String majorClass;
    private String course;
    private String phoneNumber;
    private Boolean isActive;
    private Boolean isDeleted;
    private Role role;
    private Position position; // Vẫn giữ chức vụ cấp câu lạc bộ
    private Area area;
    private Long generationId;
    private String generationName;
    private List<UserDepartmentDto> userDepartments;

    public static UserDto fromEntity(@NonNull User user) {
        List<UserDepartmentDto> depts = new ArrayList<>();
        if (user.getUserDepartments() != null) {
            for (UserDepartment ud : user.getUserDepartments()) {
                depts.add(UserDepartmentDto.builder()
                        .id(ud.getId())
                        .department(ud.getDepartment())
                        .position(ud.getPosition())
                        .build());
            }
        }

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthday(user.getBirthday())
                .address(user.getAddress())
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
                .userDepartments(depts)
                .build();
    }
}
