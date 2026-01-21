package com.haui.istar.controller.user;

import com.haui.istar.model.Application;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.util.FileUploadUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.haui.istar.dto.application.ApplicationFormRequest;
import com.haui.istar.dto.application.ApplicationFormResponse;
import com.haui.istar.service.ApplicationFormService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth/applications")
@RequiredArgsConstructor

public class ApplicationFormController {

    private final ApplicationFormService applicationFormService;
    private final ApplicationRepository repository;

    @PostMapping("")
    public ResponseEntity<ApplicationFormResponse> submitApplication(
            @RequestBody @Valid ApplicationFormRequest request) {

        ApplicationFormResponse response = applicationFormService.submitApplication(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateApplication(
            @PathVariable Long id,
            @RequestBody @Valid ApplicationFormRequest request) {

        try {
            ApplicationFormResponse response = applicationFormService.updateById(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        applicationFormService.deleteById(id);
        return ResponseEntity.ok().build();
    }


    @PostMapping({"/upload", "/upload/{id}"})
    public ResponseEntity<?> uploadFile(
            @PathVariable(required = false) Long id,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        if (id == null) {
            return ResponseEntity.badRequest().body("Bạn chưa nhập ID!");
        }
        Application form = repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên"));

        String url = FileUploadUtil.saveFile("uploads", file);

        form.setAvatarUrl(url);        // nếu avatar thì đổi thành setAvatarUrl()
        repository.save(form);

        return ResponseEntity.ok(url);
    }
}
