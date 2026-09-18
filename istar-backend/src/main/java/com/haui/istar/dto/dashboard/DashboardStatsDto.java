package com.haui.istar.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {

    private OverviewStats overview;
    private List<StatusBreakdownItem> statusBreakdown;
    private List<DepartmentStatItem> departmentStats;
    private List<DailyTrendItem> dailyTrend;
    private List<SchoolStatItem> schoolRankings;
    private List<CourseDistributionItem> courseDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewStats {
        private long totalApplications;
        private long pendingApplications;
        private long interviewedApplications;
        private long approvedApplications;
        private long rejectedApplications;
        private long noShowApplications;
        private long totalMembers;
        private long applicationsToday;
        private Long activeCampaignId;
        private String activeCampaignTitle;
        private String activeCampaignStartDate;
        private String activeCampaignEndDate;
        private Boolean activeCampaignIsActive;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusBreakdownItem {
        private String status;
        private String label;
        private long count;
        private double percentage;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentStatItem {
        private String department;
        private String name;
        private long total;
        private long interviewed;
        private long approved;
        private long rejected;
        private String avgScore;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyTrendItem {
        private String date;
        private String fullDate;
        private long count;
        private long approvedCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SchoolStatItem {
        private String school;
        private long count;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseDistributionItem {
        private String course;
        private long count;
    }
}
