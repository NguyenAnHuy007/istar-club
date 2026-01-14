package com.haui.istar.controller.admin;

import com.haui.istar.dto.user.ApplicationFormRequest;
import com.haui.istar.dto.user.ApplicationFormResponse;
import com.haui.istar.model.RegisterApplicationForm;
import com.haui.istar.repository.RegisterApplicationRepository;
import com.haui.istar.service.AdminUserService;
import com.haui.istar.service.ApplicationFormService;
import com.haui.istar.util.FileUploadUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/admin/application-form")
@RequiredArgsConstructor
@PreAuthorize("hasRole('0')")
public class AdminApplicationForm {
    private final AdminUserService adminUserService;
    private final RegisterApplicationRepository repository;

    @PostMapping("/register")
    public ResponseEntity<ApplicationFormResponse> submitApplication(
            @RequestBody @Valid ApplicationFormRequest request) {

        ApplicationFormResponse response = adminUserService.submitApplication(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping({"/update", "/update/{id}"})
    public ResponseEntity<?> updateApplication(
            @PathVariable(required = false) Long id,
            @RequestBody @Valid ApplicationFormRequest request) {
        // Bắt lỗi nếu id null
        if (id == null) {
            return ResponseEntity.badRequest().body("Bạn chưa nhập ID!");
        }

        try {
            ApplicationFormResponse response = adminUserService.updateById(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        }
    }


    @DeleteMapping({"/delete", "/delete/{id}"})
    public ResponseEntity<?> deleteApplication(@PathVariable(required = false) Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().body("Bạn chưa nhập ID!");
        }

        try {
            adminUserService.deleteById(id);
            return ResponseEntity.ok("Xóa đơn đăng ký thành công với id: " + id);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        }
    }

    @PostMapping({"/upload", "/upload/{id}"})
    public ResponseEntity<?> uploadFile(
            @PathVariable(required = false) Long id,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        if (id == null) {
            return ResponseEntity.badRequest().body("Bạn chưa nhập ID!");
        }
        RegisterApplicationForm form = repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên"));

        String url = FileUploadUtil.saveFile("uploads", file);

        form.setAvatarUrl(url);        // nếu avatar thì đổi thành setAvatarUrl()
        repository.save(form);

        return ResponseEntity.ok(url);
    }

    // Xuất dữ liệu ra file Excel
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportExcel() throws IOException {

        ByteArrayInputStream in = adminUserService.exportExcel();
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
