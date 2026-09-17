package com.haui.istar.service.impl;

import com.haui.istar.dto.user.*;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.model.*;
import com.haui.istar.model.enums.*;
import com.haui.istar.repository.GenerationRepository;
import com.haui.istar.repository.PermissionGroupRepository;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import static com.haui.istar.util.ServiceUpdateUtils.updateIfNotNull;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {
    private final UserRepository userRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserValidator userValidator;
    private final GenerationRepository generationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Specification<User> spec = (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isDeleted"),
                false);
        return userRepository.findAll(spec, pageable).map(this::mapToUserDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> searchUsers(UserSearchCriteria criteria) {
        int page = criteria.getPage() != null ? Math.max(0, criteria.getPage()) : 0;
        int size = criteria.getSize() != null && criteria.getSize() > 0 ? criteria.getSize() : 10;
        String sortBy = criteria.getSortBy();
        if (sortBy == null || sortBy.trim().isEmpty() || "role".equalsIgnoreCase(sortBy)) {
            sortBy = "id";
        }
        Sort.Direction direction = "DESC".equalsIgnoreCase(criteria.getSortDirection())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
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
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String trimmedUsername = request.getUsername().trim();
            if (!trimmedUsername.equalsIgnoreCase(user.getUsername())) {
                if (userRepository.existsByUsername(trimmedUsername)) {
                    throw new BadRequestException("Username đã tồn tại!");
                }
                user.setUsername(trimmedUsername);
            }
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String trimmedEmail = request.getEmail().trim();
            if (!trimmedEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmail(trimmedEmail)) {
                    throw new BadRequestException("Email đã tồn tại!");
                }
                user.setEmail(trimmedEmail);
            }
        }
        if (request.getPassword() != null) {
            String trimmedPassword = request.getPassword().trim();
            if (!trimmedPassword.isEmpty()) {
                if (trimmedPassword.length() < 6) {
                    throw new BadRequestException("Mật khẩu mới phải có ít nhất 6 ký tự!");
                }
                if (trimmedPassword.length() > 100) {
                    throw new BadRequestException("Mật khẩu mới không được vượt quá 100 ký tự!");
                }
                user.setPassword(passwordEncoder.encode(trimmedPassword));
            }
        }
        updateIfNotNull(request.getFirstName(), user::setFirstName);
        updateIfNotNull(request.getLastName(), user::setLastName);
        updateIfNotNull(request.getBirthday(), user::setBirthday);
        updateIfNotNull(request.getAddress(), user::setAddress);
        updateIfNotNull(request.getPhoneNumber(), user::setPhoneNumber);
        updateIfNotNull(request.getSchool(), user::setSchool);
        updateIfNotNull(request.getMajorClass(), user::setMajorClass);
        updateIfNotNull(request.getCourse(), user::setCourse);
        updateIfNotNull(request.getIsDeleted(), user::setIsDeleted);

        if (request.getPermissionGroupCodes() != null) {
            List<PermissionGroup> groups = permissionGroupRepository.findByCodeIn(request.getPermissionGroupCodes());
            Set<String> targetCodes = groups.stream()
                    .filter(Objects::nonNull)
                    .map(g -> g.getCode())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            user.getPermissionGroups().removeIf(g -> !targetCodes.contains(g.getCode()));
            Set<String> currentCodes = user.getPermissionGroups().stream()
                    .filter(Objects::nonNull)
                    .map(g -> g.getCode())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            for (PermissionGroup g : groups) {
                if (!currentCodes.contains(g.getCode())) {
                    user.getPermissionGroups().add(g);
                }
            }
        } else if (request.getRole() != null) {
            permissionGroupRepository.findByCode(request.getRole().name()).ifPresent(g -> {
                user.getPermissionGroups().removeIf(existing -> !existing.getCode().equals(g.getCode()));
                if (user.getPermissionGroups().isEmpty()) {
                    user.getPermissionGroups().add(g);
                }
            });
        }

        updateIfNotNull(request.getPosition(), user::setPosition);
        updateIfNotNull(request.getArea(), user::setArea);
        if (request.getGenerationId() != null) {
            Generation generation = generationRepository.findById(request.getGenerationId())
                    .orElseThrow(
                            () -> new BadRequestException("Không tìm thấy gen với id: " + request.getGenerationId()));
            user.setGeneration(generation);
        }

        if (request.getUserDepartments() != null) {
            Map<Department, Position> requestedDepts = new HashMap<>();
            for (UserDepartmentRequest udReq : request.getUserDepartments()) {
                if (udReq.getDepartment() != null) {
                    requestedDepts.put(
                            udReq.getDepartment(),
                            udReq.getPosition() != null ? udReq.getPosition() : Position.MEMBER);
                }
            }

            // 1. Xóa các ban cũ không còn trong danh sách yêu cầu (orphanRemoval sẽ tự động
            // delete khỏi DB)
            user.getUserDepartments().removeIf(ud -> !requestedDepts.containsKey(ud.getDepartment()));

            // 2. Cập nhật vị trí (Position) cho các ban đang có & ghi nhận danh sách ban
            // hiện tại
            Set<Department> existingDepts = new HashSet<>();
            for (UserDepartment ud : user.getUserDepartments()) {
                ud.setPosition(requestedDepts.get(ud.getDepartment()));
                existingDepts.add(ud.getDepartment());
            }

            // 3. Thêm các ban mới chưa tồn tại trong danh sách của user
            for (Map.Entry<Department, Position> entry : requestedDepts.entrySet()) {
                if (!existingDepts.contains(entry.getKey())) {
                    UserDepartment newUd = UserDepartment.builder()
                            .user(user)
                            .department(entry.getKey())
                            .position(entry.getValue())
                            .build();
                    user.getUserDepartments().add(newUd);
                }
            }
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
    public void bulkSoftDeleteUsers(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty())
            return;
        List<User> users = userRepository.findAllById(userIds);
        for (User user : users) {
            user.setIsDeleted(true);
        }
        userRepository.saveAll(users);
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
    public void bulkDeactivateUsers(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty())
            return;
        List<User> users = userRepository.findAllById(userIds);
        for (User user : users) {
            if (!Boolean.TRUE.equals(user.getIsDeleted())) {
                user.setIsActive(false);
            }
        }
        userRepository.saveAll(users);
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
