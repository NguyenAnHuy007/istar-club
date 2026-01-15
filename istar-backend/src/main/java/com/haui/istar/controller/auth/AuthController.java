package com.haui.istar.controller.auth;

import com.haui.istar.dto.auth.LoginRequest;
import com.haui.istar.dto.auth.LoginResponse;
import com.haui.istar.dto.auth.RegisterRequest;
import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.user.UserDto;
import com.haui.istar.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto userDto = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công!", userDto));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse loginResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công!", loginResponse));
    }
}

