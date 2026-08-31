package com.haui.istar.service.impl;

import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Permission;
import com.haui.istar.model.PermissionGroup;
import com.haui.istar.model.User;
import com.haui.istar.repository.PermissionGroupRepository;
import com.haui.istar.repository.PermissionRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final UserRepository userRepository;

    @Override
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    @Override
    public List<PermissionGroup> getAllPermissionGroups() {
        return permissionGroupRepository.findAll();
    }

    @Override
    @Transactional
    public void assignPermissionsToUser(Long userId, List<String> permissionCodes) {
        User user = getUser(userId);
        List<Permission> permissions = permissionRepository.findByCodeIn(permissionCodes);
        user.getPermissions().addAll(permissions);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removePermissionsFromUser(Long userId, List<String> permissionCodes) {
        User user = getUser(userId);
        List<Permission> permissions = permissionRepository.findByCodeIn(permissionCodes);
        user.getPermissions().removeAll(permissions);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void assignPermissionGroupsToUser(Long userId, List<String> groupCodes) {
        User user = getUser(userId);
        List<PermissionGroup> groups = permissionGroupRepository.findByCodeIn(groupCodes);
        user.getPermissionGroups().addAll(groups);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removePermissionGroupsFromUser(Long userId, List<String> groupCodes) {
        User user = getUser(userId);
        List<PermissionGroup> groups = permissionGroupRepository.findByCodeIn(groupCodes);
        user.getPermissionGroups().removeAll(groups);
        userRepository.save(user);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));
    }
}
