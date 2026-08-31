package com.haui.istar.service.impl;

import com.haui.istar.dto.user.ChangePasswordRequest;
import com.haui.istar.dto.user.UpdateProfileRequest;
import com.haui.istar.dto.user.UserDepartmentRequest;
import com.haui.istar.dto.user.UserDto;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.exception.UnauthorizedException;
import com.haui.istar.model.User;
import com.haui.istar.model.UserDepartment;
import com.haui.istar.model.enums.Position;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new ResourceNotFoundException("Người dùng đã bị xóa");
        }
        return UserDto.fromEntity(user);
    }

    @Override
    @Transactional
    public UserDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));

        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new ResourceNotFoundException("Người dùng đã bị xóa");
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email đã tồn tại!");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getBirthday() != null) user.setBirthday(request.getBirthday());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());

        if (request.getUserDepartments() != null) {
            user.getUserDepartments().clear();
            for (UserDepartmentRequest udReq : request.getUserDepartments()) {
                UserDepartment ud = UserDepartment.builder()
                        .user(user)
                        .department(udReq.getDepartment())
                        .position(udReq.getPosition() != null ? udReq.getPosition() : Position.MEMBER)
                        .build();
                user.getUserDepartments().add(ud);
            }
        }

        User saved = userRepository.save(user);
        return UserDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));

        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new ResourceNotFoundException("Người dùng đã bị xóa");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new UnauthorizedException("Mật khẩu cũ không đúng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
