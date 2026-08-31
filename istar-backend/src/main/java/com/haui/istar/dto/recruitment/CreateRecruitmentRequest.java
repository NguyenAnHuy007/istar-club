package com.haui.istar.dto.recruitment;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateRecruitmentRequest {
    @NotBlank(message = "Tên đợt tuyển không được để trống")
    private String name;
    
    private LocalDate startDate;
    private LocalDate endDate;
}
