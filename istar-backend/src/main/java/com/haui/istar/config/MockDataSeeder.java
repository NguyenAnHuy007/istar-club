package com.haui.istar.config;

import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.PermissionGroup;
import com.haui.istar.model.Recruitment;
import com.haui.istar.model.User;
import com.haui.istar.model.UserDepartment;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Area;
import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.repository.PermissionGroupRepository;
import com.haui.istar.repository.RecruitmentRepository;
import com.haui.istar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

/**
 * MockDataSeeder — Dữ liệu người dùng & đơn ứng tuyển mẫu phục vụ phát triển/kiểm thử.
 * Tạo các tài khoản nhân sự mẫu (Lễ tân, 4 Trưởng ban, Xét duyệt viên), 2 đợt tuyển và 12 hồ sơ ứng tuyển 7 trạng thái.
 * KHI ĐẨY LÊN PRODUCTION: Bạn có thể xóa file này đi hoặc cấu hình @Profile("!prod") để không tạo dữ liệu mẫu.
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class MockDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final RecruitmentRepository recruitmentRepository;
    private final ApplicationRepository applicationRepository;
    @Lazy
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedStaffUsers();
        seedRecruitmentsAndApplications();
    }

    private void seedStaffUsers() {
        PermissionGroup receptionistGroup = permissionGroupRepository.findByCode("RECEPTIONIST").orElse(null);
        PermissionGroup interviewerGroup = permissionGroupRepository.findByCode("INTERVIEWER").orElse(null);
        PermissionGroup reviewerGroup = permissionGroupRepository.findByCode("REVIEWER").orElse(null);

        // Lễ tân
        if (!userRepository.existsByUsername("receptionist")) {
            User receptionist = User.builder()
                    .username("receptionist")
                    .password(passwordEncoder.encode("password123"))
                    .email("receptionist@istar.club")
                    .firstName("Thu")
                    .lastName("Trần Thị")
                    .school("NGOAI_NGU_DU_LICH")
                    .majorClass("NNA01")
                    .course("K17")
                    .position(Position.MEMBER)
                    .area(Area.HANOI)
                    .isActive(true)
                    .isDeleted(false)
                    .permissionGroups(receptionistGroup != null ? new HashSet<>(Collections.singletonList(receptionistGroup)) : new HashSet<>())
                    .build();
            userRepository.save(receptionist);
            log.info("Created staff user: receptionist / password123");
        }

        // Interviewer Ban Âm nhạc
        createInterviewerIfNotExist("interviewer_music", "music.lead@istar.club", "Nam", "Vũ Hải",
                Department.MUSIC, "CNTT_TT", "KTPM01", "K16", interviewerGroup);

        // Interviewer Ban Vũ đạo
        createInterviewerIfNotExist("interviewer_dance", "dance.lead@istar.club", "Linh", "Nguyễn Thùy",
                Department.DANCE, "KINH_TE", "QTKD01", "K16", interviewerGroup);

        // Interviewer Ban Rap
        createInterviewerIfNotExist("interviewer_rap", "rap.lead@istar.club", "Hoàng", "Lê Minh",
                Department.RAP, "CO_KHI_O_TO", "CK01", "K16", interviewerGroup);

        // Interviewer Ban TT & TCSK
        createInterviewerIfNotExist("interviewer_media", "media.lead@istar.club", "Phương", "Đặng Mai",
                Department.MEDIA_AND_EVENT, "MAY_THIET_KE", "TKTT01", "K16", interviewerGroup);

        // Xét duyệt viên
        if (!userRepository.existsByUsername("reviewer")) {
            User reviewer = User.builder()
                    .username("reviewer")
                    .password(passwordEncoder.encode("password123"))
                    .email("reviewer@istar.club")
                    .firstName("Đức")
                    .lastName("Phạm Minh")
                    .school("DIEN_DIEN_TU")
                    .majorClass("DDT01")
                    .course("K15")
                    .position(Position.VICE_PRESIDENT)
                    .area(Area.HANOI)
                    .isActive(true)
                    .isDeleted(false)
                    .permissionGroups(reviewerGroup != null ? new HashSet<>(Collections.singletonList(reviewerGroup)) : new HashSet<>())
                    .build();
            userRepository.save(reviewer);
            log.info("Created staff user: reviewer / password123");
        }
    }

    private void createInterviewerIfNotExist(String username, String email, String firstName, String lastName,
                                             Department dept, String school, String majorClass, String course,
                                             PermissionGroup group) {
        if (!userRepository.existsByUsername(username)) {
            User user = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode("password123"))
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .school(school)
                    .majorClass(majorClass)
                    .course(course)
                    .position(Position.MEMBER)
                    .area(Area.HANOI)
                    .isActive(true)
                    .isDeleted(false)
                    .permissionGroups(group != null ? new HashSet<>(Collections.singletonList(group)) : new HashSet<>())
                    .build();

            UserDepartment ud = UserDepartment.builder()
                    .user(user)
                    .department(dept)
                    .position(Position.DEPARTMENT_HEAD)
                    .build();
            user.getUserDepartments().add(ud);

            userRepository.save(user);
            log.info("Created interviewer user: {} / password123 (Dept: {})", username, dept);
        }
    }

    private void seedRecruitmentsAndApplications() {
        if (recruitmentRepository.count() > 0) {
            return;
        }
        log.info("Seeding recruitment campaigns and candidate applications...");

        // 1. Đợt tuyển cũ Gen 7 (đã kết thúc)
        Recruitment gen7 = Recruitment.builder()
                .name("Tuyển thành viên Gen 7 - Khởi Đầu Đam Mê (2025)")
                .startDate(LocalDate.of(2025, 9, 1))
                .endDate(LocalDate.of(2025, 10, 1))
                .isActive(false)
                .isDeleted(false)
                .build();
        recruitmentRepository.save(gen7);

        // 2. Đợt tuyển hiện tại Gen 8 (Active)
        Recruitment gen8 = Recruitment.builder()
                .name("Tuyển thành viên Gen 8 - Tỏa Sáng Cùng iStar (Kỳ Tuyển Mùa Thu 2026)")
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 10, 15))
                .isActive(true)
                .isDeleted(false)
                .build();
        gen8 = recruitmentRepository.save(gen8);

        // Lấy các interviewer
        User intMusic = userRepository.findByUsername("interviewer_music").orElse(null);
        User intDance = userRepository.findByUsername("interviewer_dance").orElse(null);
        User intRap = userRepository.findByUsername("interviewer_rap").orElse(null);
        User intMedia = userRepository.findByUsername("interviewer_media").orElse(null);

        List<Application> apps = new ArrayList<>();

        // 1. SUBMITTED: Đỗ Phương Thảo (Ban Âm nhạc)
        Application app1 = Application.builder()
                .email("phuongthao.do@gmail.com")
                .firstName("Thảo")
                .lastName("Đỗ Phương")
                .birthday(LocalDate.of(2005, 4, 15))
                .address("Cầu Giấy, Hà Nội")
                .phoneNumber("0981123456")
                .school("CNTT_TT")
                .majorClass("KHMT01")
                .course("K19")
                .recruitment(gen8)
                .knowIStar("Qua fanpage Facebook của CLB và ngày hội HaUI Club Day.")
                .reasonIStarer("Muốn được hát, biểu diễn cùng các bạn và phát triển kỹ năng thanh nhạc.")
                .facebookUrl("https://facebook.com/phuongthao.do")
                .status(ApplicationStatus.SUBMITTED)
                .area(Area.NINH_BINH)
                .isDeleted(false)
                .build();
        app1.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app1)
                .department(Department.MUSIC)
                .status(ApplicationStatus.SUBMITTED)
                .build());
        apps.add(app1);

        // 2. SUBMITTED: Hoàng Văn Tuấn (Đa ban: Rap & TT&TCSK)
        Application app2 = Application.builder()
                .email("tuanhv.rap@gmail.com")
                .firstName("Tuấn")
                .lastName("Hoàng Văn")
                .birthday(LocalDate.of(2004, 8, 22))
                .address("Bắc Từ Liêm, Hà Nội")
                .phoneNumber("0972233445")
                .school("CO_KHI_O_TO")
                .majorClass("CK02")
                .course("K18")
                .recruitment(gen8)
                .knowIStar("Được anh chị khóa trên trong khoa Cơ khí giới thiệu.")
                .reasonIStarer("Đam mê rap melody và muốn học hỏi thêm mảng truyền thông sự kiện.")
                .facebookUrl("https://facebook.com/tuanhv.rap")
                .status(ApplicationStatus.SUBMITTED)
                .area(Area.NINH_BINH)
                .isDeleted(false)
                .build();
        app2.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app2)
                .department(Department.RAP)
                .status(ApplicationStatus.SUBMITTED)
                .build());
        app2.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app2)
                .department(Department.MEDIA_AND_EVENT)
                .status(ApplicationStatus.SUBMITTED)
                .build());
        apps.add(app2);

        // 3. CHECKED_IN: Bùi Yến Nhi (Ban Vũ đạo)
        Application app3 = Application.builder()
                .email("yennhi.bui@gmail.com")
                .firstName("Nhi")
                .lastName("Bùi Yến")
                .birthday(LocalDate.of(2005, 11, 3))
                .address("Nam Từ Liêm, Hà Nội")
                .phoneNumber("0963344556")
                .school("NGOAI_NGU_DU_LICH")
                .majorClass("NNA02")
                .course("K19")
                .recruitment(gen8)
                .knowIStar("Xem video vũ đạo bùng nổ của iStar trên TikTok.")
                .reasonIStarer("Muốn tham gia đội hình vũ đạo biểu diễn các sân khấu lớn của trường.")
                .facebookUrl("https://facebook.com/yennhi.bui")
                .status(ApplicationStatus.CHECKED_IN)
                .checkedInAt(LocalDateTime.now().minusHours(2))
                .area(Area.HANOI)
                .isDeleted(false)
                .build();
        app3.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app3)
                .department(Department.DANCE)
                .status(ApplicationStatus.CHECKED_IN)
                .build());
        apps.add(app3);

        // 4. CHECKED_IN: Phạm Quốc Huy (Đa ban: Âm nhạc & Rap)
        Application app4 = Application.builder()
                .email("quochuy.pham@gmail.com")
                .firstName("Huy")
                .lastName("Phạm Quốc")
                .birthday(LocalDate.of(2005, 2, 18))
                .address("Hoài Đức, Hà Nội")
                .phoneNumber("0914455667")
                .school("DIEN_DIEN_TU")
                .majorClass("DDT01")
                .course("K19")
                .recruitment(gen8)
                .knowIStar("Thấy CLB biểu diễn tại đêm nhạc Chào Tân sinh viên.")
                .reasonIStarer("Thích sáng tác và muốn kết hợp hát cùng rap trong các sản phẩm của CLB.")
                .facebookUrl("https://facebook.com/quochuy.pham")
                .status(ApplicationStatus.CHECKED_IN)
                .checkedInAt(LocalDateTime.now().minusHours(1).minusMinutes(30))
                .area(Area.HANOI)
                .isDeleted(false)
                .build();
        app4.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app4)
                .department(Department.MUSIC)
                .status(ApplicationStatus.CHECKED_IN)
                .build());
        app4.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app4)
                .department(Department.RAP)
                .status(ApplicationStatus.CHECKED_IN)
                .build());
        apps.add(app4);

        // 5. INTERVIEWING: Lê Diệu Linh (Đang được Ban Vũ đạo PV)
        Application app5 = Application.builder()
                .email("dieulinh.le@gmail.com")
                .firstName("Linh")
                .lastName("Lê Diệu")
                .birthday(LocalDate.of(2005, 7, 9))
                .address("Tây Hồ, Hà Nội")
                .phoneNumber("0985566778")
                .school("KINH_TE")
                .majorClass("QTKD03")
                .course("K19")
                .recruitment(gen8)
                .knowIStar("Theo dõi kênh Instagram và Youtube của CLB.")
                .reasonIStarer("Muốn rèn luyện khả năng biên đạo và làm việc trong môi trường năng động.")
                .facebookUrl("https://facebook.com/dieulinh.le")
                .status(ApplicationStatus.INTERVIEWING)
                .checkedInAt(LocalDateTime.now().minusHours(2).minusMinutes(15))
                .area(Area.NINH_BINH)
                .isDeleted(false)
                .build();
        app5.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app5)
                .department(Department.DANCE)
                .status(ApplicationStatus.INTERVIEWING)
                .interviewer(intDance)
                .build());
        apps.add(app5);

        // 6. INTERVIEWING: Trương Công Định (Đa ban: Rap đã PV xong 8.0, Âm nhạc đang PV)
        Application app6 = Application.builder()
                .email("congdinh.truong@gmail.com")
                .firstName("Định")
                .lastName("Trương Công")
                .birthday(LocalDate.of(2004, 5, 30))
                .address("Thanh Xuân, Hà Nội")
                .phoneNumber("0936677889")
                .school("CNTT_TT")
                .majorClass("CNTT02")
                .course("K18")
                .recruitment(gen8)
                .knowIStar("Bạn cùng lớp rủ nộp đơn.")
                .reasonIStarer("Muốn thử sức ở cả 2 ban để tìm ra đam mê lớn nhất.")
                .facebookUrl("https://facebook.com/congdinh.truong")
                .status(ApplicationStatus.INTERVIEWING)
                .checkedInAt(LocalDateTime.now().minusHours(1).minusMinutes(45))
                .area(Area.NINH_BINH)
                .isDeleted(false)
                .build();
        app6.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app6)
                .department(Department.RAP)
                .status(ApplicationStatus.INTERVIEWED)
                .interviewScore(8.0)
                .interviewNotes("Flow tốt, nhịp chắc, bài test rap sáng tạo có cá tính riêng.")
                .interviewer(intRap)
                .build());
        app6.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app6)
                .department(Department.MUSIC)
                .status(ApplicationStatus.INTERVIEWING)
                .interviewer(intMusic)
                .build());
        apps.add(app6);

        // 7. INTERVIEWED: Trần Mai Anh (Ban TT & TCSK)
        Application app7 = Application.builder()
                .email("maianh.tran@gmail.com")
                .firstName("Anh")
                .lastName("Trần Mai")
                .birthday(LocalDate.of(2005, 9, 12))
                .address("Đống Đa, Hà Nội")
                .phoneNumber("0947788990")
                .school("MAY_THIET_KE")
                .majorClass("TKTT01")
                .course("K19")
                .recruitment(gen8)
                .knowIStar("Xem các ấn phẩm truyền thông sự kiện của iStar trên Fanpage.")
                .reasonIStarer("Muốn đóng góp thiết kế poster, quản lý fanpage và tổ chức show diễn.")
                .facebookUrl("https://facebook.com/maianh.tran")
                .status(ApplicationStatus.INTERVIEWED)
                .checkedInAt(LocalDateTime.now().minusHours(4))
                .interviewedAt(LocalDateTime.now().minusHours(3))
                .area(Area.HANOI)
                .isDeleted(false)
                .build();
        app7.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app7)
                .department(Department.MEDIA_AND_EVENT)
                .status(ApplicationStatus.INTERVIEWED)
                .interviewScore(9.2)
                .interviewNotes("Kỹ năng thiết kế Canva/Photoshop rất vững, tư duy truyền thông sắc bén, tự tin.")
                .interviewer(intMedia)
                .build());
        apps.add(app7);

        // 8. INTERVIEWED: Nguyễn Văn Hưng (Đa ban: Âm nhạc & Vũ đạo đều đã PV xong)
        Application app8 = Application.builder()
                .email("vanhung.nguyen@gmail.com")
                .firstName("Hưng")
                .lastName("Nguyễn Văn")
                .birthday(LocalDate.of(2004, 3, 25))
                .address("Bắc Từ Liêm, Hà Nội")
                .phoneNumber("0928899001")
                .school("CNTT_TT")
                .majorClass("KTPM02")
                .course("K18")
                .recruitment(gen8)
                .knowIStar("Tham gia buổi Workshop âm nhạc của iStar.")
                .reasonIStarer("Vừa muốn hát vừa muốn nâng cao kỹ năng nhảy sân khấu.")
                .facebookUrl("https://facebook.com/vanhung.nguyen")
                .status(ApplicationStatus.INTERVIEWED)
                .checkedInAt(LocalDateTime.now().minusHours(3).minusMinutes(30))
                .interviewedAt(LocalDateTime.now().minusHours(2).minusMinutes(40))
                .area(Area.HANOI)
                .isDeleted(false)
                .build();
        app8.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app8)
                .department(Department.MUSIC)
                .status(ApplicationStatus.INTERVIEWED)
                .interviewScore(8.5)
                .interviewNotes("Giọng nam cao ấm, xử lý bài hát tinh tế, nhạc cảm tốt.")
                .interviewer(intMusic)
                .build());
        app8.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app8)
                .department(Department.DANCE)
                .status(ApplicationStatus.INTERVIEWED)
                .interviewScore(8.0)
                .interviewNotes("Cơ thể dẻo, bắt nhịp nhảy nhanh, có kinh nghiệm diễn nhóm.")
                .interviewer(intDance)
                .build());
        apps.add(app8);

        // 9. APPROVED: Vũ Ngọc Ánh (Ban Vũ đạo)
        Application app9 = Application.builder()
                .email("ngocanh.vu@gmail.com")
                .firstName("Ánh")
                .lastName("Vũ Ngọc")
                .birthday(LocalDate.of(2004, 6, 14))
                .address("Hà Đông, Hà Nội")
                .phoneNumber("0909900112")
                .school("NGOAI_NGU_DU_LICH")
                .majorClass("DL01")
                .course("K18")
                .recruitment(gen8)
                .knowIStar("Biết tới iStar qua các giải đấu vũ đạo sinh viên toàn quốc.")
                .reasonIStarer("Muốn cống hiến hết mình cho các giải đấu và chương trình nghệ thuật của trường.")
                .facebookUrl("https://facebook.com/ngocanh.vu")
                .status(ApplicationStatus.APPROVED)
                .checkedInAt(LocalDateTime.now().minusDays(1))
                .interviewedAt(LocalDateTime.now().minusDays(1).plusMinutes(40))
                .area(Area.NINH_BINH)
                .isDeleted(false)
                .build();
        app9.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app9)
                .department(Department.DANCE)
                .status(ApplicationStatus.APPROVED)
                .interviewScore(9.5)
                .interviewNotes("Từng đạt giải nhì cuộc thi nhảy trẻ, phong thái cuốn hút, kỹ thuật điêu luyện.")
                .interviewer(intDance)
                .build());
        apps.add(app9);

        // 10. APPROVED: Nguyễn Thành Đạt (Ban Âm nhạc)
        Application app10 = Application.builder()
                .email("thanhdat.nguyen@gmail.com")
                .firstName("Đạt")
                .lastName("Nguyễn Thành")
                .birthday(LocalDate.of(2005, 1, 10))
                .address("Cầu Giấy, Hà Nội")
                .phoneNumber("0982211334")
                .school("VIET_NHAT")
                .majorClass("VJ01")
                .course("K19")
                .recruitment(gen8)
                .knowIStar("Được thành viên Gen 6 iStar giới thiệu.")
                .reasonIStarer("Chơi guitar acoustic và muốn đệm đàn cũng như hát trong ban nhạc.")
                .facebookUrl("https://facebook.com/thanhdat.nguyen")
                .status(ApplicationStatus.APPROVED)
                .checkedInAt(LocalDateTime.now().minusDays(1))
                .interviewedAt(LocalDateTime.now().minusDays(1).plusMinutes(35))
                .area(Area.HANOI)
                .isDeleted(false)
                .build();
        app10.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app10)
                .department(Department.MUSIC)
                .status(ApplicationStatus.APPROVED)
                .interviewScore(9.0)
                .interviewNotes("Chơi guitar xuất sắc, tai nghe nốt chuẩn, hòa âm phối khí sáng tạo.")
                .interviewer(intMusic)
                .build());
        apps.add(app10);

        // 11. REJECTED: Lê Quang Minh (Ban Rap)
        Application app11 = Application.builder()
                .email("quangminh.le@gmail.com")
                .firstName("Minh")
                .lastName("Lê Quang")
                .birthday(LocalDate.of(2005, 12, 1))
                .address("Hoàng Mai, Hà Nội")
                .phoneNumber("0973322115")
                .school("HOA")
                .majorClass("KTHH01")
                .course("K19")
                .recruitment(gen8)
                .knowIStar("Tình cờ thấy poster tuyển thành viên.")
                .reasonIStarer("Muốn thử sức với bộ môn rap.")
                .facebookUrl("https://facebook.com/quangminh.le")
                .status(ApplicationStatus.REJECTED)
                .checkedInAt(LocalDateTime.now().minusDays(1))
                .interviewedAt(LocalDateTime.now().minusDays(1).plusMinutes(20))
                .area(Area.NINH_BINH)
                .isDeleted(false)
                .build();
        app11.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app11)
                .department(Department.RAP)
                .status(ApplicationStatus.REJECTED)
                .interviewScore(4.5)
                .interviewNotes("Lạc nhịp nhiều khi rap trên beat, chưa chuẩn bị kỹ bài test, kỹ năng chưa đạt yêu cầu.")
                .interviewer(intRap)
                .build());
        apps.add(app11);

        // 12. NO_SHOW: Hoàng Thục Trinh (Ban TT & TCSK)
        Application app12 = Application.builder()
                .email("thuctrinh.hoang@gmail.com")
                .firstName("Trinh")
                .lastName("Hoàng Thục")
                .birthday(LocalDate.of(2005, 8, 19))
                .address("Hai Bà Trưng, Hà Nội")
                .phoneNumber("0964433221")
                .school("KINH_TE")
                .majorClass("KT01")
                .course("K19")
                .recruitment(gen8)
                .knowIStar("Theo dõi qua TikTok của CLB.")
                .reasonIStarer("Muốn tham gia ban Sự kiện.")
                .facebookUrl("https://facebook.com/thuctrinh.hoang")
                .status(ApplicationStatus.NO_SHOW)
                .area(Area.NINH_BINH)
                .isDeleted(false)
                .build();
        app12.getApplicationDepartments().add(ApplicationDepartment.builder()
                .application(app12)
                .department(Department.MEDIA_AND_EVENT)
                .status(ApplicationStatus.NO_SHOW)
                .build());
        apps.add(app12);

        applicationRepository.saveAll(apps);
        log.info("Successfully seeded 2 recruitments and 12 candidate applications across all departments and statuses!");
    }
}
