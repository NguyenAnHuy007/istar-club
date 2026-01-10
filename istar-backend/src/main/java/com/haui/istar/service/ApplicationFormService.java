package com.haui.istar.service;

import com.haui.istar.dto.user.ApplicationFormRequest;
import com.haui.istar.dto.user.ApplicationFormResponse;

public interface ApplicationFormService {
    ApplicationFormResponse submitApplication(ApplicationFormRequest request);
    ApplicationFormResponse updateByEmail(String email, ApplicationFormRequest request);
    void deleteByEmail(String email);
}
