import { useState, useEffect } from "react";
import commonCodeService from "@/services/commonCodeService";
import { HAUI_SCHOOLS } from "@/constants/schools";

export interface CodeOption {
  value: string;
  label: string;
}

const FALLBACK_COURSES: CodeOption[] = [
  { value: "K21", label: "K21" },
  { value: "K20", label: "K20" },
  { value: "K19", label: "K19" },
  { value: "K18", label: "K18" },
  { value: "K17", label: "K17" },
  { value: "K16", label: "K16" },
  { value: "K15", label: "K15" },
  { value: "K14", label: "K14" },
  { value: "K13", label: "K13" },
  { value: "K12", label: "K12" },
];

export const SCHOOL_OPTIONS: CodeOption[] = HAUI_SCHOOLS.map((s) => ({
  value: s,
  label: s,
}));

/**
 * Custom hook to load course options and HaUI school options for candidate forms and filters.
 * If courseLimit is provided and > 0, fetches recent courses.
 * If courseLimit is omitted or <= 0, fetches all available courses.
 */
export function useCommonCodes(courseLimit?: number | null) {
  const [coursesList, setCoursesList] = useState<CodeOption[]>(FALLBACK_COURSES);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchCourses() {
      try {
        const codes =
          courseLimit && courseLimit > 0
            ? await commonCodeService.getRecentCourses(courseLimit)
            : await commonCodeService.getAllCourses();

        if (isMounted && codes && codes.length > 0) {
          setCoursesList(codes.map((c) => ({ value: c.code, label: c.code || c.name })));
        }
      } catch (err) {
        if (isMounted) {
          console.error("Lỗi khi tải danh sách khóa:", err);
          setError("Không thể tải danh sách khóa từ máy chủ");
        }
      } finally {
        if (isMounted) {
          setLoadingCourses(false);
        }
      }
    }

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, [courseLimit]);

  return {
    coursesList,
    schoolOptions: SCHOOL_OPTIONS,
    loadingCourses,
    error,
  };
}
