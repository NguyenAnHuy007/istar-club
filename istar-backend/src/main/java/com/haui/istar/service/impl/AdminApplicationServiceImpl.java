package com.haui.istar.service.impl;

import com.haui.istar.dto.application.ApplicationFormDto;
import com.haui.istar.dto.application.AdminApplicationSearchCriteria;
import com.haui.istar.dto.application.AdminApplicationUpdateRequest;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Application;
import com.haui.istar.model.User;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Role;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.repository.specification.ApplicationSpecification;
import com.haui.istar.service.AdminApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminApplicationServiceImpl implements AdminApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Page<ApplicationFormDto> searchApplications(AdminApplicationSearchCriteria criteria) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (criteria.getSortDirection() != null && criteria.getSortBy() != null) {
            sort = Sort.by(Sort.Direction.fromString(criteria.getSortDirection()), criteria.getSortBy());
        }

        Pageable pageable = PageRequest.of(
                criteria.getPage() != null ? criteria.getPage() : 0,
                criteria.getSize() != null ? criteria.getSize() : 20,
                sort
        );

        Specification<Application> spec = ApplicationSpecification.withCriteria(criteria);
        Page<Application> applicationPage = applicationRepository.findAll(spec, pageable);

        return applicationPage.map(this::mapToDto);
    }

    @Override
    public ApplicationFormDto getApplicationById(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển với id: " + id));
        return mapToDto(application);
    }

    @Override
    @Transactional
    public ApplicationFormDto updateApplication(Long id, AdminApplicationUpdateRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển với id: " + id));

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
        if (request.getDepartment() != null) {
            application.setDepartment(request.getDepartment());
        }
        if (request.getSubDepartment() != null) {
            application.setSubDepartment(request.getSubDepartment());
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
        if (request.getReasonDepartment() != null) {
            application.setReasonDepartment(request.getReasonDepartment());
        }
        if (request.getKnowIStar() != null) {
            application.setKnowIStar(request.getKnowIStar());
        }
        if (request.getReasonIStarer() != null) {
            application.setReasonIStarer(request.getReasonIStarer());
        }
        if (request.getCvUrl() != null) {
            application.setCvUrl(request.getCvUrl());
        }
        if (request.getStatus() != null) {
            application.setStatus(request.getStatus());
        }

        Application saved = applicationRepository.save(application);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteApplication(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển với id: " + id));
        applicationRepository.delete(application);
    }

    @Override
    @Transactional
    public void approveApplication(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển với id: " + id));
        application.setStatus(ApplicationStatus.APPROVED);
        applicationRepository.save(application);
    }

    @Override
    @Transactional
    public void rejectApplication(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển với id: " + id));
        application.setStatus(ApplicationStatus.REJECTED);
        applicationRepository.save(application);
    }

    private ApplicationFormDto mapToDto(Application application) {
        return ApplicationFormDto.builder()
                .id(application.getId())
                .email(application.getEmail())
                .firstName(application.getFirstName())
                .lastName(application.getLastName())
                .birthday(application.getBirthday())
                .address(application.getAddress())
                .phoneNumber(application.getPhoneNumber())
                .department(application.getDepartment())
                .subDepartment(application.getSubDepartment())
                .school(application.getSchool())
                .majorClass(application.getMajorClass())
                .course(application.getCourse())
                .reasonDepartment(application.getReasonDepartment())
                .knowIStar(application.getKnowIStar())
                .reasonIStarer(application.getReasonIStarer())
                .cvUrl(application.getCvUrl())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }

    @Transactional
    public void createAccountFromApprovedApplication(Long applicationId) {

        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn"));

        if (app.getStatus() != ApplicationStatus.APPROVED) {
            throw new RuntimeException("Đơn chưa được duyệt");
        }

        if (app.getUser() != null) {
            throw new RuntimeException("Application đã có tài khoản");
        }

        if (userRepo.existsByEmail(app.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        User user = User.builder()
                .username(app.getEmail())
                .email(app.getEmail())
                .password(passwordEncoder.encode("123456"))
                .role(Role.MEMBER)
                .birthday(app.getBirthday())
                .phoneNumber(app.getPhoneNumber())
                .department(app.getDepartment())
                .firstName(app.getFirstName())
                .lastName(app.getLastName())
                .subDepartment(app.getSubDepartment())
                .address(app.getAddress())
                .course(app.getCourse())
                .majorClass(app.getMajorClass())
                .school(app.getSchool())
                .isActive(true)
                .build();

        userRepo.save(user);

        app.setUser(user);
        applicationRepository.save(app);
    }
}
