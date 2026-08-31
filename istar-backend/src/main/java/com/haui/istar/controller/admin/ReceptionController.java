package com.haui.istar.controller.admin;

import com.haui.istar.service.ReceptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reception")
@RequiredArgsConstructor
public class ReceptionController {
    
    private final ReceptionService receptionService;

    @PutMapping("/applications/{id}/checkin")
    @PreAuthorize("hasAuthority('APPLICATION_CHECKIN')")
    public ResponseEntity<Void> checkInApplication(@PathVariable Long id) {
        receptionService.checkInApplication(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/applications/{id}/no-show")
    @PreAuthorize("hasAuthority('APPLICATION_CHECKIN')")
    public ResponseEntity<Void> noShowApplication(@PathVariable Long id) {
        receptionService.noShowApplication(id);
        return ResponseEntity.ok().build();
    }
}
