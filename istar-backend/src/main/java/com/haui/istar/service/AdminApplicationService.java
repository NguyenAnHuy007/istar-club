package com.haui.istar.service;

import com.haui.istar.dto.application.*;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface AdminApplicationService {
    Page<ApplicationFormDto> searchApplications(AdminApplicationSearchCriteria criteria);
    ApplicationFormDto getApplicationById(Long id);
    ApplicationFormDto updateApplication(Long id, AdminApplicationUpdateRequest request);
    void deleteApplication(Long id);
    void approveApplication(Long id);
    void rejectApplication(Long id);
    String uploadAvatar(Long id, MultipartFile file);
    void createAccountFromApprovedApplication(Long applicationId);
}
