package com.haui.istar.service;

import com.haui.istar.dto.admin.UpdateUserRequest;
import com.haui.istar.dto.common.UserDto;
import com.haui.istar.dto.admin.UserSearchCriteria;
import com.haui.istar.dto.user.ApplicationFormRequest;
import com.haui.istar.dto.user.ApplicationFormResponse;
import org.springframework.data.domain.Page;

import java.io.ByteArrayInputStream;

public interface AdminUserService {
    Page<UserDto> getAllUsers(int page, int size);
    Page<UserDto> searchUsers(UserSearchCriteria criteria);
    UserDto getUserById(Long id);
    UserDto updateUser(Long id, UpdateUserRequest request);
    void softDeleteUser(Long id);
    void deactivateUser(Long id);
    void activateUser(Long id);

    //admin application form
    ApplicationFormResponse submitApplication(ApplicationFormRequest request);
    ApplicationFormResponse updateById(Long id, ApplicationFormRequest request);
    void deleteById(Long id);
    ByteArrayInputStream exportExcel();
}
