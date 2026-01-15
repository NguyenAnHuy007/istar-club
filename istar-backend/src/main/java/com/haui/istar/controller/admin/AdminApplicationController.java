package com.haui.istar.controller.admin;

import com.haui.istar.dto.application.AdminApplicationSearchCriteria;
import com.haui.istar.dto.application.AdminApplicationUpdateRequest;
import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.application.ApplicationFormDto;
import com.haui.istar.service.AdminApplicationService;
import com.haui.istar.service.ApplicationFormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/admin/applications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminApplicationController {

    private final ApplicationFormService applicationFormService;
    private final AdminApplicationService adminApplicationService;

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<ApplicationFormDto>>> searchApplications(
            @RequestBody AdminApplicationSearchCriteria criteria) {
        Page<ApplicationFormDto> applications = adminApplicationService.searchApplications(criteria);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm thành công", applications));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationFormDto>> getApplicationById(@PathVariable Long id) {
        ApplicationFormDto application = adminApplicationService.getApplicationById(id);
        return ResponseEntity.ok(ApiResponse.success(application));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationFormDto>> updateApplication(
            @PathVariable Long id,
            @RequestBody @Valid AdminApplicationUpdateRequest request) {
        ApplicationFormDto updated = adminApplicationService.updateApplication(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(@PathVariable Long id) {
        adminApplicationService.deleteApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thành công", null));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveApplication(@PathVariable Long id) {
        adminApplicationService.approveApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Duyệt đơn thành công", null));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectApplication(@PathVariable Long id) {
        adminApplicationService.rejectApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Từ chối đơn thành công", null));
    }

    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportExcel() throws IOException {
        ByteArrayInputStream in = applicationFormService.exportExcel();
        byte[] excelBytes = in.readAllBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=istar_applications.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentLength(excelBytes.length)
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ))
                .body(excelBytes);
    }

}
