package com.haui.istar.service;

import com.haui.istar.model.Permission;
import com.haui.istar.model.PermissionGroup;

import java.util.List;

public interface PermissionService {
    List<Permission> getAllPermissions();
    List<PermissionGroup> getAllPermissionGroups();
    void assignPermissionsToUser(Long userId, List<String> permissionCodes);
    void removePermissionsFromUser(Long userId, List<String> permissionCodes);
    void assignPermissionGroupsToUser(Long userId, List<String> groupCodes);
    void removePermissionGroupsFromUser(Long userId, List<String> groupCodes);
}
