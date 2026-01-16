package com.haui.istar.service.impl;

import com.haui.istar.util.ExcelExporter;
import org.springframework.stereotype.Service;

import com.haui.istar.dto.application.ApplicationFormRequest;
import com.haui.istar.dto.application.ApplicationFormResponse;
import com.haui.istar.model.Application;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.service.ApplicationFormService;

import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;

import java.io.ByteArrayInputStream;

import com.haui.istar.exception.BadRequestException;
import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.SubDepartment;

@Service
@RequiredArgsConstructor
public class ApplicationFormServiceImpl implements ApplicationFormService{

    private final ApplicationRepository repository;
    //Thêm
    @Override
    public ApplicationFormResponse submitApplication(ApplicationFormRequest request) {

        // Validate subDepartment logic
        if (request.getDepartment() == Department.MUSIC) {
            if (request.getSubDepartment() == null || request.getSubDepartment() == SubDepartment.NONE) {
                throw new BadRequestException("Thành viên Ban Âm nhạc phải chọn ban con (Hát/Rap/Nhạc cụ)");
            }
        } else {
             // For other departments, force NONE if not already
             if (request.getSubDepartment() != null && request.getSubDepartment() != SubDepartment.NONE) {
                 request.setSubDepartment(SubDepartment.NONE);
             }
        }

        // Check trùng email
        if (repository.existsByEmail(request.getEmail())) {
            throw new EntityExistsException("Email này đã ứng tuyển rồi!");
        }

        Application form = Application.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .birthday(request.getBirthday())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .subDepartment(request.getSubDepartment())
                .reasonDepartment(request.getReasonDepartment())
                .knowIStar(request.getKnowIStar())
                .reasonIStarer(request.getReasonIStarer())
                .build();

        Application saved = repository.save(form);

        return ApplicationFormResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFirstName() + " " + saved.getLastName())
                .email(saved.getEmail())
                .phoneNumber(saved.getPhoneNumber())
                .department(saved.getDepartment())
                .subDepartment(saved.getSubDepartment())
                .build();
    }
    //cập nhật
    public ApplicationFormResponse updateById(Long id, ApplicationFormRequest request) {

        Application entity = repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đăng ký"));

        // Validate subDepartment logic
        if (request.getDepartment() == Department.MUSIC) {
            if (request.getSubDepartment() == null || request.getSubDepartment() == SubDepartment.NONE) {
                throw new BadRequestException("Thành viên Ban Âm nhạc phải chọn ban con (Hát/Rap/Nhạc cụ)");
            }
        } else {
             if (request.getSubDepartment() != null && request.getSubDepartment() != SubDepartment.NONE) {
                 request.setSubDepartment(SubDepartment.NONE);
             }
        }

        entity.setFirstName(request.getFirstName());
        entity.setLastName(request.getLastName());
        entity.setBirthday(request.getBirthday());
        entity.setAddress(request.getAddress());
        entity.setPhoneNumber(request.getPhoneNumber());
        entity.setDepartment(request.getDepartment());
        entity.setSubDepartment(request.getSubDepartment());
        entity.setReasonDepartment(request.getReasonDepartment());
        entity.setKnowIStar(request.getKnowIStar());
        entity.setReasonIStarer(request.getReasonIStarer());
        entity.setCvUrl(request.getCvUrl());

        repository.save(entity);

        return ApplicationFormResponse.builder()
                .id(entity.getId())
                .fullName(entity.getFirstName() + " " + entity.getLastName())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .birthday(entity.getBirthday())
                .phoneNumber(entity.getPhoneNumber())
                .department(entity.getDepartment())
                .subDepartment(entity.getSubDepartment())
                .build();
    }

    //Xóa
    public void deleteById(Long id) {
        Application entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đăng ký với id: " + id));

        repository.delete(entity);
    }
    //Xuất excel
    @Override
    public ByteArrayInputStream exportExcel() {
        var list = repository.findAll();
        return ExcelExporter.applicationToExcel(list);
    }
}
