package com.haui.istar.service;

import com.haui.istar.dto.user.UpdateUserRequest;
import com.haui.istar.dto.user.UserDto;
import com.haui.istar.dto.user.UserSearchCriteria;
import org.springframework.data.domain.Page;

public interface AdminUserService {
    Page<UserDto> getAllUsers(int page, int size);
    Page<UserDto> searchUsers(UserSearchCriteria criteria);
    UserDto getUserById(Long id);
    UserDto updateUser(Long id, UpdateUserRequest request);
    void softDeleteUser(Long id);
    void deactivateUser(Long id);
    void activateUser(Long id);
}
