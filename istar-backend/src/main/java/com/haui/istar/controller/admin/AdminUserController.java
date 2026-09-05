package com.haui.istar.controller.admin;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.user.BulkUserActionRequest;
import com.haui.istar.dto.user.UpdateUserRequest;
import com.haui.istar.dto.user.UserDto;
import com.haui.istar.dto.user.UserSearchCriteria;
import com.haui.istar.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * Lấy danh sách tất cả user với phân trang
     * GET /api/admin/users?page=0&size=10
     */
    @GetMapping
    @PreAuthorize("hasAuthority('PERM_USER_VIEW')")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9999999") int size
    ) {
        Page<UserDto> users = adminUserService.getAllUsers(page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", users));
    }

    /**
     * Tìm kiếm user theo nhiều tiêu chí với phân trang
     * POST /api/admin/users/search
     */
    @PostMapping("/search")
    @PreAuthorize("hasAuthority('PERM_USER_VIEW')")
    public ResponseEntity<ApiResponse<Page<UserDto>>> searchUsers(
            @RequestBody UserSearchCriteria criteria
    ) {
        Page<UserDto> users = adminUserService.searchUsers(criteria);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm người dùng thành công", users));
    }

    /**
     * Lấy thông tin chi tiết user theo id
     * GET /api/admin/users/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_USER_VIEW')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = adminUserService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", user));
    }

    /**
     * Cập nhật thông tin user
     * PUT /api/admin/users/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_USER_EDIT')")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không được sửa username"));
        }

        UserDto updatedUser = adminUserService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật người dùng thành công", updatedUser));
    }

    /**
     * Xóa mềm user (đánh dấu isDeleted = true)
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_USER_DELETE')")
    public ResponseEntity<ApiResponse<Void>> softDeleteUser(@PathVariable Long id) {
        adminUserService.softDeleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa người dùng thành công", null));
    }

    /**
     * Vô hiệu hóa tài khoản user
     * PUT /api/admin/users/{id}/deactivate
     */
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('PERM_USER_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        adminUserService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("Vô hiệu hóa tài khoản thành công", null));
    }

    /**
     * Kích hoạt lại tài khoản user
     * PUT /api/admin/users/{id}/activate
     */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('PERM_USER_EDIT')")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long id) {
        adminUserService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success("Kích hoạt tài khoản thành công", null));
    }

    /**
     * Vô hiệu hóa hàng loạt tài khoản user
     * PUT /api/admin/users/bulk-deactivate
     */
    @PutMapping("/bulk-deactivate")
    @PreAuthorize("hasAuthority('PERM_USER_EDIT')")
    public ResponseEntity<ApiResponse<Void>> bulkDeactivateUsers(
            @Valid @RequestBody BulkUserActionRequest request
    ) {
        adminUserService.bulkDeactivateUsers(request.getUserIds());
        return ResponseEntity.ok(ApiResponse.success("Vô hiệu hóa các tài khoản đã chọn thành công", null));
    }

    /**
     * Xóa mềm hàng loạt tài khoản user
     * POST /api/admin/users/bulk-delete
     */
    @PostMapping("/bulk-delete")
    @PreAuthorize("hasAuthority('PERM_USER_DELETE')")
    public ResponseEntity<ApiResponse<Void>> bulkSoftDeleteUsers(
            @Valid @RequestBody BulkUserActionRequest request
    ) {
        adminUserService.bulkSoftDeleteUsers(request.getUserIds());
        return ResponseEntity.ok(ApiResponse.success("Xóa các người dùng đã chọn thành công", null));
    }

    /**
     * API Lấy danh sách các Position cho bộ lọc
     */
    @GetMapping("/filters/positions")
    public ResponseEntity<ApiResponse<List<Position>>> getPositions() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chức vụ thành công", Arrays.asList(Position.values())));
    }

    /**
     * API Lấy danh sách các Department cho bộ lọc
     */
    @GetMapping("/filters/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phòng ban thành công", Arrays.asList(Department.values())));
    }

    /**
     * API Lấy danh sách các Course cho bộ lọc (Duy nhất)
     */
    @GetMapping("/filters/courses")
    public ResponseEntity<ApiResponse<List<String>>> getCourses() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách khóa thành công", adminUserService.getAllUniqueCourses()));
    }
}
