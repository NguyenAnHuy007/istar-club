export interface RecruitmentDto {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRecruitmentRequest {
  name: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  description?: string;
}
