package com.haui.istar.controller.admin;

import com.haui.istar.dto.application.*;
import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.model.User;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Department;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.security.UserPrincipal;
import com.haui.istar.service.AdminApplicationService;
import com.haui.istar.service.ApplicationFormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/admin/applications")
@RequiredArgsConstructor
public class AdminApplicationController {

    private final ApplicationFormService applicationFormService;
    private final AdminApplicationService adminApplicationService;
    private final UserRepository userRepository;

    @PostMapping("/search")
    @PreAuthorize("hasAnyAuthority('APPLICATION_VIEW', 'APPLICATION_VIEW_OWN_DEPT', 'ROLE_ADMIN', 'PERM_APPLICATION_VIEW', 'PERM_APPLICATION_VIEW_OWN_DEPT')")
    public ResponseEntity<ApiResponse<Page<ApplicationFormDto>>> searchApplications(
            @RequestBody AdminApplicationSearchCriteria criteria,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null) {
            boolean isAdmin = principal.getRoles() != null && principal.getRoles().contains("ADMIN");
            if (!isAdmin) {
                // Lễ tân và Phỏng vấn viên chỉ được xem đợt tuyển đang active
                criteria.setActiveRecruitmentOnly(true);
                criteria.setRecruitmentId(null);

                // Nếu là Phỏng vấn viên: chỉ được xem các đơn nộp vào ban mình phụ trách
                boolean isInterviewer = principal.getPermissions() != null
                        && principal.getPermissions().contains("APPLICATION_VIEW_OWN_DEPT")
                        && !principal.getPermissions().contains("APPLICATION_VIEW");

                if (isInterviewer) {
                    if (criteria.getStatus() == null
                            && (criteria.getStatuses() == null || criteria.getStatuses().isEmpty())) {
                        criteria.setStatuses(List.of(ApplicationStatus.CHECKED_IN, ApplicationStatus.INTERVIEWING));
                    }
                    User user = userRepository.findById(principal.getId()).orElse(null);
                    if (user != null && user.getUserDepartments() != null) {
                        List<Department> userDepts = user.getUserDepartments().stream()
                                .filter(Objects::nonNull)
                                .map(ud -> ud.getDepartment())
                                .filter(Objects::nonNull)
                                .toList();
                        criteria.setAllowedDepartments(userDepts);
                    }
                    if (criteria.getStatus() != ApplicationStatus.INTERVIEWED) {
                        criteria.setDeptNotInterviewedOnly(true);
                    }
                }
            }
        }
        Page<ApplicationFormDto> applications = adminApplicationService.searchApplications(criteria);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm đơn ứng tuyển thành công", applications));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('APPLICATION_CREATE', 'ROLE_ADMIN', 'PERM_APPLICATION_CREATE')")
    public ResponseEntity<ApiResponse<ApplicationFormResponse>> createApplication(
            @RequestBody @Valid ApplicationFormRequest request) {
        ApplicationFormResponse created = applicationFormService.createOfflineApplication(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo đơn ứng tuyển thành công", created));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('APPLICATION_VIEW', 'APPLICATION_VIEW_OWN_DEPT', 'ROLE_ADMIN', 'PERM_APPLICATION_VIEW', 'PERM_APPLICATION_VIEW_OWN_DEPT')")
    public ResponseEntity<ApiResponse<ApplicationFormDto>> getApplicationById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ApplicationFormDto application = adminApplicationService.getApplicationById(id, principal);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn thành công", application));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('APPLICATION_EDIT', 'ROLE_ADMIN', 'PERM_APPLICATION_EDIT')")
    public ResponseEntity<ApiResponse<ApplicationFormDto>> updateApplication(
            @PathVariable Long id,
            @RequestBody @Valid AdminApplicationUpdateRequest request) {
        ApplicationFormDto updated = adminApplicationService.updateApplication(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('APPLICATION_DELETE', 'ROLE_ADMIN', 'PERM_APPLICATION_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(@PathVariable Long id) {
        adminApplicationService.deleteApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mềm đơn ứng tuyển thành công", null));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('APPLICATION_REVIEW', 'ROLE_ADMIN', 'PERM_APPLICATION_REVIEW')")
    public ResponseEntity<ApiResponse<Void>> approveApplication(@PathVariable Long id) {
        adminApplicationService.approveApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Duyệt đơn thành công", null));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('APPLICATION_REVIEW', 'ROLE_ADMIN', 'PERM_APPLICATION_REVIEW')")
    public ResponseEntity<ApiResponse<Void>> rejectApplication(@PathVariable Long id) {
        adminApplicationService.rejectApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Từ chối đơn thành công", null));
    }

    @GetMapping("/export-excel")
    @PreAuthorize("hasAnyAuthority('APPLICATION_EXPORT', 'ROLE_ADMIN', 'PERM_APPLICATION_EXPORT')")
    public ResponseEntity<byte[]> exportExcel() throws IOException {
        ByteArrayInputStream in = applicationFormService.exportExcel();
        return buildExcelResponse(in, "istar_applications.xlsx");
    }

    @PostMapping("/export-excel")
    @PreAuthorize("hasAnyAuthority('APPLICATION_EXPORT', 'ROLE_ADMIN', 'PERM_APPLICATION_EXPORT')")
    public ResponseEntity<byte[]> exportExcelFiltered(
            @RequestBody(required = false) AdminApplicationSearchCriteria criteria) throws IOException {
        ByteArrayInputStream in = applicationFormService.exportExcel(criteria);
        return buildExcelResponse(in, "istar_applications.xlsx");
    }

    @GetMapping("/excel-template")
    @PreAuthorize("hasAnyAuthority('APPLICATION_VIEW', 'ROLE_ADMIN', 'PERM_APPLICATION_VIEW')")
    public ResponseEntity<byte[]> downloadExcelTemplate() throws IOException {
        ByteArrayInputStream in = applicationFormService.generateExcelTemplate();
        return buildExcelResponse(in, "istar_template.xlsx");
    }

    @PostMapping("/import-excel")
    @PreAuthorize("hasAnyAuthority('APPLICATION_CREATE', 'ROLE_ADMIN', 'PERM_APPLICATION_CREATE')")
    public ResponseEntity<ApiResponse<Integer>> importExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "recruitmentId", required = false) Long recruitmentId) {
        int count = applicationFormService.importExcel(file, recruitmentId);
        return ResponseEntity.ok(ApiResponse.success("Import thành công " + count + " hồ sơ ứng viên", count));
    }

    @PostMapping("/{id}/upload-avatar")
    @PreAuthorize("hasAnyAuthority('APPLICATION_EDIT', 'ROLE_ADMIN', 'PERM_APPLICATION_EDIT')")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String url = adminApplicationService.uploadAvatar(id, file);
        return ResponseEntity.ok(ApiResponse.success("Tải lên ảnh đại diện thành công", url));
    }

    @DeleteMapping("/{id}/avatar")
    @PreAuthorize("hasAnyAuthority('APPLICATION_EDIT', 'ROLE_ADMIN', 'PERM_APPLICATION_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deleteAvatar(@PathVariable Long id) {
        adminApplicationService.deleteAvatar(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa ảnh đại diện thành công", null));
    }

    @PostMapping("/{id}/create-account")
    @PreAuthorize("hasAnyAuthority('APPLICATION_CREATE_ACCOUNT', 'ROLE_ADMIN', 'PERM_APPLICATION_CREATE_ACCOUNT')")
    public ResponseEntity<ApiResponse<Void>> createAccount(@PathVariable Long id) {
        adminApplicationService.createAccountFromApprovedApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản thành công", null));
    }

    private ResponseEntity<byte[]> buildExcelResponse(ByteArrayInputStream in, String filename) throws IOException {
        byte[] excelBytes = in.readAllBytes();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        return ResponseEntity
                .ok()
                .headers(headers)
                .contentLength(excelBytes.length)
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
