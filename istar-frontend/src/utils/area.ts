import { Area } from "@/types/user";

export const STORAGE_KEY_INTERVIEW_AREA = "istar_interview_area";

/**
 * Retrieves the currently selected Area from sessionStorage.
 * Defaults to null if not set or outside browser environment.
 */
export function getStoredArea(): Area | null {
  if (typeof window === "undefined") return null;
  const saved = sessionStorage.getItem(STORAGE_KEY_INTERVIEW_AREA);
  if (saved === Area.NINH_BINH || saved === Area.HANOI) {
    return saved as Area;
  }
  return null;
}

/**
 * Stores the chosen Area into sessionStorage.
 */
export function setStoredArea(area: Area): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY_INTERVIEW_AREA, area);
}

/**
 * Removes the stored Area from sessionStorage.
 */
export function removeStoredArea(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY_INTERVIEW_AREA);
}

/**
 * Formats the area enum to standard display label.
 */
export function formatAreaName(area?: Area | null): string {
  if (area === Area.HANOI) return "Cơ sở 1 (Hà Nội)";
  if (area === Area.NINH_BINH) return "Cơ sở 3 (Ninh Bình)";
  return "Chưa xác định";
}
