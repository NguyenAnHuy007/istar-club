package com.haui.istar.service;

import com.haui.istar.dto.user.UpdateUserRequest;
import com.haui.istar.dto.user.UserDto;
import com.haui.istar.dto.user.UserSearchCriteria;
import org.springframework.data.domain.Page;
import java.util.List;

public interface AdminUserService {
    Page<UserDto> getAllUsers(int page, int size);
    Page<UserDto> searchUsers(UserSearchCriteria criteria);
    UserDto getUserById(Long id);
    UserDto updateUser(Long id, UpdateUserRequest request);
    void softDeleteUser(Long id);
    void bulkSoftDeleteUsers(List<Long> userIds);
    void deactivateUser(Long id);
    void bulkDeactivateUsers(List<Long> userIds);
    void activateUser(Long id);
    List<String> getAllUniqueCourses();
}
