package com.haui.istar.dto.application;

import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Department;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDepartmentDto {
    private Long id;
    private Department department;
    private ApplicationStatus status;
    private Double interviewScore;
    private String interviewNotes;
    private Long interviewerId;
    private String interviewerName;
    private Long version;
}
