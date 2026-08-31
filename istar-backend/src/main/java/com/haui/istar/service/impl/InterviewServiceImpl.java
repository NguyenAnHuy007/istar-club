package com.haui.istar.service.impl;

import com.haui.istar.dto.application.ApplicationDepartmentDto;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.User;
import com.haui.istar.model.UserDepartment;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.repository.ApplicationDepartmentRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final ApplicationDepartmentRepository applicationDepartmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationDepartmentDto> getQueue(Long interviewerId) {
        User user = userRepository.findById(interviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getUserDepartments() == null || user.getUserDepartments().isEmpty()) {
            return new ArrayList<>();
        }

        // Tìm tất cả các ApplicationDepartment có trạng thái CHECKED_IN
        // và thuộc về các ban mà interviewer quản lý.
        List<ApplicationDepartment> allApps = applicationDepartmentRepository.findAll();

        List<ApplicationDepartmentDto> result = new ArrayList<>();

        for (ApplicationDepartment appDept : allApps) {
            if (appDept.getStatus() == ApplicationStatus.CHECKED_IN) {
                // Kiểm tra xem interviewer có quyền phỏng vấn ban này không
                boolean hasPermission = false;
                for (UserDepartment ud : user.getUserDepartments()) {
                    if (ud.getDepartment() == appDept.getDepartment()) {
                        hasPermission = true;
                        break;
                    }
                }

                if (hasPermission) {
                    result.add(mapToDto(appDept));
                }
            }
        }

        return result;
    }

    @Override
    @Transactional
    public ApplicationDepartmentDto startInterview(Long applicationDepartmentId, Long interviewerId) {
        ApplicationDepartment appDept = applicationDepartmentRepository.findById(applicationDepartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển ban này"));

        if (appDept.getStatus() != ApplicationStatus.CHECKED_IN) {
            throw new BadRequestException("Đơn không ở trạng thái chờ phỏng vấn");
        }

        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        appDept.setStatus(ApplicationStatus.INTERVIEWING);
        appDept.setInterviewer(interviewer);

        ApplicationDepartment saved = applicationDepartmentRepository.save(appDept);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ApplicationDepartmentDto completeInterview(Long applicationDepartmentId, Long interviewerId, Double score,
            String notes) {
        ApplicationDepartment appDept = applicationDepartmentRepository.findById(applicationDepartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển ban này"));

        if (appDept.getStatus() != ApplicationStatus.INTERVIEWING) {
            throw new BadRequestException("Đơn không ở trạng thái đang phỏng vấn");
        }

        if (appDept.getInterviewer() == null || !appDept.getInterviewer().getId().equals(interviewerId)) {
            throw new BadRequestException("Bạn không phải người đang phỏng vấn đơn này");
        }

        appDept.setStatus(ApplicationStatus.INTERVIEWED);
        appDept.setInterviewScore(score);
        appDept.setInterviewNotes(notes);

        ApplicationDepartment saved = applicationDepartmentRepository.save(appDept);
        return mapToDto(saved);
    }

    private ApplicationDepartmentDto mapToDto(ApplicationDepartment appDept) {
        return ApplicationDepartmentDto.builder()
                .id(appDept.getId())
                .department(appDept.getDepartment())
                .status(appDept.getStatus())
                .interviewScore(appDept.getInterviewScore())
                .interviewNotes(appDept.getInterviewNotes())
                .interviewerId(appDept.getInterviewer() != null ? appDept.getInterviewer().getId() : null)
                .interviewerName(appDept.getInterviewer() != null
                        ? appDept.getInterviewer().getFirstName() + " " + appDept.getInterviewer().getLastName()
                        : null)
                .version(appDept.getVersion())
                .build();
    }
}
