package com.haui.istar.util;

import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

public class ExcelExporter {

    public static ByteArrayInputStream applicationToExcel(List<Application> list) {
        // Use SXSSFWorkbook for streaming (keep 100 rows in memory, flush others to
        // disk)
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            SXSSFSheet sheet = workbook.createSheet("Applications");
            sheet.trackAllColumnsForAutoSizing(); // Required for autoSizeColumn in streaming mode

            String[] columns = {
                    "ID", "Email", "First Name", "Last Name",
                    "Birthday", "Address", "Phone Number",
                    "School", "Major/Class", "Course",
                    "Department", "Reason Department",
                    "Know IStar", "Reason IStarer",
                    "Created At", "Updated At", "CV URL"
            };

            // Header
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            int rowIdx = 1;

            for (Application app : list) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(app.getId());
                row.createCell(1).setCellValue(app.getEmail());
                row.createCell(2).setCellValue(app.getFirstName());
                row.createCell(3).setCellValue(app.getLastName());

                row.createCell(4).setCellValue(app.getBirthday() != null ? app.getBirthday().toString() : "");
                row.createCell(5).setCellValue(app.getAddress());
                row.createCell(6).setCellValue(app.getPhoneNumber());

                row.createCell(7).setCellValue(app.getSchool() != null ? app.getSchool().getDisplayName() : "");
                row.createCell(8).setCellValue(app.getMajorClass());
                row.createCell(9).setCellValue(app.getCourse());
                StringBuilder depts = new StringBuilder();
                if (app.getApplicationDepartments() != null) {
                    for (ApplicationDepartment ad : app.getApplicationDepartments()) {
                        depts.append(ad.getDepartment().getDisplayName()).append(", ");
                    }
                }
                if (depts.length() > 0) depts.setLength(depts.length() - 2);

                row.createCell(10).setCellValue(depts.toString());
                row.createCell(11).setCellValue(app.getReasonDepartment());
                row.createCell(12).setCellValue(app.getKnowIStar());
                row.createCell(13).setCellValue(app.getReasonIStarer());

                row.createCell(14).setCellValue(app.getCreatedAt() != null ? app.getCreatedAt().toString() : "");
                row.createCell(15).setCellValue(app.getUpdatedAt() != null ? app.getUpdatedAt().toString() : "");

                row.createCell(16).setCellValue(app.getCvUrl());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel: " + e.getMessage());
        }
    }
}
