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

        if (application.getStatus() == ApplicationStatus.CHECKED_IN) {
            return;
        }

        if (application.getStatus() == ApplicationStatus.INTERVIEWED 
                || application.getStatus() == ApplicationStatus.APPROVED 
                || application.getStatus() == ApplicationStatus.REJECTED) {
            throw new BadRequestException("Không thể check-in đơn đã hoàn thành phỏng vấn hoặc xét duyệt");
        }

        // Đổi trạng thái đơn chính
        application.setStatus(ApplicationStatus.CHECKED_IN);
        if (application.getCheckedInAt() == null) {
            application.setCheckedInAt(java.time.LocalDateTime.now());
        }
        applicationRepository.save(application);

        // Đổi trạng thái các ban ứng tuyển để vào hàng chờ phỏng vấn
        if (application.getApplicationDepartments() != null) {
            for (ApplicationDepartment appDept : application.getApplicationDepartments()) {
                if (appDept.getStatus() == ApplicationStatus.SUBMITTED || appDept.getStatus() == ApplicationStatus.NO_SHOW) {
                    appDept.setStatus(ApplicationStatus.CHECKED_IN);
                    applicationDepartmentRepository.save(appDept);
                }
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

        if (application.getStatus() == ApplicationStatus.NO_SHOW) {
            return;
        }

        if (application.getStatus() == ApplicationStatus.INTERVIEWED 
                || application.getStatus() == ApplicationStatus.APPROVED 
                || application.getStatus() == ApplicationStatus.REJECTED) {
            throw new BadRequestException("Không thể đánh dấu vắng mặt cho đơn đã phỏng vấn hoặc xét duyệt");
        }

        application.setStatus(ApplicationStatus.NO_SHOW);
        applicationRepository.save(application);

        if (application.getApplicationDepartments() != null) {
            for (ApplicationDepartment appDept : application.getApplicationDepartments()) {
                if (appDept.getStatus() == ApplicationStatus.SUBMITTED || appDept.getStatus() == ApplicationStatus.CHECKED_IN) {
                    appDept.setStatus(ApplicationStatus.NO_SHOW);
                    applicationDepartmentRepository.save(appDept);
                }
            }
        }
    }

    @Override
    @Transactional
    public void revertToSubmitted(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn với id: " + applicationId));

        if (Boolean.TRUE.equals(application.getIsDeleted())) {
            throw new BadRequestException("Đơn đã bị xóa");
        }

        if (application.getStatus() == ApplicationStatus.SUBMITTED) {
            return;
        }

        if (application.getStatus() == ApplicationStatus.INTERVIEWING 
                || application.getStatus() == ApplicationStatus.INTERVIEWED 
                || application.getStatus() == ApplicationStatus.APPROVED 
                || application.getStatus() == ApplicationStatus.REJECTED) {
            throw new BadRequestException("Không thể quay về nộp đơn khi ứng viên đã hoặc đang phỏng vấn");
        }

        application.setStatus(ApplicationStatus.SUBMITTED);
        applicationRepository.save(application);

        if (application.getApplicationDepartments() != null) {
            for (ApplicationDepartment appDept : application.getApplicationDepartments()) {
                if (appDept.getStatus() == ApplicationStatus.CHECKED_IN || appDept.getStatus() == ApplicationStatus.NO_SHOW) {
                    appDept.setStatus(ApplicationStatus.SUBMITTED);
                    applicationDepartmentRepository.save(appDept);
                }
            }
        }
    }
}
