package com.haui.istar.service;

import com.haui.istar.dto.auth.LoginRequest;
import com.haui.istar.dto.auth.LoginResponse;
import com.haui.istar.dto.auth.RegisterRequest;
import com.haui.istar.dto.common.UserDto;

public interface AuthService {

    UserDto register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    // note: profile-related methods moved to UserService
}
