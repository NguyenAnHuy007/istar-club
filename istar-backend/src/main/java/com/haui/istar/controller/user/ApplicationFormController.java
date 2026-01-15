package com.haui.istar.controller.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.haui.istar.dto.application.ApplicationFormRequest;
import com.haui.istar.dto.application.ApplicationFormResponse;
import com.haui.istar.service.ApplicationFormService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor

public class ApplicationFormController {

    private final ApplicationFormService applicationFormService;

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

}
