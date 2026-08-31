package com.haui.istar.service;

import com.haui.istar.dto.user.ChangePasswordRequest;
import com.haui.istar.dto.user.UpdateProfileRequest;
import com.haui.istar.dto.user.UserDto;

public interface UserService {
    UserDto getProfile(Long userId);
    UserDto updateProfile(Long userId, UpdateProfileRequest request);
    void changePassword(Long userId, ChangePasswordRequest request);
}

