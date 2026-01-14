package com.haui.istar.controller.user;

import com.haui.istar.model.RegisterApplicationForm;
import com.haui.istar.repository.RegisterApplicationRepository;
import com.haui.istar.util.FileUploadUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.haui.istar.dto.user.ApplicationFormRequest;
import com.haui.istar.dto.user.ApplicationFormResponse;
import com.haui.istar.service.ApplicationFormService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/application-form")
@RequiredArgsConstructor

public class ApplicationController {

    private final ApplicationFormService applicationFormService;
    private final RegisterApplicationRepository repository;

    @PostMapping("/register")
    public ResponseEntity<ApplicationFormResponse> submitApplication(
            @RequestBody @Valid ApplicationFormRequest request) {

        ApplicationFormResponse response = applicationFormService.submitApplication(request);
        return ResponseEntity.ok(response);
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

}
