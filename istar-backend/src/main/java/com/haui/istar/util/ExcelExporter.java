package com.haui.istar.util;

import com.haui.istar.model.RegisterApplicationForm;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

public class ExcelExporter {

    public static ByteArrayInputStream applicationToExcel(List<RegisterApplicationForm> list) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Applications");

            String[] columns = {
                    "ID", "Email", "First Name", "Last Name",
                    "Birthday", "Address", "Phone Number",
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

            for (RegisterApplicationForm app : list) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(app.getId());
                row.createCell(1).setCellValue(app.getEmail());
                row.createCell(2).setCellValue(app.getFirstName());
                row.createCell(3).setCellValue(app.getLastName());

                row.createCell(4).setCellValue(app.getBirthday() != null ? app.getBirthday().toString() : "");
                row.createCell(5).setCellValue(app.getAddress());
                row.createCell(6).setCellValue(app.getPhoneNumber());

                row.createCell(7).setCellValue(app.getDepartment() != null ? app.getDepartment().toString() : "");
                row.createCell(8).setCellValue(app.getReasonDepartment());
                row.createCell(9).setCellValue(app.getKnowIStar());
                row.createCell(10).setCellValue(app.getReasonIStarer());

                row.createCell(11).setCellValue(app.getCreatedAt() != null ? app.getCreatedAt().toString() : "");
                row.createCell(12).setCellValue(app.getUpdatedAt() != null ? app.getUpdatedAt().toString() : "");

                row.createCell(13).setCellValue(app.getCvUrl());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel: " + e.getMessage());
        }
    }
}
