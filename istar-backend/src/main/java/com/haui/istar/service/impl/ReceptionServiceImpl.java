package com.haui.istar.service.impl;

import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.repository.ApplicationDepartmentRepository;
import com.haui.istar.service.ReceptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReceptionServiceImpl implements ReceptionService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationDepartmentRepository applicationDepartmentRepository;

    @Override
    @Transactional
    public void checkInApplication(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn với id: " + applicationId));
        
        if (Boolean.TRUE.equals(application.getIsDeleted())) {
            throw new BadRequestException("Đơn đã bị xóa");
        }

        if (application.getStatus() != ApplicationStatus.SUBMITTED) {
            throw new BadRequestException("Đơn không ở trạng thái chờ check-in");
        }

        // Đổi trạng thái đơn chính
        application.setStatus(ApplicationStatus.CHECKED_IN);
        applicationRepository.save(application);

        // Đổi trạng thái các ban ứng tuyển để vào hàng chờ phỏng vấn
        if (application.getApplicationDepartments() != null) {
            for (ApplicationDepartment appDept : application.getApplicationDepartments()) {
                appDept.setStatus(ApplicationStatus.CHECKED_IN);
                applicationDepartmentRepository.save(appDept);
            }
        }
    }

    @Override
    @Transactional
    public void noShowApplication(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn với id: " + applicationId));

        if (Boolean.TRUE.equals(application.getIsDeleted())) {
            throw new BadRequestException("Đơn đã bị xóa");
        }

        application.setStatus(ApplicationStatus.NO_SHOW);
        applicationRepository.save(application);

        if (application.getApplicationDepartments() != null) {
            for (ApplicationDepartment appDept : application.getApplicationDepartments()) {
                appDept.setStatus(ApplicationStatus.NO_SHOW);
                applicationDepartmentRepository.save(appDept);
            }
        }
    }
}
