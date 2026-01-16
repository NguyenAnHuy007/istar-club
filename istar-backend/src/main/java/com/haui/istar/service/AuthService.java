package com.haui.istar.service;

import com.haui.istar.dto.auth.LoginRequest;
import com.haui.istar.dto.auth.LoginResponse;
import com.haui.istar.dto.auth.RegisterRequest;
import com.haui.istar.dto.auth.TokenRefreshRequest;
import com.haui.istar.dto.auth.TokenRefreshResponse;
import com.haui.istar.dto.user.UserDto;

public interface AuthService {

    UserDto register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    TokenRefreshResponse refreshToken(TokenRefreshRequest request);
}
