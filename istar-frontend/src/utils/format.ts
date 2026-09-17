import { SCHOOL_CODE_MAP } from "@/constants/schools";

/**
 * Maps school code abbreviation (e.g. CNTT_TT, HOA) to human-readable Vietnamese name.
 * Falls back to original string or "Chưa cập nhật" if falsy.
 */
export function formatSchoolName(school?: string | null): string {
  if (!school) return "Chưa cập nhật";
  const trimmed = school.trim();
  return SCHOOL_CODE_MAP[trimmed] || trimmed;
}

/**
 * Formats an ISO date or date string into DD/MM/YYYY.
 */
export function formatDateVN(dateStr?: string | null): string {
  if (!dateStr) return "Chưa cập nhật";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats an ISO datetime string into HH:mm DD/MM/YYYY.
 */
export function formatDateTimeVN(dateStr?: string | null): string {
  if (!dateStr) return "Chưa cập nhật";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Safely parses and bounds interview score to [0.0, 10.0].
 */
export function clampInterviewScore(score: number): number {
  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
}
