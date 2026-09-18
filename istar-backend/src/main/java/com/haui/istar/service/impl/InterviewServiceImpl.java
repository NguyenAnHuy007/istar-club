package com.haui.istar.service.impl;

import com.haui.istar.dto.application.ApplicationDepartmentDto;
import com.haui.istar.dto.application.ApplicationFormDto;
import com.haui.istar.dto.application.CompleteMultiInterviewRequest;
import com.haui.istar.dto.application.DepartmentScoreItem;
import com.haui.istar.dto.application.StartInterviewRequest;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.User;
import com.haui.istar.model.UserDepartment;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Department;
import com.haui.istar.repository.ApplicationDepartmentRepository;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.service.AdminApplicationService;
import com.haui.istar.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final ApplicationDepartmentRepository applicationDepartmentRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final AdminApplicationService adminApplicationService;

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
                    if (ud != null && ud.getDepartment() == appDept.getDepartment()) {
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

        boolean isAdmin = interviewer.getRoleCodes() != null && interviewer.getRoleCodes().contains("ADMIN");
        boolean isInterviewerInDept = interviewer.getUserDepartments() != null && interviewer.getUserDepartments().stream()
                .filter(Objects::nonNull)
                .anyMatch(ud -> ud.getDepartment() == appDept.getDepartment());

        if (!isAdmin && !isInterviewerInDept) {
            throw new BadRequestException("Bạn không được phân công phụ trách ban " + appDept.getDepartment().getDisplayName());
        }

        appDept.setStatus(ApplicationStatus.INTERVIEWING);
        appDept.setInterviewer(interviewer);

        ApplicationDepartment saved = applicationDepartmentRepository.save(appDept);
        Application app = saved.getApplication();
        if (app != null) {
            app.setStatus(ApplicationStatus.INTERVIEWING);
            applicationRepository.save(app);
        }

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ApplicationDepartmentDto completeInterview(Long applicationDepartmentId, Long interviewerId, Double score,
            String notes) {
        ApplicationDepartment appDept = applicationDepartmentRepository.findById(applicationDepartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển ban này"));

        if (appDept.getStatus() != ApplicationStatus.INTERVIEWING) {
            throw new BadRequestException("Ban " + appDept.getDepartment().getDisplayName() + " không ở trạng thái đang phỏng vấn");
        }

        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Kiểm tra interviewer có thuộc ban này hoặc là Admin
        boolean isAdmin = interviewer.getRoleCodes() != null && interviewer.getRoleCodes().contains("ADMIN");
        boolean isInterviewerInDept = interviewer.getUserDepartments() != null && interviewer.getUserDepartments().stream()
                .filter(Objects::nonNull)
                .anyMatch(ud -> ud.getDepartment() == appDept.getDepartment());

        if (!isAdmin && !isInterviewerInDept) {
            throw new BadRequestException("Bạn không được phân công phụ trách ban " + appDept.getDepartment().getDisplayName());
        }

        if (!isAdmin && appDept.getInterviewer() != null && !appDept.getInterviewer().getId().equals(interviewerId)) {
            throw new BadRequestException("Bạn không phải người đang thực hiện phỏng vấn ban " + appDept.getDepartment().getDisplayName());
        }

        if (score == null || score < 0 || score > 10) {
            throw new BadRequestException("Điểm phỏng vấn phải từ 0 đến 10");
        }

        if (notes == null || notes.trim().isEmpty()) {
            throw new BadRequestException("Vui lòng nhập nhận xét phỏng vấn");
        }

        appDept.setStatus(ApplicationStatus.INTERVIEWED);
        appDept.setInterviewScore(score);
        appDept.setInterviewNotes(notes.trim());
        appDept.setInterviewer(interviewer);

        ApplicationDepartment saved = applicationDepartmentRepository.save(appDept);

        // Kiểm tra cập nhật tự động toàn bộ đơn nếu tất cả các ban đã phỏng vấn xong
        Application app = saved.getApplication();
        if (app != null && app.getApplicationDepartments() != null && !app.getApplicationDepartments().isEmpty()) {
            boolean allDeptDone = app.getApplicationDepartments().stream()
                    .allMatch(dept -> dept.getStatus() == ApplicationStatus.INTERVIEWED);

            boolean anyStillInterviewing = app.getApplicationDepartments().stream()
                    .anyMatch(dept -> dept.getStatus() == ApplicationStatus.INTERVIEWING);

            if (allDeptDone && app.getStatus() != ApplicationStatus.APPROVED && app.getStatus() != ApplicationStatus.REJECTED) {
                app.setStatus(ApplicationStatus.INTERVIEWED);
                if (app.getInterviewedAt() == null) {
                    app.setInterviewedAt(java.time.LocalDateTime.now());
                }
                applicationRepository.save(app);
            } else if (!anyStillInterviewing && app.getStatus() != ApplicationStatus.APPROVED && app.getStatus() != ApplicationStatus.REJECTED) {
                app.setStatus(ApplicationStatus.CHECKED_IN);
                applicationRepository.save(app);
            }
        }

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ApplicationFormDto startMultiInterview(Long applicationId, StartInterviewRequest request, Long interviewerId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển"));

        if (Boolean.TRUE.equals(app.getIsDeleted())) {
            throw new BadRequestException("Đơn ứng tuyển đã bị xóa");
        }

        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin tài khoản người phỏng vấn"));

        boolean isAdmin = interviewer.getRoleCodes() != null && interviewer.getRoleCodes().contains("ADMIN");
        Set<Department> interviewerDepts = interviewer.getUserDepartments() != null
                ? interviewer.getUserDepartments().stream()
                        .filter(Objects::nonNull)
                        .map(ud -> ud.getDepartment())
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet())
                : Set.of();

        // Concurrency check: Ứng viên có đang được phỏng vấn bởi người khác không
        boolean anyDeptInterviewing = app.getApplicationDepartments().stream()
                .anyMatch(d -> d.getStatus() == ApplicationStatus.INTERVIEWING);
        if (app.getStatus() == ApplicationStatus.INTERVIEWING || anyDeptInterviewing) {
            boolean claimedByOther = app.getApplicationDepartments().stream()
                    .filter(d -> d.getStatus() == ApplicationStatus.INTERVIEWING)
                    .anyMatch(d -> d.getInterviewer() != null && !d.getInterviewer().getId().equals(interviewerId));
            if (claimedByOther) {
                throw new BadRequestException("Ứng viên hiện đang được phỏng vấn bởi phòng ban khác, vui lòng đợi đến lượt!");
            }
        }

        List<Long> chosenDeptIds = request.getDepartmentIds();
        if (chosenDeptIds == null || chosenDeptIds.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ít nhất một ban để phỏng vấn");
        }

        for (Long deptId : chosenDeptIds) {
            ApplicationDepartment appDept = app.getApplicationDepartments().stream()
                    .filter(d -> d.getId().equals(deptId))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Ban phỏng vấn ID " + deptId + " không thuộc về đơn ứng tuyển này"));

            if (!isAdmin && !interviewerDepts.contains(appDept.getDepartment())) {
                throw new BadRequestException("Bạn không được phân công phụ trách ban " + appDept.getDepartment().getDisplayName());
            }

            if (appDept.getStatus() != ApplicationStatus.CHECKED_IN) {
                throw new BadRequestException("Ban " + appDept.getDepartment().getDisplayName() + " không ở trạng thái chờ phỏng vấn");
            }

            appDept.setStatus(ApplicationStatus.INTERVIEWING);
            appDept.setInterviewer(interviewer);
            applicationDepartmentRepository.save(appDept);
        }

        app.setStatus(ApplicationStatus.INTERVIEWING);
        applicationRepository.save(app);

        return adminApplicationService.getApplicationById(applicationId);
    }

    @Override
    @Transactional
    public ApplicationFormDto completeMultiInterview(Long applicationId, CompleteMultiInterviewRequest request, Long interviewerId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển"));

        if (Boolean.TRUE.equals(app.getIsDeleted())) {
            throw new BadRequestException("Đơn ứng tuyển đã bị xóa");
        }

        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin tài khoản người phỏng vấn"));

        boolean isAdmin = interviewer.getRoleCodes() != null && interviewer.getRoleCodes().contains("ADMIN");
        Set<Department> interviewerDepts = interviewer.getUserDepartments() != null
                ? interviewer.getUserDepartments().stream()
                        .filter(Objects::nonNull)
                        .map(ud -> ud.getDepartment())
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet())
                : Set.of();

        for (DepartmentScoreItem item : request.getScores()) {
            ApplicationDepartment appDept = app.getApplicationDepartments().stream()
                    .filter(d -> d.getId().equals(item.getDepartmentId()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy ban ứng tuyển ID " + item.getDepartmentId()));

            if (appDept.getStatus() != ApplicationStatus.INTERVIEWING) {
                throw new BadRequestException("Ban " + appDept.getDepartment().getDisplayName() + " không ở trạng thái đang phỏng vấn");
            }

            if (!isAdmin && appDept.getInterviewer() != null && !appDept.getInterviewer().getId().equals(interviewerId)) {
                throw new BadRequestException("Bạn không phải người đang thực hiện phỏng vấn ban " + appDept.getDepartment().getDisplayName());
            }

            if (!isAdmin && !interviewerDepts.contains(appDept.getDepartment())) {
                throw new BadRequestException("Bạn không có quyền chấm điểm cho ban " + appDept.getDepartment().getDisplayName());
            }

            if (item.getInterviewScore() == null || item.getInterviewScore() < 0 || item.getInterviewScore() > 10) {
                throw new BadRequestException("Điểm phỏng vấn phải từ 0 đến 10");
            }

            if (item.getInterviewNotes() == null || item.getInterviewNotes().trim().isEmpty()) {
                throw new BadRequestException("Vui lòng nhập nhận xét phỏng vấn cho ban " + appDept.getDepartment().getDisplayName());
            }

            appDept.setStatus(ApplicationStatus.INTERVIEWED);
            appDept.setInterviewScore(item.getInterviewScore());
            appDept.setInterviewNotes(item.getInterviewNotes().trim());
            appDept.setInterviewer(interviewer);
            applicationDepartmentRepository.save(appDept);
        }

        boolean allDeptsDone = app.getApplicationDepartments().stream()
                .allMatch(d -> d.getStatus() == ApplicationStatus.INTERVIEWED);

        boolean anyStillInterviewing = app.getApplicationDepartments().stream()
                .anyMatch(d -> d.getStatus() == ApplicationStatus.INTERVIEWING);

        if (allDeptsDone) {
            if (app.getStatus() != ApplicationStatus.APPROVED && app.getStatus() != ApplicationStatus.REJECTED) {
                app.setStatus(ApplicationStatus.INTERVIEWED);
                if (app.getInterviewedAt() == null) {
                    app.setInterviewedAt(java.time.LocalDateTime.now());
                }
            }
        } else if (!anyStillInterviewing) {
            // Còn ban chưa phỏng vấn, trả lại trạng thái CHECKED_IN để ban tiếp theo có thể phỏng vấn
            if (app.getStatus() != ApplicationStatus.APPROVED && app.getStatus() != ApplicationStatus.REJECTED) {
                app.setStatus(ApplicationStatus.CHECKED_IN);
            }
        }

        applicationRepository.save(app);

        return adminApplicationService.getApplicationById(applicationId);
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
