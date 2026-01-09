package com.haui.istar.service;

import com.haui.istar.dto.common.UserDto;

public interface UserService {
    UserDto getProfile(Long userId);
    UserDto updateProfile(Long userId, com.haui.istar.dto.user.UpdateProfileRequest request);
    void changePassword(Long userId, com.haui.istar.dto.user.ChangePasswordRequest request);
}

