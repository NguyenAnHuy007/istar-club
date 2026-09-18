export interface OverviewStats {
  totalApplications: number;
  pendingApplications: number;
  interviewedApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  noShowApplications: number;
  totalMembers: number;
  applicationsToday: number;
  activeCampaignId: number | null;
  activeCampaignTitle: string | null;
  activeCampaignStartDate: string | null;
  activeCampaignEndDate: string | null;
  activeCampaignIsActive: boolean;
}

export interface StatusBreakdownItem {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DepartmentStatItem {
  department: string;
  name: string;
  total: number;
  interviewed: number;
  approved: number;
  rejected: number;
  avgScore: string;
  percentage: number;
}

export interface DailyTrendItem {
  date: string;
  fullDate: string;
  count: number;
  approvedCount: number;
}

export interface SchoolStatItem {
  school: string;
  count: number;
  percentage: number;
}

export interface CourseDistributionItem {
  course: string;
  count: number;
}

export interface DashboardStats {
  overview: OverviewStats;
  statusBreakdown: StatusBreakdownItem[];
  departmentStats: DepartmentStatItem[];
  dailyTrend: DailyTrendItem[];
  schoolRankings: SchoolStatItem[];
  courseDistribution: CourseDistributionItem[];
}
