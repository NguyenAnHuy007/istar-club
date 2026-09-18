package com.haui.istar.service.impl;

import com.haui.istar.dto.application.AdminApplicationSearchCriteria;
import com.haui.istar.dto.application.ApplicationDepartmentRequest;
import com.haui.istar.dto.application.ApplicationFormRequest;
import com.haui.istar.dto.application.ApplicationFormResponse;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.Recruitment;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Area;
import com.haui.istar.model.enums.Department;
import com.haui.istar.repository.ApplicationDepartmentRepository;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.repository.RecruitmentRepository;
import com.haui.istar.repository.specification.ApplicationSpecification;
import com.haui.istar.service.ApplicationFormService;
import com.haui.istar.util.ExcelExporter;
import com.haui.istar.util.ExcelImporter;
import com.haui.istar.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ApplicationFormServiceImpl implements ApplicationFormService {

    private final ApplicationRepository repository;
    private final RecruitmentRepository recruitmentRepository;
    private final ApplicationDepartmentRepository applicationDepartmentRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    @Transactional
    public ApplicationFormResponse submitApplication(ApplicationFormRequest request) {
        // Nộp đơn công khai luôn luôn khởi tạo với trạng thái SUBMITTED
        return doSubmitApplication(request, ApplicationStatus.SUBMITTED);
    }

    @Override
    @Transactional
    public ApplicationFormResponse createOfflineApplication(ApplicationFormRequest request) {
        // Tạo đơn offline tại bàn lễ tân chỉ cho phép CHECKED_IN hoặc SUBMITTED
        ApplicationStatus status = request.getStatus() != null ? request.getStatus() : ApplicationStatus.CHECKED_IN;
        if (status != ApplicationStatus.CHECKED_IN && status != ApplicationStatus.SUBMITTED) {
            throw new BadRequestException("Trạng thái khởi tạo đơn offline chỉ được là CHỜ PHỎNG VẤN (CHECKED_IN) hoặc ĐÃ NỘP (SUBMITTED)");
        }
        return doSubmitApplication(request, status);
    }

    private ApplicationFormResponse doSubmitApplication(ApplicationFormRequest request, ApplicationStatus initialStatus) {
        // Removed subDepartment validation

        // Validate / resolve recruitment
        Recruitment recruitment;
        if (request.getRecruitmentId() != null) {
            recruitment = recruitmentRepository.findByIdAndIsDeletedFalse(request.getRecruitmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt tuyển với id: " + request.getRecruitmentId()));
            if (!Boolean.TRUE.equals(recruitment.getIsActive())) {
                throw new BadRequestException("Đợt tuyển này đã đóng!");
            }
        } else {
            // Tự động gán vào đợt tuyển đang active
            recruitment = recruitmentRepository.findByIsActiveTrueAndIsDeletedFalse()
                    .orElseThrow(() -> new BadRequestException("Hiện tại không có đợt tuyển thành viên nào đang mở!"));
        }

        // Kiểm tra không được chọn trùng ban
        if (request.getDepartments() != null) {
            Set<Department> seenDepts = new HashSet<>();
            for (ApplicationDepartmentRequest deptReq : request.getDepartments()) {
                if (deptReq != null && deptReq.getDepartment() != null) {
                    if (!seenDepts.add(deptReq.getDepartment())) {
                        throw new BadRequestException("Không thể đăng ký trùng lặp ban: " + deptReq.getDepartment().getDisplayName());
                    }
                }
            }
        }

        Application form = Application.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .birthday(request.getBirthday())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .school(request.getSchool())
                .majorClass(request.getMajorClass())
                .course(request.getCourse())
                .knowIStar(request.getKnowIStar())
                .reasonIStarer(request.getReasonIStarer())
                .facebookUrl(request.getFacebookUrl())
                .avatarUrl(request.getAvatarUrl())
                .recruitment(recruitment)
                .status(initialStatus)
                .checkedInAt(initialStatus == ApplicationStatus.CHECKED_IN ? java.time.LocalDateTime.now() : null)
                .area(request.getArea() != null ? request.getArea() : Area.NINH_BINH)
                .build();

        Application saved = repository.save(form);

        for (ApplicationDepartmentRequest deptReq : request.getDepartments()) {
            ApplicationDepartment appDept = ApplicationDepartment.builder()
                    .application(saved)
                    .department(deptReq.getDepartment())
                    .status(initialStatus)
                    .build();
            applicationDepartmentRepository.save(appDept);
            saved.getApplicationDepartments().add(appDept);
        }

        return ApplicationFormResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFirstName() + " " + saved.getLastName())
                .email(saved.getEmail())
                .phoneNumber(saved.getPhoneNumber())
                .school(saved.getSchool())
                .majorClass(saved.getMajorClass())
                .course(saved.getCourse())
                .facebookUrl(saved.getFacebookUrl())
                .avatarUrl(saved.getAvatarUrl())
                .area(saved.getArea())
                .recruitmentId(recruitment.getId())
                .recruitmentName(recruitment.getName())
                .build();
    }

    @Override
    @Transactional
    public ApplicationFormResponse updateById(Long id, ApplicationFormRequest request) {
        Application entity = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đăng ký với id: " + id));

        entity.setFirstName(request.getFirstName());
        entity.setLastName(request.getLastName());
        entity.setBirthday(request.getBirthday());
        entity.setAddress(request.getAddress());
        entity.setPhoneNumber(request.getPhoneNumber());
        entity.setSchool(request.getSchool());
        entity.setMajorClass(request.getMajorClass());
        entity.setCourse(request.getCourse());
        entity.setKnowIStar(request.getKnowIStar());
        entity.setReasonIStarer(request.getReasonIStarer());
        if (request.getFacebookUrl() != null) {
            entity.setFacebookUrl(request.getFacebookUrl());
        }
        if (request.getAvatarUrl() != null) {
            entity.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getArea() != null) {
            entity.setArea(request.getArea());
        }

        // Cập nhật department (trong phase 3)
        if (request.getDepartments() != null) {
            applicationDepartmentRepository.deleteByApplicationId(id);
            entity.getApplicationDepartments().clear();
            for (ApplicationDepartmentRequest deptReq : request.getDepartments()) {
                ApplicationDepartment appDept = ApplicationDepartment.builder()
                        .application(entity)
                        .department(deptReq.getDepartment())
                        .build();
                applicationDepartmentRepository.save(appDept);
                entity.getApplicationDepartments().add(appDept);
            }
        }

        repository.save(entity);

        return ApplicationFormResponse.builder()
                .id(entity.getId())
                .fullName(entity.getFirstName() + " " + entity.getLastName())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .birthday(entity.getBirthday())
                .phoneNumber(entity.getPhoneNumber())
                .school(entity.getSchool())
                .majorClass(entity.getMajorClass())
                .course(entity.getCourse())
                .facebookUrl(entity.getFacebookUrl())
                .avatarUrl(entity.getAvatarUrl())
                .area(entity.getArea())
                .build();
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        Application entity = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đăng ký với id: " + id));

        entity.setIsDeleted(true);
        repository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportExcel() {
        var list = repository.findByIsDeletedFalse();
        return ExcelExporter.applicationToExcel(list);
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportExcel(AdminApplicationSearchCriteria criteria) {
        if (criteria == null) {
            return exportExcel();
        }
        var spec = ApplicationSpecification.withCriteria(criteria);

        String sortField = criteria.getSortBy() != null ? criteria.getSortBy() : "createdAt";
        org.springframework.data.domain.Sort sort = "ASC".equalsIgnoreCase(criteria.getSortDirection())
                ? org.springframework.data.domain.Sort.by(sortField).ascending()
                : org.springframework.data.domain.Sort.by(sortField).descending();

        var list = repository.findAll(spec, sort);
        return ExcelExporter.applicationToExcel(list);
    }

    @Override
    public ByteArrayInputStream generateExcelTemplate() {
        return ExcelExporter.generateTemplate();
    }

    @Override
    @Transactional
    public int importExcel(MultipartFile file, Long recruitmentId) {
        Recruitment recruitment;
        if (recruitmentId != null) {
            recruitment = recruitmentRepository.findById(recruitmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt tuyển với id: " + recruitmentId));
        } else {
            recruitment = recruitmentRepository.findByIsActiveTrueAndIsDeletedFalse()
                    .orElseThrow(() -> new BadRequestException("Hiện tại không có đợt tuyển thành viên nào đang mở."));
        }

        try {
            var applications = ExcelImporter.parseExcel(file.getInputStream(), recruitment);
            for (var app : applications) {
                repository.save(app);
                if (app.getApplicationDepartments() != null) {
                    for (var dept : app.getApplicationDepartments()) {
                        applicationDepartmentRepository.save(dept);
                    }
                }
            }
            return applications.size();
        } catch (IOException e) {
            throw new RuntimeException("Lỗi đọc file Excel: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public String uploadAvatar(Long id, MultipartFile file) {
        FileUploadUtil.validateAvatar(file);
        Application form = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ứng viên với id: " + id));

        try {
            String url = FileUploadUtil.saveFile(uploadDir, "avatars", file);
            form.setAvatarUrl(url);
            repository.save(form);
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi lưu file ảnh đại diện: " + e.getMessage());
        }
    }

    @Override
    public String uploadPublicAvatar(MultipartFile file) {
        FileUploadUtil.validateAvatar(file);
        try {
            return FileUploadUtil.saveFile(uploadDir, "avatars", file);
        } catch (IOException e) {
            throw new RuntimeException("Lỗi lưu file ảnh đại diện: " + e.getMessage());
        }
    }
}
