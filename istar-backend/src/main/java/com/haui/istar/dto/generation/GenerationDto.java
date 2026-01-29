package com.haui.istar.dto.generation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerationDto {

    private Long id;
    private String name;
    private Integer yearJoined;
    private String description;
    private Boolean isDeleted;
}
