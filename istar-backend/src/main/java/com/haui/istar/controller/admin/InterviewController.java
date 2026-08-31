package com.haui.istar.controller.admin;

import com.haui.istar.dto.application.ApplicationDepartmentDto;
import com.haui.istar.security.UserPrincipal;
import com.haui.istar.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping("/queue")
    @PreAuthorize("hasAuthority('INTERVIEW_VIEW_QUEUE')")
    public ResponseEntity<List<ApplicationDepartmentDto>> getInterviewQueue(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(interviewService.getQueue(principal.getId()));
    }

    @PutMapping("/applications/{applicationDepartmentId}/start")
    @PreAuthorize("hasAuthority('INTERVIEW_CONDUCT')")
    public ResponseEntity<ApplicationDepartmentDto> startInterview(
            @PathVariable Long applicationDepartmentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(interviewService.startInterview(applicationDepartmentId, principal.getId()));
    }

    @PutMapping("/applications/{applicationDepartmentId}/complete")
    @PreAuthorize("hasAuthority('INTERVIEW_CONDUCT')")
    public ResponseEntity<ApplicationDepartmentDto> completeInterview(
            @PathVariable Long applicationDepartmentId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        Double score = null;
        if (request.get("interviewScore") != null) {
            score = Double.valueOf(request.get("interviewScore").toString());
        }
        String notes = request.get("interviewNotes") != null ? request.get("interviewNotes").toString() : null;

        return ResponseEntity.ok(interviewService.completeInterview(applicationDepartmentId, principal.getId(), score, notes));
    }
}
