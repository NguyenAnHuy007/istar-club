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
import com.haui.istar.model.enums.Area;
import com.haui.istar.model.enums.Position;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.repository.PermissionGroupRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.repository.specification.ApplicationSpecification;
import com.haui.istar.service.AdminApplicationService;
import com.haui.istar.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import com.haui.istar.model.enums.Department;
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
    private final PermissionGroupRepository permissionGroupRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationFormDto> searchApplications(AdminApplicationSearchCriteria criteria) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (criteria.getSortDirection() != null && criteria.getSortBy() != null) {
            Sort.Direction dir = "ASC".equalsIgnoreCase(criteria.getSortDirection())
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            if ("checkedInAt".equalsIgnoreCase(criteria.getSortBy())) {
                sort = Sort.by(dir == Sort.Direction.ASC
                        ? Sort.Order.asc("checkedInAt").nullsLast()
                        : Sort.Order.desc("checkedInAt").nullsLast());
            } else {
                sort = Sort.by(dir, criteria.getSortBy());
            }
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
        if (request.getFacebookUrl() != null) {
            application.setFacebookUrl(request.getFacebookUrl());
        }
        if (request.getAvatarUrl() != null) {
            application.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getArea() != null) {
            application.setArea(request.getArea());
        }
        if (request.getStatus() != null) {
            // Admin có quyền thay đổi trạng thái tự do không hạn chế logic
            application.setStatus(request.getStatus());
        }

        // Cập nhật department an toàn theo cơ chế in-place reconciliation
        if (request.getDepartments() != null) {
            Set<Department> newDepts = request.getDepartments().stream()
                    .filter(Objects::nonNull)
                    .map(d -> d.getDepartment())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // Xóa các ban không còn nằm trong danh sách mới
            application.getApplicationDepartments().removeIf(ad -> !newDepts.contains(ad.getDepartment()));

            // Cập nhật thông tin cho các ban hiện có
            java.util.Map<Department, ApplicationDepartmentRequest> reqMap = request.getDepartments().stream()
                    .filter(d -> d != null && d.getDepartment() != null)
                    .collect(Collectors.toMap(d -> d.getDepartment(), d -> d, (d1, d2) -> d1));

            for (ApplicationDepartment ad : application.getApplicationDepartments()) {
                ApplicationDepartmentRequest deptReq = reqMap.get(ad.getDepartment());
                if (deptReq != null) {
                    if (deptReq.getStatus() != null) {
                        ad.setStatus(deptReq.getStatus());
                    }
                    if (deptReq.getInterviewScore() != null) {
                        if (deptReq.getInterviewScore() < 0.0 || deptReq.getInterviewScore() > 10.0) {
                            throw new BadRequestException("Điểm phỏng vấn phải nằm trong khoảng từ 0.0 đến 10.0");
                        }
                        ad.setInterviewScore(deptReq.getInterviewScore());
                    }
                    if (deptReq.getInterviewNotes() != null) {
                        ad.setInterviewNotes(deptReq.getInterviewNotes());
                    }
                }
            }

            // Tập hợp các ban đã tồn tại
            Set<Department> existingDepts = application.getApplicationDepartments().stream()
                    .filter(Objects::nonNull)
                    .map(ad -> ad.getDepartment())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // Thêm các ban mới chưa có
            for (ApplicationDepartmentRequest deptReq : request.getDepartments()) {
                if (!existingDepts.contains(deptReq.getDepartment())) {
                    if (deptReq.getInterviewScore() != null && (deptReq.getInterviewScore() < 0.0 || deptReq.getInterviewScore() > 10.0)) {
                        throw new BadRequestException("Điểm phỏng vấn phải nằm trong khoảng từ 0.0 đến 10.0");
                    }
                    ApplicationDepartment appDept = ApplicationDepartment.builder()
                            .application(application)
                            .department(deptReq.getDepartment())
                            .status(deptReq.getStatus() != null ? deptReq.getStatus() : ApplicationStatus.SUBMITTED)
                            .interviewScore(deptReq.getInterviewScore())
                            .interviewNotes(deptReq.getInterviewNotes())
                            .build();
                    application.getApplicationDepartments().add(appDept);
                }
            }
        }

        Application saved = applicationRepository.save(application);
        return mapToDto(saved);
    }

    private void validateStatusTransition(ApplicationStatus current, ApplicationStatus target) {
        if (current == target) {
            return;
        }

        // Không thể chuyển lùi từ INTERVIEWED về SUBMITTED, CHECKED_IN, NO_SHOW
        if (current == ApplicationStatus.INTERVIEWED) {
            if (target == ApplicationStatus.SUBMITTED || target == ApplicationStatus.CHECKED_IN || target == ApplicationStatus.NO_SHOW) {
                throw new BadRequestException("Không thể chuyển đơn từ 'Đã phỏng vấn' về trạng thái chưa hoàn thành phỏng vấn");
            }
        }

        // Không thể chuyển lùi từ APPROVED hoặc REJECTED về các bước trước
        if (current == ApplicationStatus.APPROVED || current == ApplicationStatus.REJECTED) {
            if (target != ApplicationStatus.APPROVED && target != ApplicationStatus.REJECTED) {
                throw new BadRequestException("Không thể chuyển đơn đã xét duyệt (trúng tuyển/loại) về các bước trước đó");
            }
        }
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

        if (application.getStatus() != ApplicationStatus.INTERVIEWED && application.getStatus() != ApplicationStatus.CHECKED_IN) {
            throw new BadRequestException("Chỉ có thể xét duyệt trúng tuyển đối với đơn đã phỏng vấn hoặc đã đến phỏng vấn");
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

        if (application.getStatus() == ApplicationStatus.APPROVED) {
            throw new BadRequestException("Không thể từ chối đơn đã được duyệt trúng tuyển");
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

    @Override
    @Transactional
    public void deleteAvatar(Long id) {
        Application form = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn với id: " + id));

        if (Boolean.TRUE.equals(form.getIsDeleted())) {
            throw new BadRequestException("Đơn đã bị xóa");
        }

        form.setAvatarUrl(null);
        applicationRepository.save(form);
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
                .birthday(app.getBirthday())
                .phoneNumber(app.getPhoneNumber())
                .firstName(app.getFirstName())
                .lastName(app.getLastName())
                .address(app.getAddress())
                .course(app.getCourse())
                .majorClass(app.getMajorClass())
                .school(app.getSchool())
                .area(app.getArea() != null ? app.getArea() : Area.NINH_BINH)
                .isActive(true)
                .build();

        permissionGroupRepository.findByCode("MEMBER").ifPresent(mg -> user.getPermissionGroups().add(mg));

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
                .facebookUrl(application.getFacebookUrl())
                .avatarUrl(application.getAvatarUrl())
                .status(application.getStatus())
                .area(application.getArea())
                .version(application.getVersion())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .checkedInAt(application.getCheckedInAt())
                .interviewedAt(application.getInterviewedAt())
                .recruitmentId(application.getRecruitment() != null ? application.getRecruitment().getId() : null)
                .recruitmentName(application.getRecruitment() != null ? application.getRecruitment().getName() : null)
                .applicationDepartments(depts)
                .build();
    }
}
