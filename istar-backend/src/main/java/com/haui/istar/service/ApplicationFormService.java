package com.haui.istar.service;

import com.haui.istar.dto.user.ApplicationFormRequest;
import com.haui.istar.dto.user.ApplicationFormResponse;

import java.io.ByteArrayInputStream;

public interface ApplicationFormService {
    ApplicationFormResponse submitApplication(ApplicationFormRequest request);
}
