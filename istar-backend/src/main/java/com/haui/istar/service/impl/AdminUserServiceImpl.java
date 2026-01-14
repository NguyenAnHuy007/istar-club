package com.haui.istar.service.impl;

import com.haui.istar.dto.admin.UpdateUserRequest;
import com.haui.istar.dto.common.UserDto;
import com.haui.istar.dto.admin.UserSearchCriteria;
import com.haui.istar.dto.user.ApplicationFormRequest;
import com.haui.istar.dto.user.ApplicationFormResponse;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.model.RegisterApplicationForm;
import com.haui.istar.model.User;
import com.haui.istar.model.UserRole;
import com.haui.istar.repository.RegisterApplicationRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.repository.UserSpecification;
import com.haui.istar.service.AdminUserService;
import com.haui.istar.service.ApplicationFormService;
import com.haui.istar.util.ExcelExporter;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService, ApplicationFormService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RegisterApplicationRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return userRepository.findAll(pageable).map(this::mapToUserDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> searchUsers(UserSearchCriteria criteria) {
        Sort sort = Sort.by(
                criteria.getSortDirection().equalsIgnoreCase("DESC")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                criteria.getSortBy());

        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), sort);
        Specification<User> spec = UserSpecification.buildSpecification(criteria);

        return userRepository.findAll(spec, pageable).map(this::mapToUserDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));
        return mapToUserDto(user);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));

        // Kiểm tra username trùng (nếu thay đổi)
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username đã tồn tại!");
            }
            user.setUsername(request.getUsername());
        }

        // Kiểm tra email trùng (nếu thay đổi)
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email đã tồn tại!");
            }
            user.setEmail(request.getEmail());
        }

        // Cập nhật password nếu có
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Cập nhật các trường khác
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getBirthday() != null) {
            user.setBirthday(request.getBirthday());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getPart() != null) {
            user.setDepartment(request.getPart());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        if (request.getIsDeleted() != null) {
            user.setIsDeleted(request.getIsDeleted());
        }

        // Cập nhật roles nếu có
        if (request.getRoles() != null) {
            user.getRoles().clear();
            for (Integer roleNum : request.getRoles()) {
                UserRole userRole = UserRole.builder()
                        .user(user)
                        .role(roleNum)
                        .build();
                user.getRoles().add(userRole);
            }
        }

        User savedUser = userRepository.save(user);
        return mapToUserDto(savedUser);
    }

    @Override
    @Transactional
    public void softDeleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));
        user.setIsDeleted(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));
        user.setIsActive(true);
        userRepository.save(user);
    }

    private UserDto mapToUserDto(User user) {
        List<Integer> roles = user.getRoles().stream()
                .map(UserRole::getRole)
                .collect(Collectors.toList());

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthday(user.getBirthday())
                .address(user.getAddress())
                .part(user.getDepartment())
                .phoneNumber(user.getPhoneNumber())
                .isActive(user.getIsActive())
                .isDeleted(user.getIsDeleted())
                .roles(roles)
                .build();
    }

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
    //cập nhật
    public ApplicationFormResponse updateById(Long id, ApplicationFormRequest request) {

        RegisterApplicationForm entity = repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đăng ký"));
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
    public void deleteById(Long id) {
        RegisterApplicationForm entity = repository.findById(id)
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
