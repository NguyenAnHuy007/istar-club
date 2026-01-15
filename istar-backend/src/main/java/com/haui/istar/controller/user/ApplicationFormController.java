package com.haui.istar.controller.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.haui.istar.dto.application.ApplicationFormRequest;
import com.haui.istar.dto.application.ApplicationFormResponse;
import com.haui.istar.service.ApplicationFormService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/applications")
@RequiredArgsConstructor

public class ApplicationFormController {

    private final ApplicationFormService applicationFormService;

    @PostMapping("/register")
    public ResponseEntity<ApplicationFormResponse> submitApplication(
            @RequestBody @Valid ApplicationFormRequest request) {

        ApplicationFormResponse response = applicationFormService.submitApplication(request);
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
            ApplicationFormResponse response = applicationFormService.updateById(id, request);
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

        applicationFormService.deleteById(id);
        return ResponseEntity.ok().build();
    }

}
