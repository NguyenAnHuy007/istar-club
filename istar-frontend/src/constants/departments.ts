import { DepartmentInfo } from "@/types/application";
import { Department } from "@/types/user";

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    value: "MUSIC",
    label: "Ban Âm nhạc",
    shortDesc: "Thanh nhạc, nhạc cụ và biểu diễn sân khấu",
  },
  {
    value: "RAP",
    label: "Ban Rap",
    shortDesc: "Sáng tác rap, lyric, freestyle và trình diễn",
  },
  {
    value: "DANCE",
    label: "Ban Vũ đạo",
    shortDesc: "K-pop, hip-hop, contemporary và biên đạo",
  },
  {
    value: "MEDIA_AND_EVENT",
    label: "Ban Truyền thông và Tổ chức sự kiện",
    shortDesc: "Thiết kế, quay chụp, nội dung và tổ chức sự kiện",
  },
];

/**
 * Standard 4 core departments list with code & name.
 * Single Source of Truth across admin lists, tabs, and filters.
 */
export const DEPARTMENTS_LIST: { code: Department; name: string }[] = [
  { code: Department.MUSIC, name: "Ban Âm nhạc" },
  { code: Department.RAP, name: "Ban Rap" },
  { code: Department.DANCE, name: "Ban Vũ đạo" },
  { code: Department.MEDIA_AND_EVENT, name: "Ban TT&TCSK" },
];

/**
 * Key-value mapping for quick display name lookup by Department code or string.
 */
export const DEPARTMENT_LABELS: Record<string, string> = {
  [Department.MUSIC]: "Ban Âm nhạc",
  [Department.RAP]: "Ban Rap",
  [Department.DANCE]: "Ban Vũ đạo",
  [Department.MEDIA_AND_EVENT]: "Ban TT&TCSK",
};

/**
 * Helper to get readable department name.
 */
export function getDepartmentName(dept?: Department | string | null): string {
  if (!dept) return "Chưa phân ban";
  return DEPARTMENT_LABELS[dept] || dept;
}
