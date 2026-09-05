package com.haui.istar.service.impl;

import com.haui.istar.dto.application.ApplicationDepartmentRequest;
import com.haui.istar.dto.application.ApplicationFormRequest;
import com.haui.istar.dto.application.ApplicationFormResponse;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.Recruitment;
import com.haui.istar.repository.ApplicationDepartmentRepository;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.repository.RecruitmentRepository;
import com.haui.istar.service.ApplicationFormService;
import com.haui.istar.util.ExcelExporter;
import com.haui.istar.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;

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
        // Removed subDepartment validation

        // Validate recruitment
        Recruitment recruitment = recruitmentRepository.findByIdAndIsDeletedFalse(request.getRecruitmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt tuyển với id: " + request.getRecruitmentId()));
        if (!Boolean.TRUE.equals(recruitment.getIsActive())) {
            throw new BadRequestException("Đợt tuyển này đã đóng!");
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
                .recruitment(recruitment)
                .build();

        Application saved = repository.save(form);

        for (ApplicationDepartmentRequest deptReq : request.getDepartments()) {
            ApplicationDepartment appDept = ApplicationDepartment.builder()
                    .application(saved)
                    .department(deptReq.getDepartment())
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
                .avatarUrl(saved.getAvatarUrl())
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
        if (request.getAvatarUrl() != null) {
            entity.setAvatarUrl(request.getAvatarUrl());
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
                .avatarUrl(entity.getAvatarUrl())
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
    @Transactional
    public String uploadAvatar(Long id, MultipartFile file) {
        FileUploadUtil.validateAvatar(file);
        Application form = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ứng viên với id: " + id));

        try {
            String url = FileUploadUtil.saveFile(uploadDir, file);
            form.setAvatarUrl(url);
            repository.save(form);
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi lưu file ảnh đại diện: " + e.getMessage());
        }
    }
}
