package com.haui.istar.config;

import com.haui.istar.model.CommonCode;
import com.haui.istar.model.Generation;
import com.haui.istar.model.Permission;
import com.haui.istar.model.PermissionGroup;
import com.haui.istar.model.User;
import com.haui.istar.model.enums.Position;
import com.haui.istar.repository.CommonCodeRepository;
import com.haui.istar.repository.GenerationRepository;
import com.haui.istar.repository.LandingConfigRepository;
import com.haui.istar.repository.PermissionGroupRepository;
import com.haui.istar.repository.PermissionRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.service.LandingConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * SystemDataSeeder — Dữ liệu cốt lõi của hệ thống iStar Club.
 * Chứa các bảng danh mục cơ bản (permissions, permission groups, default admin,
 * common codes trường/khoa, khóa học, thế hệ CLB, landing page config mặc định).
 * Dữ liệu này được GIỮ LẠI trên cả môi trường Development và Production.
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class SystemDataSeeder implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final UserRepository userRepository;
    private final CommonCodeRepository commonCodeRepository;
    private final GenerationRepository generationRepository;
    private final LandingConfigRepository landingConfigRepository;
    private final LandingConfigService landingConfigService;
    @Lazy
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedPermissions();
        seedPermissionGroups();
        seedDefaultAdmin();
        seedAdminPermissions();
        seedCommonCodes();
        seedGenerations();
        seedLandingConfig();
    }

    private void seedPermissions() {
        if (permissionRepository.count() > 0) {
            return;
        }
        log.info("Seeding permissions...");
        List<Permission> permissions = Arrays.asList(
                Permission.builder().code("APPLICATION_VIEW").name("Xem đơn ứng tuyển").module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_VIEW_OWN_DEPT").name("Xem đơn ứng tuyển ban mình")
                        .module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_CREATE").name("Tạo đơn ứng tuyển").module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_EDIT").name("Sửa đơn ứng tuyển").module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_DELETE").name("Xóa đơn ứng tuyển").module("APPLICATION").build(),
                Permission.builder().code("APPLICATION_CHECKIN").name("Check-in đơn ứng tuyển").module("APPLICATION")
                        .build(),
                Permission.builder().code("APPLICATION_EXPORT").name("Xuất file đơn ứng tuyển").module("APPLICATION")
                        .build(),
                Permission.builder().code("INTERVIEW_CONDUCT").name("Thực hiện phỏng vấn").module("INTERVIEW").build(),
                Permission.builder().code("INTERVIEW_VIEW_QUEUE").name("Xem hàng chờ phỏng vấn").module("INTERVIEW")
                        .build(),
                Permission.builder().code("APPLICATION_REVIEW").name("Xét duyệt đơn").module("REVIEW").build(),
                Permission.builder().code("APPLICATION_CREATE_ACCOUNT").name("Tạo tài khoản từ đơn").module("REVIEW")
                        .build(),
                Permission.builder().code("USER_VIEW").name("Xem thành viên").module("USER").build(),
                Permission.builder().code("USER_EDIT").name("Sửa thành viên").module("USER").build(),
                Permission.builder().code("USER_DELETE").name("Xóa thành viên").module("USER").build(),
                Permission.builder().code("USER_MANAGE_PERMISSIONS").name("Quản lý quyền thành viên").module("USER")
                        .build(),
                Permission.builder().code("GENERATION_MANAGE").name("Quản lý thế hệ").module("GENERATION").build(),
                Permission.builder().code("RECRUITMENT_MANAGE").name("Quản lý đợt tuyển").module("RECRUITMENT").build(),
                Permission.builder().code("COMMON_CODE_MANAGE").name("Quản lý danh mục cấu hình").module("CONFIG")
                        .build());
        permissionRepository.saveAll(permissions);
    }

    private void seedPermissionGroups() {
        if (!permissionGroupRepository.existsByCode("MEMBER")) {
            PermissionGroup memberGroup = PermissionGroup.builder()
                    .code("MEMBER")
                    .name("Thành viên")
                    .description("Thành viên cơ bản trong CLB")
                    .permissions(new HashSet<>())
                    .build();
            permissionGroupRepository.save(memberGroup);
        }

        if (permissionGroupRepository.count() > 1) {
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
                        "APPLICATION_VIEW", "APPLICATION_CREATE", "APPLICATION_EDIT", "APPLICATION_CHECKIN")))
                .build();

        PermissionGroup interviewerGroup = PermissionGroup.builder()
                .code("INTERVIEWER")
                .name("Phỏng vấn viên")
                .description("Nhận đơn từ hàng chờ và phỏng vấn")
                .permissions(getPermissionsByCodes(allPerms, Arrays.asList(
                        "APPLICATION_VIEW_OWN_DEPT", "INTERVIEW_CONDUCT", "INTERVIEW_VIEW_QUEUE")))
                .build();

        PermissionGroup reviewerGroup = PermissionGroup.builder()
                .code("REVIEWER")
                .name("Xét duyệt")
                .description("Xét duyệt đơn sau khi phỏng vấn")
                .permissions(getPermissionsByCodes(allPerms, Arrays.asList(
                        "APPLICATION_VIEW", "APPLICATION_REVIEW", "APPLICATION_CREATE_ACCOUNT", "APPLICATION_EXPORT")))
                .build();

        permissionGroupRepository
                .saveAll(Arrays.asList(adminGroup, receptionistGroup, interviewerGroup, reviewerGroup));
    }

    private void seedDefaultAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            log.info("Seeding default root admin account (admin / admin123)...");
            PermissionGroup adminGroup = permissionGroupRepository.findByCode("ADMIN").orElse(null);
            Set<PermissionGroup> groups = new HashSet<>();
            if (adminGroup != null) {
                groups.add(adminGroup);
            }
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@istar.club")
                    .firstName("Quản trị")
                    .lastName("Viên")
                    .position(Position.PRESIDENT)
                    .isActive(true)
                    .isDeleted(false)
                    .permissionGroups(groups)
                    .build();
            userRepository.save(admin);
            log.info("Default root admin account created successfully.");
        }
    }

    private void seedAdminPermissions() {
        List<User> users = userRepository.findAll();
        PermissionGroup adminGroup = permissionGroupRepository.findByCode("ADMIN").orElse(null);
        PermissionGroup memberGroup = permissionGroupRepository.findByCode("MEMBER").orElse(null);

        for (User user : users) {
            if (user.getPermissionGroups() == null) {
                user.setPermissionGroups(new HashSet<>());
            }
            if ("admin".equalsIgnoreCase(user.getUsername())) {
                if (adminGroup != null && !user.getPermissionGroups().contains(adminGroup)) {
                    user.getPermissionGroups().add(adminGroup);
                    userRepository.save(user);
                    log.info("Assigned ADMIN permission group to user: " + user.getUsername());
                }
            } else {
                if (user.getPermissionGroups().isEmpty() && memberGroup != null) {
                    user.getPermissionGroups().add(memberGroup);
                    userRepository.save(user);
                    log.info("Assigned MEMBER permission group to user: " + user.getUsername());
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

    private void seedCommonCodes() {
        seedSchoolCodes();
        seedCourseCodes();
    }

    private void seedSchoolCodes() {
        log.info("Seeding / updating common codes for SCHOOL...");
        List<CommonCode> targetSchools = Arrays.asList(
                CommonCode.builder().category("SCHOOL").code("CNTT_TT")
                        .name("Trường Công nghệ Thông tin và Truyền thông").orderIndex(1).isActive(true).build(),
                CommonCode.builder().category("SCHOOL").code("CO_KHI_O_TO").name("Trường Cơ khí - Ô tô").orderIndex(2)
                        .isActive(true).build(),
                CommonCode.builder().category("SCHOOL").code("NGOAI_NGU_DU_LICH").name("Trường Ngoại ngữ - Du lịch")
                        .orderIndex(3).isActive(true).build(),
                CommonCode.builder().category("SCHOOL").code("KINH_TE").name("Trường Kinh tế").orderIndex(4)
                        .isActive(true).build(),
                CommonCode.builder().category("SCHOOL").code("DIEN_DIEN_TU").name("Trường Điện - Điện tử").orderIndex(5)
                        .isActive(true).build(),
                CommonCode.builder().category("SCHOOL").code("HOA").name("Khoa Công nghệ Hóa").orderIndex(6)
                        .isActive(true).build(),
                CommonCode.builder().category("SCHOOL").code("MAY_THIET_KE")
                        .name("Khoa Công nghệ May & Thiết kế Thời trang").orderIndex(7).isActive(true).build(),
                CommonCode.builder().category("SCHOOL").code("VIET_NHAT").name("Trung tâm Việt Nhật").orderIndex(8)
                        .isActive(true).build());

        for (CommonCode school : targetSchools) {
            commonCodeRepository.findByCategoryAndCode("SCHOOL", school.getCode()).ifPresentOrElse(
                    existing -> {
                        existing.setName(school.getName());
                        existing.setOrderIndex(school.getOrderIndex());
                        existing.setIsActive(true);
                        commonCodeRepository.save(existing);
                    },
                    () -> commonCodeRepository.save(school));
        }

        // Dọn dẹp mã cũ nếu có
        commonCodeRepository.findByCategoryAndCode("SCHOOL", "CNTT").ifPresent(commonCodeRepository::delete);
    }

    private void seedCourseCodes() {
        log.info("Seeding / updating common codes for COURSE (K12 to K21)...");
        for (int k = 12; k <= 21; k++) {
            String code = "K" + k;
            String name = "Khóa " + k + " (K" + k + ")";
            int orderIndex = k;

            commonCodeRepository.findByCategoryAndCode("COURSE", code).ifPresentOrElse(
                    existing -> {
                        existing.setName(name);
                        existing.setOrderIndex(orderIndex);
                        existing.setIsActive(true);
                        commonCodeRepository.save(existing);
                    },
                    () -> commonCodeRepository.save(CommonCode.builder()
                            .category("COURSE")
                            .code(code)
                            .name(name)
                            .orderIndex(orderIndex)
                            .isActive(true)
                            .build()));
        }
    }

    private void seedGenerations() {
        if (!generationRepository.existsByName("Gen 7")) {
            generationRepository.save(Generation.builder()
                    .name("Gen 7")
                    .yearJoined(2025)
                    .description("Thế hệ thứ 7 của CLB Nghệ thuật iStar")
                    .build());
        }
        if (!generationRepository.existsByName("Gen 8")) {
            generationRepository.save(Generation.builder()
                    .name("Gen 8")
                    .yearJoined(2026)
                    .description("Thế hệ thứ 8 - Đợt tuyển sinh viên mới 2026")
                    .build());
        }
    }

    private void seedLandingConfig() {
        if (landingConfigRepository.findByConfigKey("HOMEPAGE").isEmpty()) {
            log.info("Seeding default homepage landing configuration...");
            landingConfigService.updateHomepageConfig(landingConfigService.getDefaultHomepageConfig(), "system");
        }
    }
}
