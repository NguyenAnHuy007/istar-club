package com.haui.istar.util;

import com.haui.istar.exception.BadRequestException;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class FileUploadUtil {

    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_CV_SIZE = 10 * 1024 * 1024;     // 10MB

    private static final List<String> ALLOWED_AVATAR_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private static final List<String> ALLOWED_CV_TYPES = Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    public static void validateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File ảnh đại diện không được để trống!");
        }

        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw new BadRequestException("Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 5MB)!");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        boolean isValidType = contentType != null && ALLOWED_AVATAR_TYPES.contains(contentType.toLowerCase());
        boolean isValidExt = originalFilename != null && (
                originalFilename.toLowerCase().endsWith(".jpg") ||
                originalFilename.toLowerCase().endsWith(".jpeg") ||
                originalFilename.toLowerCase().endsWith(".png") ||
                originalFilename.toLowerCase().endsWith(".webp")
        );

        if (!isValidType && !isValidExt) {
            throw new BadRequestException("Định dạng ảnh không hợp lệ! Chỉ chấp nhận: JPG, JPEG, PNG, WEBP.");
        }
    }

    public static void validateCv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File CV không được để trống!");
        }

        if (file.getSize() > MAX_CV_SIZE) {
            throw new BadRequestException("Dung lượng file CV vượt quá giới hạn cho phép (tối đa 10MB)!");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        boolean isValidType = contentType != null && ALLOWED_CV_TYPES.contains(contentType.toLowerCase());
        boolean isValidExt = originalFilename != null && (
                originalFilename.toLowerCase().endsWith(".pdf") ||
                originalFilename.toLowerCase().endsWith(".doc") ||
                originalFilename.toLowerCase().endsWith(".docx")
        );

        if (!isValidType && !isValidExt) {
            throw new BadRequestException("Định dạng file CV không hợp lệ! Chỉ chấp nhận: PDF, DOC, DOCX.");
        }
    }

    public static String saveFile(String uploadDir, MultipartFile file) throws IOException {
        String cleanUploadDir = StringUtils.hasText(uploadDir) ? uploadDir : "uploads";
        Path dirPath = Paths.get(cleanUploadDir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
        // Remove potentially dangerous characters
        originalFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueFileName = UUID.randomUUID() + "_" + originalFilename;

        Path targetPath = dirPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return "/" + cleanUploadDir + "/" + uniqueFileName;
    }
}
