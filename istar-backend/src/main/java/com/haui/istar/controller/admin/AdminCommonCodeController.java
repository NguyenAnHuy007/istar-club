package com.haui.istar.controller.admin;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.common.CommonCodeDto;
import com.haui.istar.dto.common.CreateCommonCodeRequest;
import com.haui.istar.dto.common.UpdateCommonCodeRequest;
import com.haui.istar.service.CommonCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/common-codes")
@RequiredArgsConstructor
public class AdminCommonCodeController {

    private final CommonCodeService commonCodeService;

    @GetMapping
    @PreAuthorize("hasAuthority('COMMON_CODE_MANAGE') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<CommonCodeDto>>> getAllCodes(
            @RequestParam(name = "category", required = false) String category) {
        List<CommonCodeDto> codes = commonCodeService.getAllCodesByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách cấu hình mã thành công", codes));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('COMMON_CODE_MANAGE') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<CommonCodeDto>> createCode(
            @Valid @RequestBody CreateCommonCodeRequest request) {
        CommonCodeDto created = commonCodeService.createCode(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo mã danh mục thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('COMMON_CODE_MANAGE') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<CommonCodeDto>> updateCode(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommonCodeRequest request) {
        CommonCodeDto updated = commonCodeService.updateCode(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mã danh mục thành công", updated));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('COMMON_CODE_MANAGE') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleActive(@PathVariable Long id) {
        commonCodeService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.success("Đổi trạng thái mã thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('COMMON_CODE_MANAGE') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCode(@PathVariable Long id) {
        commonCodeService.deleteCode(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mã danh mục thành công"));
    }
}
