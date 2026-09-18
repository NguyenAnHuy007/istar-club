package com.haui.istar.dto.recruitment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateRecruitmentRequest {
    @NotBlank(message = "Tên đợt tuyển không được để trống")
    @Size(max = 100, message = "Tên đợt tuyển không được vượt quá 100 ký tự")
    private String name;
    
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private String description;
}
