package com.haui.istar.service.impl;

import com.haui.istar.dto.common.UserDto;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.exception.UnauthorizedException;
import com.haui.istar.model.User;
import com.haui.istar.model.UserRole;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));
        return mapToUserDto(user);
    }

    @Override
    @Transactional
    public UserDto updateProfile(Long userId, com.haui.istar.dto.user.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));

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
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());

        User saved = userRepository.save(user);
        return mapToUserDto(saved);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, com.haui.istar.dto.user.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new UnauthorizedException("Mật khẩu cũ không đúng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
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
}

