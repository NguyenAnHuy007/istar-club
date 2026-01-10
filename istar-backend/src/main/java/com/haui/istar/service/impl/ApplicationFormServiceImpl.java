package com.haui.istar.service.impl;

import org.springframework.stereotype.Service;

import com.haui.istar.dto.user.ApplicationFormRequest;
import com.haui.istar.dto.user.ApplicationFormResponse;
import com.haui.istar.model.RegisterApplicationForm;
import com.haui.istar.repository.RegisterApplicationRepository;
import com.haui.istar.service.ApplicationFormService;

import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationFormServiceImpl implements ApplicationFormService{
    
    private final RegisterApplicationRepository repository;

    //Thêm
    @Override
    public ApplicationFormResponse submitApplication(ApplicationFormRequest request) {

        // Check trùng email
        if (repository.existsByEmail(request.getEmail())) {
            throw new EntityExistsException("Email này đã ứng tuyển rồi!");
        }

        RegisterApplicationForm form = RegisterApplicationForm.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .birthday(request.getBirthday())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .reasonDepartment(request.getReasonDepartment())
                .knowIStar(request.getKnowIStar())
                .reasonIStarer(request.getReasonIStarer())
                .build();

        RegisterApplicationForm saved = repository.save(form);

        return ApplicationFormResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFirstName() + " " + saved.getLastName())
                .email(saved.getEmail())
                .phoneNumber(saved.getPhoneNumber())
                .department(saved.getDepartment())
                .build();
    }
    //Sửa
    public ApplicationFormResponse updateByEmail(String email, ApplicationFormRequest request) {

        RegisterApplicationForm entity = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đăng ký"));

        entity.setFirstName(request.getFirstName());
        entity.setLastName(request.getLastName());
        entity.setBirthday(request.getBirthday());
        entity.setAddress(request.getAddress());
        entity.setPhoneNumber(request.getPhoneNumber());
        entity.setDepartment(request.getDepartment());
        entity.setReasonDepartment(request.getReasonDepartment());
        entity.setKnowIStar(request.getKnowIStar());
        entity.setReasonIStarer(request.getReasonIStarer());
        entity.setCvUrl(request.getCvUrl());

        repository.save(entity);

        if (request.getEmail() != null && !request.getEmail().equals(email)) {
        throw new IllegalArgumentException("Email không được thay đổi");
        }
        return ApplicationFormResponse.builder()
        .id(entity.getId())
        .fullName(entity.getFirstName() + " " + entity.getLastName())
        .firstName(entity.getFirstName())
        .lastName(entity.getLastName())
        .email(entity.getEmail())
        .birthday(entity.getBirthday())
        .phoneNumber(entity.getPhoneNumber())
        .department(entity.getDepartment())
        .build();
    }

    //Xóa
    @Override
public void deleteByEmail(String email) {
    RegisterApplicationForm entity = repository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đăng ký với email: " + email));

    repository.delete(entity);
}


}
