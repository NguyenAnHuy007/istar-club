package com.haui.istar.dto.landing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AboutImageDto {

    private String url;
    private String label;
    private String icon;
}
