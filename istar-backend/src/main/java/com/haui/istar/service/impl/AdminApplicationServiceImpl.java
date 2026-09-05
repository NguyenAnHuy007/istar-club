package com.haui.istar.service.impl;

import com.haui.istar.dto.application.ApplicationDepartmentDto;
import com.haui.istar.dto.application.ApplicationDepartmentRequest;
import com.haui.istar.dto.application.ApplicationFormDto;
import com.haui.istar.dto.application.AdminApplicationSearchCriteria;
import com.haui.istar.dto.application.AdminApplicationUpdateRequest;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.User;
import com.haui.istar.model.UserDepartment;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Position;
import com.haui.istar.model.enums.Role;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.repository.specification.ApplicationSpecification;
import com.haui.istar.service.AdminApplicationService;
import com.haui.istar.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AdminApplicationServiceImpl implements AdminApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationFormDto> searchApplications(AdminApplicationSearchCriteria criteria) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (criteria.getSortDirection() != null && criteria.getSortBy() != null) {
            sort = Sort.by(Sort.Direction.fromString(criteria.getSortDirection()), criteria.getSortBy());
        }

        Pageable pageable = PageRequest.of(
                criteria.getPage() != null ? criteria.getPage() : 0,
                criteria.getSize() != null ? criteria.getSize() : 20,
                sort);

        Specification<Application> spec = ApplicationSpecification.withCriteria(criteria);
        Page<Application> applicationPage = applicationRepository.findAll(spec, pageable);

        return applicationPage.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationFormDto getApplicationById(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển với id: " + id));

        if (Boolean.TRUE.equals(application.getIsDeleted())) {
            throw new ResourceNotFoundException("Đơn ứng tuyển đã bị xóa");
        }

        return mapToDto(application);
    }

    @Override
    @Transactional
    public ApplicationFormDto updateApplication(Long id, AdminApplicationUpdateRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển với id: " + id));

        if (Boolean.TRUE.equals(application.getIsDeleted())) {
            throw new BadRequestException("Không thể cập nhật đơn đã bị xóa");
        }

        if (request.getEmail() != null) {
            application.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) {
            application.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            application.setLastName(request.getLastName());
        }
        if (request.getBirthday() != null) {
            application.setBirthday(request.getBirthday());
        }
        if (request.getAddress() != null) {
            application.setAddress(request.getAddress());
        }
        if (request.getPhoneNumber() != null) {
            application.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getSchool() != null) {
            application.setSchool(request.getSchool());
        }
        if (request.getMajorClass() != null) {
            application.setMajorClass(request.getMajorClass());
        }
        if (request.getCourse() != null) {
            application.setCourse(request.getCourse());
        }
        if (request.getKnowIStar() != null) {
            application.setKnowIStar(request.getKnowIStar());
        }
        if (request.getReasonIStarer() != null) {
            application.setReasonIStarer(request.getReasonIStarer());
        }
        if (request.getAvatarUrl() != null) {
            application.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getStatus() != null) {
            application.setStatus(request.getStatus());
        }

        // Cập nhật department (trong phase 3)
        if (request.getDepartments() != null) {
            application.getApplicationDepartments().clear();
            for (ApplicationDepartmentRequest deptReq : request.getDepartments()) {
                ApplicationDepartment appDept = ApplicationDepartment.builder()
                        .application(application)
                        .department(deptReq.getDepartment())
                        .build();
                application.getApplicationDepartments().add(appDept);
            }
        }

        Application saved = applicationRepository.save(application);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteApplication(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển với id: " + id));

        if (Boolean.TRUE.equals(application.getIsDeleted())) {
            throw new BadRequestException("Đơn ứng tuyển đã bị xóa rồi");
        }

        application.setIsDeleted(true);
        applicationRepository.save(application);
    }

    @Override
    @Transactional
    public void approveApplication(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển với id: " + id));

        if (Boolean.TRUE.equals(application.getIsDeleted())) {
            throw new BadRequestException("Không thể duyệt đơn đã bị xóa");
        }

        application.setStatus(ApplicationStatus.APPROVED);
        applicationRepository.save(application);
    }

    @Override
    @Transactional
    public void rejectApplication(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển với id: " + id));

        if (Boolean.TRUE.equals(application.getIsDeleted())) {
            throw new BadRequestException("Không thể từ chối đơn đã bị xóa");
        }

        application.setStatus(ApplicationStatus.REJECTED);
        applicationRepository.save(application);
    }

    @Override
    @Transactional
    public String uploadAvatar(Long id, MultipartFile file) {
        FileUploadUtil.validateAvatar(file);
        Application form = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ứng viên với id: " + id));

        if (Boolean.TRUE.equals(form.getIsDeleted())) {
            throw new BadRequestException("Không thể tải lên ảnh cho đơn đã bị xóa");
        }

        try {
            String url = FileUploadUtil.saveFile(uploadDir, file);
            form.setAvatarUrl(url);
            applicationRepository.save(form);
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi lưu file ảnh đại diện: " + e.getMessage());
        }
    }

    @Transactional
    public void createAccountFromApprovedApplication(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn với id: " + applicationId));

        if (Boolean.TRUE.equals(app.getIsDeleted())) {
            throw new BadRequestException("Đơn đã bị xóa, không thể tạo tài khoản");
        }

        if (app.getStatus() != ApplicationStatus.APPROVED) {
            throw new BadRequestException("Đơn chưa được duyệt");
        }

        if (app.getUser() != null) {
            throw new BadRequestException("Ứng viên này đã có tài khoản");
        }

        if (userRepo.existsByEmail(app.getEmail())) {
            throw new BadRequestException("Email đã tồn tại trong hệ thống");
        }

        User user = User.builder()
                .username(app.getEmail())
                .email(app.getEmail())
                .password(passwordEncoder.encode("123456"))
                .role(Role.MEMBER)
                .birthday(app.getBirthday())
                .phoneNumber(app.getPhoneNumber())
                .firstName(app.getFirstName())
                .lastName(app.getLastName())
                .address(app.getAddress())
                .course(app.getCourse())
                .majorClass(app.getMajorClass())
                .school(app.getSchool())
                .isActive(true)
                .build();

        if (app.getApplicationDepartments() != null) {
            for (ApplicationDepartment appDept : app.getApplicationDepartments()) {
                UserDepartment ud = UserDepartment.builder()
                        .user(user)
                        .department(appDept.getDepartment())
                        .position(Position.MEMBER)
                        .build();
                user.getUserDepartments().add(ud);
            }
        }

        userRepo.save(user);

        app.setUser(user);
        applicationRepository.save(app);
    }

    private ApplicationFormDto mapToDto(Application application) {
        List<ApplicationDepartmentDto> depts = new ArrayList<>();
        if (application.getApplicationDepartments() != null) {
            for (ApplicationDepartment appDept : application.getApplicationDepartments()) {
                depts.add(ApplicationDepartmentDto.builder()
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
                        .build());
            }
        }

        return ApplicationFormDto.builder()
                .id(application.getId())
                .email(application.getEmail())
                .firstName(application.getFirstName())
                .lastName(application.getLastName())
                .birthday(application.getBirthday())
                .address(application.getAddress())
                .phoneNumber(application.getPhoneNumber())
                .school(application.getSchool())
                .majorClass(application.getMajorClass())
                .course(application.getCourse())
                .knowIStar(application.getKnowIStar())
                .reasonIStarer(application.getReasonIStarer())
                .avatarUrl(application.getAvatarUrl())
                .status(application.getStatus())
                .version(application.getVersion())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .recruitmentId(application.getRecruitment() != null ? application.getRecruitment().getId() : null)
                .recruitmentName(application.getRecruitment() != null ? application.getRecruitment().getName() : null)
                .applicationDepartments(depts)
                .build();
    }
}
