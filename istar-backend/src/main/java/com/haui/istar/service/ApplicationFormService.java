package com.haui.istar.service;

import com.haui.istar.dto.application.ApplicationFormRequest;
import com.haui.istar.dto.application.ApplicationFormResponse;

import java.io.ByteArrayInputStream;

public interface ApplicationFormService {
    ApplicationFormResponse submitApplication(ApplicationFormRequest request);
    ApplicationFormResponse updateById(Long id, ApplicationFormRequest request);
    void deleteById(Long id);
    ByteArrayInputStream exportExcel();
}
