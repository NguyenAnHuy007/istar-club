package com.haui.istar.dto.application;

import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.SubDepartment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminApplicationSearchCriteria {

    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Department department;
    private SubDepartment subDepartment;
    private ApplicationStatus status;
    private LocalDate birthdayFrom;
    private LocalDate birthdayTo;
    private LocalDate createdFrom;
    private LocalDate createdTo;

    // Pagination
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDirection;
}
