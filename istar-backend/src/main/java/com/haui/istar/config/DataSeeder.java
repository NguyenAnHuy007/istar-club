package com.haui.istar.config;

import com.haui.istar.model.Permission;
import com.haui.istar.model.PermissionGroup;
import com.haui.istar.model.User;
import com.haui.istar.model.enums.Role;
import com.haui.istar.repository.PermissionGroupRepository;
import com.haui.istar.repository.PermissionRepository;
import com.haui.istar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedPermissions();
        seedPermissionGroups();
        seedAdminPermissions();
    }

    private void seedPermissions() {
        if (permissionRepository.count() > 0) {
            return;
        }
        log.info("Seeding permissions...");
        List<Permission> permissions = Arrays.asList(
                Permission.builder().code("APPLICATION_VIEW").name("Xem đơn ứng tuyển").module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_VIEW_OWN_DEPT").name("Xem đơn ứng tuyển ban mình").module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_CREATE").name("Tạo đơn ứng tuyển").module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_EDIT").name("Sửa đơn ứng tuyển").module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_DELETE").name("Xóa đơn ứng tuyển").module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_CHECKIN").name("Check-in đơn ứng tuyển").module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_EXPORT").name("Xuất file đơn ứng tuyển").module("APPLICATION").build(),
                Permission.builder().code("INTERVIEW_CONDUCT").name("Thực hiện phỏng vấn").module("INTERVIEW").build(),
                Permission.builder().code("INTERVIEW_VIEW_QUEUE").name("Xem hàng chờ phỏng vấn").module("INTERVIEW").build(),
                Permission.builder().code("APPLICATION_REVIEW").name("Xét duyệt đơn").module("REVIEW").build(),
                Permission.builder().code("APPLICATION_CREATE_ACCOUNT").name("Tạo tài khoản từ đơn").module("REVIEW").build(),
                Permission.builder().code("USER_VIEW").name("Xem thành viên").module("USER").build(),
                Permission.builder().code("USER_EDIT").name("Sửa thành viên").module("USER").build(),
                Permission.builder().code("USER_DELETE").name("Xóa thành viên").module("USER").build(),
                Permission.builder().code("USER_MANAGE_PERMISSIONS").name("Quản lý quyền thành viên").module("USER").build(),
                Permission.builder().code("GENERATION_MANAGE").name("Quản lý thế hệ").module("GENERATION").build(),
                Permission.builder().code("RECRUITMENT_MANAGE").name("Quản lý đợt tuyển").module("RECRUITMENT").build()
        );
        permissionRepository.saveAll(permissions);
    }

    private void seedPermissionGroups() {
        if (permissionGroupRepository.count() > 0) {
            return;
        }
        log.info("Seeding permission groups...");
        List<Permission> allPerms = permissionRepository.findAll();

        PermissionGroup adminGroup = PermissionGroup.builder()
                .code("ADMIN")
                .name("Quản trị viên")
                .description("Nhóm quyền cao nhất, có tất cả các quyền")
                .permissions(new HashSet<>(allPerms))
                .build();

        PermissionGroup receptionistGroup = PermissionGroup.builder()
                .code("RECEPTIONIST")
                .name("Lễ tân")
                .description("Check-in và quản lý đơn")
                .permissions(getPermissionsByCodes(allPerms, Arrays.asList(
                        "APPLICATION_VIEW", "APPLICATION_CREATE", "APPLICATION_EDIT", "APPLICATION_CHECKIN"
                )))
                .build();

        PermissionGroup interviewerGroup = PermissionGroup.builder()
                .code("INTERVIEWER")
                .name("Phỏng vấn viên")
                .description("Nhận đơn từ hàng chờ và phỏng vấn")
                .permissions(getPermissionsByCodes(allPerms, Arrays.asList(
                        "APPLICATION_VIEW_OWN_DEPT", "INTERVIEW_CONDUCT", "INTERVIEW_VIEW_QUEUE"
                )))
                .build();

        PermissionGroup reviewerGroup = PermissionGroup.builder()
                .code("REVIEWER")
                .name("Xét duyệt")
                .description("Xét duyệt đơn sau khi phỏng vấn")
                .permissions(getPermissionsByCodes(allPerms, Arrays.asList(
                        "APPLICATION_VIEW", "APPLICATION_REVIEW", "APPLICATION_CREATE_ACCOUNT", "APPLICATION_EXPORT"
                )))
                .build();

        permissionGroupRepository.saveAll(Arrays.asList(adminGroup, receptionistGroup, interviewerGroup, reviewerGroup));
    }

    private void seedAdminPermissions() {
        List<User> admins = userRepository.findAll();
        PermissionGroup adminGroup = permissionGroupRepository.findByCode("ADMIN").orElse(null);
        if (adminGroup != null) {
            for (User user : admins) {
                if (user.getRole() == Role.ADMIN) {
                    if (user.getPermissionGroups() == null) {
                        user.setPermissionGroups(new HashSet<>());
                    }
                    if (!user.getPermissionGroups().contains(adminGroup)) {
                        user.getPermissionGroups().add(adminGroup);
                        userRepository.save(user);
                        log.info("Assigned ADMIN permission group to user: " + user.getUsername());
                    }
                }
            }
        }
    }

    private Set<Permission> getPermissionsByCodes(List<Permission> allPerms, List<String> codes) {
        Set<Permission> result = new HashSet<>();
        for (Permission p : allPerms) {
            if (codes.contains(p.getCode())) {
                result.add(p);
            }
        }
        return result;
    }
}
