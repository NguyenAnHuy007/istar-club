package com.haui.istar.controller.admin;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.model.Permission;
import com.haui.istar.model.PermissionGroup;
import com.haui.istar.repository.PermissionGroupRepository;
import com.haui.istar.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import com.haui.istar.service.PermissionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('PERM_USER_MANAGE_PERMISSIONS')")
    public ResponseEntity<ApiResponse<List<Permission>>> getAllPermissions() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách quyền thành công", permissionService.getAllPermissions()));
    }

    @GetMapping("/permission-groups")
    @PreAuthorize("hasAuthority('PERM_USER_MANAGE_PERMISSIONS')")
    public ResponseEntity<ApiResponse<List<PermissionGroup>>> getAllPermissionGroups() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhóm quyền thành công", permissionService.getAllPermissionGroups()));
    }

    @PostMapping("/users/{userId}/permissions")
    @PreAuthorize("hasAuthority('PERM_USER_MANAGE_PERMISSIONS')")
    public ResponseEntity<ApiResponse<Void>> assignPermissions(
            @PathVariable Long userId, @RequestBody List<String> codes) {
        permissionService.assignPermissionsToUser(userId, codes);
        return ResponseEntity.ok(ApiResponse.success("Cấp quyền thành công", null));
    }

    @DeleteMapping("/users/{userId}/permissions")
    @PreAuthorize("hasAuthority('PERM_USER_MANAGE_PERMISSIONS')")
    public ResponseEntity<ApiResponse<Void>> removePermissions(
            @PathVariable Long userId, @RequestBody List<String> codes) {
        permissionService.removePermissionsFromUser(userId, codes);
        return ResponseEntity.ok(ApiResponse.success("Thu hồi quyền thành công", null));
    }

    @PostMapping("/users/{userId}/permission-groups")
    @PreAuthorize("hasAuthority('PERM_USER_MANAGE_PERMISSIONS')")
    public ResponseEntity<ApiResponse<Void>> assignGroups(
            @PathVariable Long userId, @RequestBody List<String> codes) {
        permissionService.assignPermissionGroupsToUser(userId, codes);
        return ResponseEntity.ok(ApiResponse.success("Gán nhóm quyền thành công", null));
    }

    @DeleteMapping("/users/{userId}/permission-groups")
    @PreAuthorize("hasAuthority('PERM_USER_MANAGE_PERMISSIONS')")
    public ResponseEntity<ApiResponse<Void>> removeGroups(
            @PathVariable Long userId, @RequestBody List<String> codes) {
        permissionService.removePermissionGroupsFromUser(userId, codes);
        return ResponseEntity.ok(ApiResponse.success("Thu hồi nhóm quyền thành công", null));
    }
}
