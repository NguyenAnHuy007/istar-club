package com.haui.istar.controller.admin;

import com.haui.istar.service.ApplicationFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/application-form")
@RequiredArgsConstructor
public class AdminApplicationForm {
    private final ApplicationFormService applicationFormService;

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
