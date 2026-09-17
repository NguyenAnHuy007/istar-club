package com.haui.istar.service.impl;

import com.haui.istar.dto.dashboard.DashboardStatsDto;
import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.Recruitment;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Department;
import com.haui.istar.repository.ApplicationRepository;
import com.haui.istar.repository.RecruitmentRepository;
import com.haui.istar.repository.UserRepository;
import com.haui.istar.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final ApplicationRepository applicationRepository;
    private final RecruitmentRepository recruitmentRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM");
    private static final DateTimeFormatter FULL_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats(Long recruitmentId) {
        // 1. Xác định đợt tuyển
        Recruitment recruitment = null;
        if (recruitmentId != null) {
            recruitment = recruitmentRepository.findByIdAndIsDeletedFalse(recruitmentId).orElse(null);
        }
        if (recruitment == null) {
            recruitment = recruitmentRepository.findByIsActiveTrueAndIsDeletedFalse().orElse(null);
        }

        // 2. Lấy danh sách đơn ứng tuyển phù hợp
        List<Application> applications;
        if (recruitment != null) {
            applications = applicationRepository.findByRecruitmentIdAndIsDeletedFalse(recruitment.getId());
        } else {
            applications = applicationRepository.findByIsDeletedFalse();
        }

        long totalApps = applications.size();
        LocalDate today = LocalDate.now();

        // 3. Tính toán Overview Metrics
        long pendingCount = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.SUBMITTED
                        || a.getStatus() == ApplicationStatus.CHECKED_IN
                        || a.getStatus() == ApplicationStatus.INTERVIEWING)
                .count();

        long interviewedCount = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.INTERVIEWED)
                .count();

        long approvedCount = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.APPROVED)
                .count();

        long rejectedCount = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.REJECTED)
                .count();

        long noShowCount = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.NO_SHOW)
                .count();

        long todayApps = applications.stream()
                .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().toLocalDate().isEqual(today))
                .count();

        long totalMembers = userRepository.count();

        DashboardStatsDto.OverviewStats overview = DashboardStatsDto.OverviewStats.builder()
                .totalApplications(totalApps)
                .pendingApplications(pendingCount)
                .interviewedApplications(interviewedCount)
                .approvedApplications(approvedCount)
                .rejectedApplications(rejectedCount)
                .noShowApplications(noShowCount)
                .totalMembers(totalMembers)
                .applicationsToday(todayApps)
                .activeCampaignId(recruitment != null ? recruitment.getId() : null)
                .activeCampaignTitle(recruitment != null ? recruitment.getName() : null)
                .activeCampaignStartDate(recruitment != null && recruitment.getStartDate() != null ? recruitment.getStartDate().toString() : null)
                .activeCampaignEndDate(recruitment != null && recruitment.getEndDate() != null ? recruitment.getEndDate().toString() : null)
                .activeCampaignIsActive(recruitment != null ? recruitment.getIsActive() : false)
                .build();

        // 4. Phân bổ Trạng thái (Status Breakdown)
        List<DashboardStatsDto.StatusBreakdownItem> statusBreakdown = new ArrayList<>();
        addStatusItem(statusBreakdown, ApplicationStatus.SUBMITTED, "Đã nộp đơn", "#3b82f6", applications, totalApps);
        addStatusItem(statusBreakdown, ApplicationStatus.CHECKED_IN, "Chờ phỏng vấn", "#f59e0b", applications, totalApps);
        addStatusItem(statusBreakdown, ApplicationStatus.INTERVIEWING, "Đang phỏng vấn", "#a855f7", applications, totalApps);
        addStatusItem(statusBreakdown, ApplicationStatus.INTERVIEWED, "Đã phỏng vấn", "#06b6d4", applications, totalApps);
        addStatusItem(statusBreakdown, ApplicationStatus.APPROVED, "Trúng tuyển", "#10b981", applications, totalApps);
        addStatusItem(statusBreakdown, ApplicationStatus.REJECTED, "Từ chối", "#f43f5e", applications, totalApps);
        addStatusItem(statusBreakdown, ApplicationStatus.NO_SHOW, "Vắng mặt", "#71717a", applications, totalApps);

        // 5. Thống kê theo Ban (Department Stats)
        Map<Department, String> deptNames = Map.of(
                Department.MUSIC, "Ban Âm nhạc",
                Department.RAP, "Ban Rap",
                Department.MEDIA_AND_EVENT, "Ban TT&TCSK",
                Department.DANCE, "Ban Vũ đạo"
        );

        List<DashboardStatsDto.DepartmentStatItem> departmentStats = new ArrayList<>();
        for (Department dept : Department.values()) {
            List<Application> deptApps = applications.stream()
                    .filter(a -> a.getApplicationDepartments() != null &&
                            a.getApplicationDepartments().stream().anyMatch(ad -> ad.getDepartment() == dept))
                    .toList();

            long totalDept = deptApps.size();
            long interviewedDept = deptApps.stream()
                    .filter(a -> a.getApplicationDepartments().stream()
                            .anyMatch(ad -> ad.getDepartment() == dept && ad.getStatus() == ApplicationStatus.INTERVIEWED))
                    .count();

            long approvedDept = deptApps.stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.APPROVED)
                    .count();

            long rejectedDept = deptApps.stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.REJECTED)
                    .count();

            // Điểm trung bình ban
            List<Double> scores = deptApps.stream()
                    .flatMap(a -> a.getApplicationDepartments().stream())
                    .filter(ad -> ad.getDepartment() == dept && ad.getInterviewScore() != null)
                    .map(ApplicationDepartment::getInterviewScore)
                    .toList();

            String avgScore = "—";
            if (!scores.isEmpty()) {
                double avg = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                avgScore = String.format(Locale.US, "%.1f", avg);
            }

            double percent = totalApps > 0 ? Math.round((double) totalDept / totalApps * 1000.0) / 10.0 : 0.0;

            departmentStats.add(DashboardStatsDto.DepartmentStatItem.builder()
                    .department(dept.name())
                    .name(deptNames.getOrDefault(dept, dept.name()))
                    .total(totalDept)
                    .interviewed(interviewedDept)
                    .approved(approvedDept)
                    .rejected(rejectedDept)
                    .avgScore(avgScore)
                    .percentage(percent)
                    .build());
        }

        // 6. Xu hướng nộp đơn (Daily Trend - 7 ngày gần nhất)
        List<DashboardStatsDto.DailyTrendItem> dailyTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long count = applications.stream()
                    .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().toLocalDate().isEqual(d))
                    .count();
            long approvedOnDay = applications.stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.APPROVED &&
                            a.getUpdatedAt() != null && a.getUpdatedAt().toLocalDate().isEqual(d))
                    .count();

            dailyTrend.add(DashboardStatsDto.DailyTrendItem.builder()
                    .date(d.format(DATE_FORMATTER))
                    .fullDate(d.format(FULL_DATE_FORMATTER))
                    .count(count)
                    .approvedCount(approvedOnDay)
                    .build());
        }

        // 7. Xếp hạng Trường/Khoa HaUI
        Map<String, Long> schoolCounts = applications.stream()
                .map(a -> (a.getSchool() != null && !a.getSchool().isBlank()) ? a.getSchool().trim() : "Chưa cập nhật")
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));

        List<DashboardStatsDto.SchoolStatItem> schoolRankings = schoolCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(6)
                .map(entry -> {
                    double pct = totalApps > 0 ? Math.round((double) entry.getValue() / totalApps * 1000.0) / 10.0 : 0.0;
                    return DashboardStatsDto.SchoolStatItem.builder()
                            .school(entry.getKey())
                            .count(entry.getValue())
                            .percentage(pct)
                            .build();
                })
                .toList();

        // 8. Phân bổ Khóa sinh viên
        Map<String, Long> courseCounts = applications.stream()
                .map(a -> (a.getCourse() != null && !a.getCourse().isBlank()) ? a.getCourse().trim().toUpperCase() : "Khác")
                .collect(Collectors.groupingBy(c -> c, Collectors.counting()));

        List<DashboardStatsDto.CourseDistributionItem> courseDistribution = courseCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(6)
                .map(entry -> DashboardStatsDto.CourseDistributionItem.builder()
                        .course(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .toList();

        return DashboardStatsDto.builder()
                .overview(overview)
                .statusBreakdown(statusBreakdown)
                .departmentStats(departmentStats)
                .dailyTrend(dailyTrend)
                .schoolRankings(schoolRankings)
                .courseDistribution(courseDistribution)
                .build();
    }

    private void addStatusItem(List<DashboardStatsDto.StatusBreakdownItem> list,
                               ApplicationStatus status,
                               String label,
                               String color,
                               List<Application> apps,
                               long total) {
        long count = apps.stream().filter(a -> a.getStatus() == status).count();
        double pct = total > 0 ? Math.round((double) count / total * 1000.0) / 10.0 : 0.0;
        list.add(DashboardStatsDto.StatusBreakdownItem.builder()
                .status(status.name())
                .label(label)
                .count(count)
                .percentage(pct)
                .color(color)
                .build());
    }
}
