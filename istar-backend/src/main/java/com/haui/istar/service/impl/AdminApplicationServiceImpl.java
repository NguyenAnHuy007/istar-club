package com.haui.istar.service.impl;

import com.haui.istar.dto.application.ApplicationFormDto;
import com.haui.istar.dto.application.AdminApplicationSearchCriteria;
import com.haui.istar.dto.application.AdminApplicationUpdateRequest;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Application;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.repository.specification.ApplicationSpecification;
import com.haui.istar.service.AdminApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminApplicationServiceImpl implements AdminApplicationService {

    private final ApplicationRepository applicationRepository;

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
                .reasonDepartment(application.getReasonDepartment())
                .knowIStar(application.getKnowIStar())
                .reasonIStarer(application.getReasonIStarer())
                .cvUrl(application.getCvUrl())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }
}
