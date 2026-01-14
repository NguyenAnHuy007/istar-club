//package com.haui.istar.service.impl;
//
//import com.haui.istar.util.ExcelExporter;
//import org.springframework.stereotype.Service;
//
//import com.haui.istar.dto.user.ApplicationFormRequest;
//import com.haui.istar.dto.user.ApplicationFormResponse;
//import com.haui.istar.model.RegisterApplicationForm;
//import com.haui.istar.repository.RegisterApplicationRepository;
//import com.haui.istar.service.ApplicationFormService;
//
//import jakarta.persistence.EntityExistsException;
//import lombok.RequiredArgsConstructor;
//
//import java.io.ByteArrayInputStream;
//
//@Service
//@RequiredArgsConstructor
//public class ApplicationFormServiceImpl implements ApplicationFormService{
//
//    private final RegisterApplicationRepository repository;
//    //Thêm
//    @Override
//    public ApplicationFormResponse submitApplication(ApplicationFormRequest request) {
//
//        // Check trùng email
//        if (repository.existsByEmail(request.getEmail())) {
//            throw new EntityExistsException("Email này đã ứng tuyển rồi!");
//        }
//
//        RegisterApplicationForm form = RegisterApplicationForm.builder()
//                .email(request.getEmail())
//                .firstName(request.getFirstName())
//                .lastName(request.getLastName())
//                .birthday(request.getBirthday())
//                .address(request.getAddress())
//                .phoneNumber(request.getPhoneNumber())
//                .department(request.getDepartment())
//                .reasonDepartment(request.getReasonDepartment())
//                .knowIStar(request.getKnowIStar())
//                .reasonIStarer(request.getReasonIStarer())
//                .build();
//
//        RegisterApplicationForm saved = repository.save(form);
//
//        return ApplicationFormResponse.builder()
//                .id(saved.getId())
//                .fullName(saved.getFirstName() + " " + saved.getLastName())
//                .email(saved.getEmail())
//                .phoneNumber(saved.getPhoneNumber())
//                .department(saved.getDepartment())
//                .build();
//    }
//}
