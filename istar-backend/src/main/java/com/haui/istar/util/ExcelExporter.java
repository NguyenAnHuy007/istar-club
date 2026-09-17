package com.haui.istar.util;

import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.enums.ApplicationStatus;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

public class ExcelExporter {

    private static final String[] APPLICATION_COLUMNS = {
            "STT", "Email", "Họ", "Tên", "Ngày sinh",
            "Địa chỉ", "Số điện thoại", "Facebook",
            "Trường/Khoa", "Ngành/Lớp", "Khóa",
            "Ban ứng tuyển", "Cơ sở phỏng vấn", "Trạng thái",
            "Điểm PV", "Nhận xét PV",
            "Biết iStar qua", "Lý do ứng tuyển",
            "Ngày tạo", "Cập nhật"
    };

    public static ByteArrayInputStream applicationToExcel(List<Application> list) {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            SXSSFSheet sheet = workbook.createSheet("Đơn ứng tuyển");
            sheet.setDefaultColumnWidth(22); // ~150px
            sheet.trackAllColumnsForAutoSizing();

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Header row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < APPLICATION_COLUMNS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(APPLICATION_COLUMNS[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Application app : list) {
                Row row = sheet.createRow(rowIdx);
                int col = 0;

                row.createCell(col++).setCellValue(rowIdx); // STT
                row.createCell(col++).setCellValue(safe(app.getEmail()));
                row.createCell(col++).setCellValue(safe(app.getLastName()));
                row.createCell(col++).setCellValue(safe(app.getFirstName()));
                row.createCell(col++).setCellValue(app.getBirthday() != null ? app.getBirthday().toString() : "");
                row.createCell(col++).setCellValue(safe(app.getAddress()));
                row.createCell(col++).setCellValue(safe(app.getPhoneNumber()));
                row.createCell(col++).setCellValue(safe(app.getFacebookUrl()));
                row.createCell(col++).setCellValue(safe(app.getSchool()));
                row.createCell(col++).setCellValue(safe(app.getMajorClass()));
                row.createCell(col++).setCellValue(safe(app.getCourse()));

                // Departments
                StringBuilder depts = new StringBuilder();
                StringBuilder scores = new StringBuilder();
                StringBuilder notes = new StringBuilder();
                if (app.getApplicationDepartments() != null) {
                    for (ApplicationDepartment ad : app.getApplicationDepartments()) {
                        if (depts.length() > 0) {
                            depts.append(", ");
                            scores.append(", ");
                            notes.append(" | ");
                        }
                        depts.append(ad.getDepartment().getDisplayName());
                        scores.append(ad.getInterviewScore() != null ? ad.getInterviewScore().toString() : "—");
                        notes.append(ad.getInterviewNotes() != null ? ad.getInterviewNotes() : "");
                    }
                }
                row.createCell(col++).setCellValue(depts.toString());

                // Area
                row.createCell(col++).setCellValue(app.getArea() != null ? app.getArea().getDisplayName() : "");

                // Status - use displayName instead of code
                row.createCell(col++).setCellValue(app.getStatus() != null ? app.getStatus().getDisplayName() : "");

                // Scores & Notes
                row.createCell(col++).setCellValue(scores.toString());
                row.createCell(col++).setCellValue(notes.toString());

                row.createCell(col++).setCellValue(safe(app.getKnowIStar()));
                row.createCell(col++).setCellValue(safe(app.getReasonIStarer()));
                row.createCell(col++).setCellValue(app.getCreatedAt() != null ? app.getCreatedAt().toString() : "");
                row.createCell(col).setCellValue(app.getUpdatedAt() != null ? app.getUpdatedAt().toString() : "");

                rowIdx++;
            }

            // Ensure column width is at least 150px (22 * 256 in POI units)
            int minColWidth = 22 * 256;
            for (int i = 0; i < APPLICATION_COLUMNS.length; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < minColWidth) {
                    sheet.setColumnWidth(i, minColWidth);
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel: " + e.getMessage());
        }
    }

    /**
     * Generate a blank Excel template with headers and one example row
     * for importing application data, including a detailed reference & guidelines sheet.
     */
    public static ByteArrayInputStream generateTemplate() {
        String[] templateColumns = {
                "Email (*)", "Họ (*)", "Tên (*)", "Ngày sinh (YYYY-MM-DD)",
                "Địa chỉ", "Số điện thoại (*)", "Facebook URL",
                "Trường/Khoa", "Ngành/Lớp", "Khóa",
                "Ban ứng tuyển (phẩy phân cách)", "Cơ sở phỏng vấn",
                "Biết iStar qua", "Lý do ứng tuyển"
        };

        try (SXSSFWorkbook workbook = new SXSSFWorkbook(50);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Sheet 1: Template
            SXSSFSheet sheet = workbook.createSheet("Template");
            sheet.setDefaultColumnWidth(22); // ~150px
            sheet.trackAllColumnsForAutoSizing();

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < templateColumns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(templateColumns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Example row
            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("example@email.com");
            exampleRow.createCell(1).setCellValue("Nguyễn");
            exampleRow.createCell(2).setCellValue("Văn A");
            exampleRow.createCell(3).setCellValue("2005-03-15");
            exampleRow.createCell(4).setCellValue("Hà Nội");
            exampleRow.createCell(5).setCellValue("0912345678");
            exampleRow.createCell(6).setCellValue("https://facebook.com/example");
            exampleRow.createCell(7).setCellValue("Trường Công nghệ Thông tin và Truyền thông");
            exampleRow.createCell(8).setCellValue("CNTT 01 - K19");
            exampleRow.createCell(9).setCellValue("K19");
            exampleRow.createCell(10).setCellValue("Ban Âm nhạc, Ban Rap");
            exampleRow.createCell(11).setCellValue("Cơ sở 3 (Ninh Bình)");
            exampleRow.createCell(12).setCellValue("Fanpage iStar");
            exampleRow.createCell(13).setCellValue("Đam mê nghệ thuật");

            int minColWidth = 22 * 256;
            for (int i = 0; i < templateColumns.length; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < minColWidth) {
                    sheet.setColumnWidth(i, minColWidth);
                }
            }

            // Sheet 2: Reference & Guidelines
            SXSSFSheet guideSheet = workbook.createSheet("Hướng Dẫn & Mã Danh Mục");
            guideSheet.setDefaultColumnWidth(28);
            guideSheet.trackAllColumnsForAutoSizing();

            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 12);
            titleStyle.setFont(titleFont);

            CellStyle sectionStyle = workbook.createCellStyle();
            Font sectionFont = workbook.createFont();
            sectionFont.setBold(true);
            sectionStyle.setFont(sectionFont);

            int r = 0;
            Row rTitle = guideSheet.createRow(r++);
            Cell cTitle = rTitle.createCell(0);
            cTitle.setCellValue("QUY CHUẨN NHẬP DỮ LIỆU IMPORT ĐƠN ỨNG TUYỂN");
            cTitle.setCellStyle(titleStyle);
            r++;

            // Section 1: Quy định chung
            Row rSec1 = guideSheet.createRow(r++);
            Cell cSec1 = rSec1.createCell(0);
            cSec1.setCellValue("1. QUY ĐỊNH CHUNG");
            cSec1.setCellStyle(sectionStyle);

            guideSheet.createRow(r++).createCell(0).setCellValue("- Các cột có dấu (*) là bắt buộc: Email, Họ, Tên, Số điện thoại.");
            guideSheet.createRow(r++).createCell(0).setCellValue("- Trạng thái của ứng viên khi import qua Excel mặc định là: Đã nộp đơn (SUBMITTED).");
            guideSheet.createRow(r++).createCell(0).setCellValue("- Định dạng ngày sinh bắt buộc: YYYY-MM-DD (Ví dụ: 2005-04-15).");
            r++;

            // Section 2: Cơ sở phỏng vấn
            Row rSec2 = guideSheet.createRow(r++);
            Cell cSec2 = rSec2.createCell(0);
            cSec2.setCellValue("2. CƠ SỞ PHỎNG VẤN (Cột 'Cơ sở phỏng vấn')");
            cSec2.setCellStyle(sectionStyle);

            Row rAreaHead = guideSheet.createRow(r++);
            rAreaHead.createCell(0).setCellValue("Tên hiển thị hợp lệ");
            rAreaHead.createCell(1).setCellValue("Mã hệ thống (Chấp nhận)");
            rAreaHead.createCell(2).setCellValue("Ghi chú");

            Row rArea1 = guideSheet.createRow(r++);
            rArea1.createCell(0).setCellValue("Cơ sở 3 (Ninh Bình)");
            rArea1.createCell(1).setCellValue("NINH_BINH");
            rArea1.createCell(2).setCellValue("Cơ sở đào tạo Ninh Bình (Mặc định)");

            Row rArea2 = guideSheet.createRow(r++);
            rArea2.createCell(0).setCellValue("Cơ sở 1 (Hà Nội)");
            rArea2.createCell(1).setCellValue("HANOI");
            rArea2.createCell(2).setCellValue("Cơ sở chính Hà Nội");
            r++;

            // Section 3: Ban ứng tuyển
            Row rSec3 = guideSheet.createRow(r++);
            Cell cSec3 = rSec3.createCell(0);
            cSec3.setCellValue("3. BAN ỨNG TUYỂN (Cột 'Ban ứng tuyển (phẩy phân cách)')");
            cSec3.setCellStyle(sectionStyle);

            guideSheet.createRow(r++).createCell(0).setCellValue("- Nếu ứng viên chọn nhiều ban, phân cách bằng dấu phẩy (,) hoặc chấm phẩy (;).");

            Row rDeptHead = guideSheet.createRow(r++);
            rDeptHead.createCell(0).setCellValue("Tên ban hợp lệ");
            rDeptHead.createCell(1).setCellValue("Mã hệ thống");
            rDeptHead.createCell(2).setCellValue("Từ khóa nhận diện");

            Row rDept1 = guideSheet.createRow(r++);
            rDept1.createCell(0).setCellValue("Ban Âm nhạc");
            rDept1.createCell(1).setCellValue("MUSIC");
            rDept1.createCell(2).setCellValue("âm nhạc, music");

            Row rDept2 = guideSheet.createRow(r++);
            rDept2.createCell(0).setCellValue("Ban Rap");
            rDept2.createCell(1).setCellValue("RAP");
            rDept2.createCell(2).setCellValue("rap");

            Row rDept3 = guideSheet.createRow(r++);
            rDept3.createCell(0).setCellValue("Ban Vũ đạo");
            rDept3.createCell(1).setCellValue("DANCE");
            rDept3.createCell(2).setCellValue("vũ đạo, dance");

            Row rDept4 = guideSheet.createRow(r++);
            rDept4.createCell(0).setCellValue("Ban TT&TCSK");
            rDept4.createCell(1).setCellValue("MEDIA_AND_EVENT");
            rDept4.createCell(2).setCellValue("truyền thông, media, sự kiện, tt&tcsk");
            r++;

            // Section 4: Trường / Khoa
            Row rSec4 = guideSheet.createRow(r++);
            Cell cSec4 = rSec4.createCell(0);
            cSec4.setCellValue("4. DANH MỤC TRƯỜNG / KHOA HAUI (Cột 'Trường/Khoa')");
            cSec4.setCellStyle(sectionStyle);

            Row rSchHead = guideSheet.createRow(r++);
            rSchHead.createCell(0).setCellValue("Mã trường / khoa");
            rSchHead.createCell(1).setCellValue("Tên trường / khoa đầy đủ");

            String[][] schoolsData = {
                    {"CNTT_TT", "Trường Công nghệ Thông tin và Truyền thông"},
                    {"CO_KHI_O_TO", "Trường Cơ khí - Ô tô"},
                    {"NGOAI_NGU_DU_LICH", "Trường Ngoại ngữ - Du lịch"},
                    {"KINH_TE", "Trường Kinh tế"},
                    {"DIEN_DIEN_TU", "Trường Điện - Điện tử"},
                    {"HOA", "Khoa Công nghệ Hóa"},
                    {"MAY_THIET_KE", "Khoa Công nghệ May & Thiết kế Thời trang"},
                    {"VIET_NHAT", "Trung tâm Việt Nhật"}
            };
            for (String[] sch : schoolsData) {
                Row rSch = guideSheet.createRow(r++);
                rSch.createCell(0).setCellValue(sch[0]);
                rSch.createCell(1).setCellValue(sch[1]);
            }
            r++;

            // Section 5: Khóa
            Row rSec5 = guideSheet.createRow(r++);
            Cell cSec5 = rSec5.createCell(0);
            cSec5.setCellValue("5. DANH MỤC KHÓA HỌC (Cột 'Khóa')");
            cSec5.setCellStyle(sectionStyle);
            guideSheet.createRow(r++).createCell(0).setCellValue("- Các khóa phổ biến: K18, K19, K20, K21... (nhập K kèm số khóa).");

            for (int i = 0; i < 3; i++) {
                guideSheet.autoSizeColumn(i);
                if (guideSheet.getColumnWidth(i) < minColWidth) {
                    guideSheet.setColumnWidth(i, minColWidth);
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate template: " + e.getMessage());
        }
    }

    private static String safe(String s) {
        return s != null ? s : "";
    }
}
