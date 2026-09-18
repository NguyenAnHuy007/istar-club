package com.haui.istar.dto.common;

import com.haui.istar.model.CommonCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommonCodeDto {
    private Long id;
    private String category;
    private String code;
    private String name;
    private String description;
    private Integer orderIndex;
    private Boolean isActive;

    public static CommonCodeDto fromEntity(CommonCode entity) {
        if (entity == null) return null;
        return CommonCodeDto.builder()
                .id(entity.getId())
                .category(entity.getCategory())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .orderIndex(entity.getOrderIndex())
                .isActive(entity.getIsActive())
                .build();
    }
}
