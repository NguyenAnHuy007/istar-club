package com.haui.istar.controller.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.haui.istar.dto.user.ApplicationFormRequest;
import com.haui.istar.dto.user.ApplicationFormResponse;
import com.haui.istar.service.ApplicationFormService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/application-form")
@RequiredArgsConstructor

public class ApplicationController {

    private final ApplicationFormService applicationFormService;

    @PostMapping("/register")
    public ResponseEntity<ApplicationFormResponse> submitApplication(
            @RequestBody @Valid ApplicationFormRequest request) {

        ApplicationFormResponse response = applicationFormService.submitApplication(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{email}")
    public ResponseEntity<ApplicationFormResponse> updateApplication(
            @PathVariable String email,
            @RequestBody @Valid ApplicationFormRequest request) {

        ApplicationFormResponse response = applicationFormService.updateByEmail(email, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{email}")
    public ResponseEntity<String> deleteApplication(@PathVariable String email) {
        applicationFormService.deleteByEmail(email);
        return ResponseEntity.ok("Xóa đơn đăng ký thành công cho email: " + email);
    }

}
