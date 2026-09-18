package com.haui.istar.dto.user;

import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchCriteria {
    private String keyword;
    private Position position;
    private Department department;
    private Long generationId;
    private String course;
    private Boolean isActive;
    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = Integer.MAX_VALUE;

    @Builder.Default
    private String sortBy = "id";

    @Builder.Default
    private String sortDirection = "ASC";
}
