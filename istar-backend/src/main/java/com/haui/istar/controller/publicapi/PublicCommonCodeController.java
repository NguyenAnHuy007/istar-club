package com.haui.istar.controller.publicapi;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.common.CommonCodeDto;
import com.haui.istar.service.CommonCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/common-codes")
@RequiredArgsConstructor
public class PublicCommonCodeController {

    private final CommonCodeService commonCodeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommonCodeDto>>> getActiveCodes(
            @RequestParam(name = "category", defaultValue = "SCHOOL") String category) {
        List<CommonCodeDto> codes = commonCodeService.getActiveCodesByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh mục thành công", codes));
    }
}
