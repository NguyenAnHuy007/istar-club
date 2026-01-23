package com.haui.istar.service;

import com.haui.istar.dto.application.*;
import org.springframework.data.domain.Page;

public interface AdminApplicationService {
    Page<ApplicationFormDto> searchApplications(AdminApplicationSearchCriteria criteria);
    ApplicationFormDto getApplicationById(Long id);
    ApplicationFormDto updateApplication(Long id, AdminApplicationUpdateRequest request);
    void deleteApplication(Long id);
    void approveApplication(Long id);
    void rejectApplication(Long id);
}
