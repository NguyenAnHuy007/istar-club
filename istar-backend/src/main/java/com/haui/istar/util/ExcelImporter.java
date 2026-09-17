package com.haui.istar.util;

import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.Recruitment;
import com.haui.istar.model.enums.Area;
import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Department;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Utility to parse uploaded Excel files into Application entities.
 */
public class ExcelImporter {

    /**
     * Parse an Excel file and build a list of Application entities linked to the given recruitment.
     * Column order must match the template:
     * 0: Email, 1: Họ, 2: Tên, 3: Ngày sinh, 4: Địa chỉ, 5: SĐT, 6: Facebook,
     * 7: Trường/Khoa, 8: Ngành/Lớp, 9: Khóa, 10: Ban ứng tuyển, 11: Cơ sở,
     * 12: Biết iStar qua, 13: Lý do ứng tuyển
     */
    public static List<Application> parseExcel(InputStream inputStream, Recruitment recruitment) {
        List<Application> results = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) return results;

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // Skip header (row 0)
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String email = getCellString(row, 0);
                String lastName = getCellString(row, 1);
                String firstName = getCellString(row, 2);

                // Skip empty rows
                if (email.isBlank() && firstName.isBlank() && lastName.isBlank()) continue;

                String birthdayStr = getCellString(row, 3);
                String address = getCellString(row, 4);
                String phone = getCellString(row, 5);
                String facebook = getCellString(row, 6);
                String school = getCellString(row, 7);
                String majorClass = getCellString(row, 8);
                String course = getCellString(row, 9);
                String deptStr = getCellString(row, 10);
                String areaStr = getCellString(row, 11);
                String knowIStar = getCellString(row, 12);
                String reasonIStarer = getCellString(row, 13);

                Application app = Application.builder()
                        .email(email.isBlank() ? null : email.trim())
                        .lastName(lastName.trim())
                        .firstName(firstName.trim())
                        .birthday(parseBirthday(birthdayStr))
                        .address(address.isBlank() ? null : address.trim())
                        .phoneNumber(phone.trim())
                        .facebookUrl(facebook.isBlank() ? null : facebook.trim())
                        .school(school.isBlank() ? null : school.trim())
                        .majorClass(majorClass.isBlank() ? null : majorClass.trim())
                        .course(course.isBlank() ? null : course.trim())
                        .area(parseArea(areaStr))
                        .knowIStar(knowIStar.isBlank() ? null : knowIStar.trim())
                        .reasonIStarer(reasonIStarer.isBlank() ? null : reasonIStarer.trim())
                        .status(ApplicationStatus.SUBMITTED)
                        .recruitment(recruitment)
                        .isDeleted(false)
                        .build();

                // Parse departments
                Set<ApplicationDepartment> appDepts = parseDepartments(deptStr, app);
                app.setApplicationDepartments(appDepts);

                results.add(app);
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi đọc file Excel: " + e.getMessage(), e);
        }

        return results;
    }

    private static Set<ApplicationDepartment> parseDepartments(String deptStr, Application app) {
        Set<ApplicationDepartment> list = new LinkedHashSet<>();
        if (deptStr == null || deptStr.isBlank()) return list;

        for (String part : deptStr.split("[,;]")) {
            String trimmed = part.trim();
            Department dept = matchDepartment(trimmed);
            if (dept != null) {
                list.add(ApplicationDepartment.builder()
                        .application(app)
                        .department(dept)
                        .status(ApplicationStatus.SUBMITTED)
                        .build());
            }
        }
        return list;
    }

    private static Department matchDepartment(String s) {
        if (s == null || s.isBlank()) return null;
        String lower = s.toLowerCase().trim();

        if (lower.contains("âm nhạc") || lower.equals("music")) return Department.MUSIC;
        if (lower.contains("rap")) return Department.RAP;
        if (lower.contains("vũ đạo") || lower.contains("dance")) return Department.DANCE;
        if (lower.contains("truyền thông") || lower.contains("tt&tcsk") || lower.contains("media")
                || lower.contains("sự kiện")) return Department.MEDIA_AND_EVENT;

        // Try enum name directly
        try {
            return Department.valueOf(s.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static Area parseArea(String s) {
        if (s == null || s.isBlank()) return Area.NINH_BINH; // default
        String lower = s.toLowerCase().trim();

        if (lower.contains("hà nội") || lower.contains("hanoi") || lower.contains("cơ sở 1")) return Area.HANOI;
        if (lower.contains("ninh bình") || lower.contains("ninh_binh") || lower.contains("cơ sở 3")) return Area.NINH_BINH;

        try {
            return Area.valueOf(s.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return Area.NINH_BINH;
        }
    }

    private static LocalDate parseBirthday(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDate.parse(s.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e1) {
            try {
                return LocalDate.parse(s.trim(), DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    private static String getCellString(Row row, int colIdx) {
        Cell cell = row.getCell(colIdx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toLocalDate().toString();
                }
                // Handle phone numbers stored as numbers
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val) && !Double.isInfinite(val)) {
                    yield String.valueOf((long) val);
                }
                yield String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }
}
