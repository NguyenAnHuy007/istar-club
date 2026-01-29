package com.haui.istar.service.impl;

import com.haui.istar.dto.auth.LoginRequest;
import com.haui.istar.dto.auth.LoginResponse;
import com.haui.istar.dto.auth.RegisterRequest;
import com.haui.istar.dto.user.UserDto;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.model.User;
import com.haui.istar.model.enums.Role;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.security.JwtTokenProvider;
import com.haui.istar.security.UserPrincipal;
import com.haui.istar.service.AuthService;
import com.haui.istar.util.UserValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserValidator userValidator;

    @Override
    @Transactional
    public UserDto register(RegisterRequest request) {
        // Kiểm tra username đã tồn tại chưa
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username đã tồn tại!");
        }

        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại!");
        }

        // Tạo user mới với role và position mặc định là MEMBER
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .birthday(request.getBirthday())
                .address(request.getAddress())
                .department(request.getDepartment())
                .subDepartment(request.getSubDepartment())
                .school(request.getSchool())
                .majorClass(request.getMajorClass())
                .course(request.getCourse())
                .role(Role.MEMBER)
                .build();

        // Validate business rules (area constraint, subDepartment)
        // Không validate position limit vì user mới luôn là MEMBER
        userValidator.validateAreaConstraint(user);
        userValidator.validateSubDepartment(user);

        User savedUser = userRepository.save(user);

        return mapToUserDto(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        assert userPrincipal != null;
        return LoginResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userPrincipal.getId())
                .username(userPrincipal.getUsername())
                .email(userPrincipal.getEmail())
                .role(userPrincipal.getRole())
                .build();
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.fromEntity(user);
    }
}
