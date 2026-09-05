export type DepartmentCode = "MUSIC" | "RAP" | "DANCE" | "MEDIA_AND_EVENT";

export interface DepartmentInfo {
  value: DepartmentCode;
  label: string;
  shortDesc: string;
}

export interface ApplicationFormData {
  email: string;
  firstName: string;
  lastName: string;
  birthday: string;
  phoneNumber: string;
  address: string;
  school: string;
  majorClass: string;
  course: string;
  departments: DepartmentCode[];
  knowIStar: string;
  reasonIStarer: string;
  avatarFile: File | null;
}
