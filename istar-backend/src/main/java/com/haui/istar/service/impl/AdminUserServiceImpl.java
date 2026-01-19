package com.haui.istar.service.impl;

import com.haui.istar.dto.user.UpdateUserRequest;
import com.haui.istar.dto.user.UserDto;
import com.haui.istar.dto.user.UserSearchCriteria;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.model.Generation;
import com.haui.istar.model.User;
import com.haui.istar.repository.GenerationRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.repository.specification.UserSpecification;
import com.haui.istar.service.AdminUserService;
import com.haui.istar.util.UserValidator;
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
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserValidator userValidator;
    private final GenerationRepository generationRepository;

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

        // Cập nhật thông tin cơ bản
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
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        // Cập nhật department trước subDepartment (quan trọng cho validation)
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }

        // Cập nhật subDepartment
        if (request.getSubDepartment() != null) {
            user.setSubDepartment(request.getSubDepartment());
        }

        if (request.getSchool() != null) {
            user.setSchool(request.getSchool());
        }

        if (request.getMajorClass() != null) {
            user.setMajorClass(request.getMajorClass());
        }

        if (request.getCourse() != null) {
            user.setCourse(request.getCourse());
        }

        // Cập nhật status
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        if (request.getIsDeleted() != null) {
            user.setIsDeleted(request.getIsDeleted());
        }

        // Cập nhật quyền và chức vụ
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getPosition() != null) {
            user.setPosition(request.getPosition());
        }

        // Cập nhật khu vực
        if (request.getArea() != null) {
            user.setArea(request.getArea());
        }

        // Cập nhật generation
        if (request.getGenerationId() != null) {
            Generation generation = generationRepository.findById(request.getGenerationId())
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy gen với id: " + request.getGenerationId()));
            user.setGeneration(generation);
        }

        // Validate business rules SAU KHI cập nhật tất cả fields
        userValidator.validateUser(user, id);

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
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthday(user.getBirthday())
                .address(user.getAddress())
                .department(user.getDepartment())
                .subDepartment(user.getSubDepartment())
                .school(user.getSchool())
                .majorClass(user.getMajorClass())
                .course(user.getCourse())
                .phoneNumber(user.getPhoneNumber())
                .isActive(user.getIsActive())
                .isDeleted(user.getIsDeleted())
                .role(user.getRole())
                .position(user.getPosition())
                .area(user.getArea())
                .generationId(user.getGeneration() != null ? user.getGeneration().getId() : null)
                .generationName(user.getGeneration() != null ? user.getGeneration().getName() : null)
                .build();
    }
}
