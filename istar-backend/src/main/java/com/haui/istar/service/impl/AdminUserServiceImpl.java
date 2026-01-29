package com.haui.istar.service.impl;

import com.haui.istar.dto.user.*;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.model.*;
import com.haui.istar.repository.GenerationRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.repository.specification.UserSpecification;
import com.haui.istar.service.AdminUserService;
import com.haui.istar.util.UserValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import static com.haui.istar.util.ServiceUpdateUtils.updateIfChanged;
import static com.haui.istar.util.ServiceUpdateUtils.updateIfNotNull;

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
        Specification<User> spec = (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("isDeleted"), false);
        return userRepository.findAll(spec, pageable).map(this::mapToUserDto);
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
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new RuntimeException("Người dùng đã bị xóa");
        }
        return mapToUserDto(user);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new RuntimeException("Không thể cập nhật người dùng đã bị xóa");
        }
        updateIfChanged(request.getUsername(), user.getUsername(), v -> {
            if (userRepository.existsByUsername(v)) throw new BadRequestException("Username đã tồn tại!");
            user.setUsername(v);
        });
        updateIfChanged(request.getEmail(), user.getEmail(), v -> {
            if (userRepository.existsByEmail(v)) throw new BadRequestException("Email đã tồn tại!");
            user.setEmail(v);
        });
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        updateIfNotNull(request.getFirstName(), user::setFirstName);
        updateIfNotNull(request.getLastName(), user::setLastName);
        updateIfNotNull(request.getBirthday(), user::setBirthday);
        updateIfNotNull(request.getAddress(), user::setAddress);
        updateIfNotNull(request.getPhoneNumber(), user::setPhoneNumber);
        updateIfNotNull(request.getDepartment(), user::setDepartment);
        updateIfNotNull(request.getSubDepartment(), user::setSubDepartment);
        updateIfNotNull(request.getSchool(), user::setSchool);
        updateIfNotNull(request.getMajorClass(), user::setMajorClass);
        updateIfNotNull(request.getCourse(), user::setCourse);
        updateIfNotNull(request.getIsDeleted(), user::setIsDeleted);
        updateIfNotNull(request.getRole(), user::setRole);
        updateIfNotNull(request.getPosition(), user::setPosition);
        updateIfNotNull(request.getArea(), user::setArea);
        if (request.getGenerationId() != null) {
            Generation generation = generationRepository.findById(request.getGenerationId())
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy gen với id: " + request.getGenerationId()));
            user.setGeneration(generation);
        }
        userValidator.validateUser(user, id);
        User savedUser = userRepository.save(user);
        return mapToUserDto(savedUser);
    }

    @Override
    @Transactional
    public void softDeleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new RuntimeException("Người dùng đã bị xóa rồi");
        }
        user.setIsDeleted(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new RuntimeException("Không thể thao tác với người dùng đã bị xóa");
        }
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new RuntimeException("Không thể thao tác với người dùng đã bị xóa");
        }
        user.setIsActive(true);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllUniqueCourses() {
        return userRepository.findDistinctCourses();
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.fromEntity(user);
    }
}
