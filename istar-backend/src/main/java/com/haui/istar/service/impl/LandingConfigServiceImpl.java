package com.haui.istar.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.haui.istar.dto.landing.AboutImageDto;
import com.haui.istar.dto.landing.AchievementItemDto;
import com.haui.istar.dto.landing.DepartmentItemDto;
import com.haui.istar.dto.landing.HomepageConfigDto;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.model.LandingConfig;
import com.haui.istar.repository.LandingConfigRepository;
import com.haui.istar.service.LandingConfigService;
import com.haui.istar.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class LandingConfigServiceImpl implements LandingConfigService {

    public static final String HOMEPAGE_KEY = "HOMEPAGE";

    private final LandingConfigRepository landingConfigRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    @Transactional(readOnly = true)
    public HomepageConfigDto getHomepageConfig() {
        return landingConfigRepository.findByConfigKey(HOMEPAGE_KEY)
                .map(config -> {
                    try {
                        return objectMapper.readValue(config.getContentJson(), HomepageConfigDto.class);
                    } catch (JsonProcessingException e) {
                        log.error("Failed to parse homepage config JSON from DB: {}", e.getMessage());
                        return getDefaultHomepageConfig();
                    }
                })
                .orElseGet(this::getDefaultHomepageConfig);
    }

    @Override
    @Transactional
    public HomepageConfigDto updateHomepageConfig(HomepageConfigDto request, String updatedBy) {
        if (request == null) {
            throw new BadRequestException("Dữ liệu cấu hình trang chủ không được để trống!");
        }

        if (request.getDepartments() == null || request.getDepartments().getItems() == null) {
            throw new BadRequestException("Danh sách các ban không được để trống!");
        }

        int deptCount = request.getDepartments().getItems().size();
        if (deptCount < 2 || deptCount > 6) {
            throw new BadRequestException("Số lượng ban phải từ 2 đến 6 ban (hiện tại: " + deptCount + ")!");
        }

        try {
            String jsonContent = objectMapper.writeValueAsString(request);

            LandingConfig config = landingConfigRepository.findByConfigKey(HOMEPAGE_KEY)
                    .orElseGet(() -> LandingConfig.builder()
                            .configKey(HOMEPAGE_KEY)
                            .build());

            String oldJsonContent = config.getContentJson();
            config.setContentJson(jsonContent);
            config.setUpdatedAt(LocalDateTime.now());
            config.setUpdatedBy(updatedBy);

            landingConfigRepository.save(config);

            // Clean up replaced or unreferenced images from disk
            cleanUpLandingImages(oldJsonContent, jsonContent);

            return request;
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize homepage config to JSON", e);
            throw new BadRequestException("Lỗi xử lý định dạng cấu hình trang chủ: " + e.getMessage());
        }
    }

    private Set<String> extractLandingImageFilenames(String jsonContent) {
        if (!StringUtils.hasText(jsonContent)) {
            return Collections.emptySet();
        }
        Set<String> filenames = new HashSet<>();
        Matcher matcher = Pattern.compile("/uploads/landing/([a-zA-Z0-9._-]+)").matcher(jsonContent);
        while (matcher.find()) {
            filenames.add(matcher.group(1));
        }
        return filenames;
    }

    private void cleanUpLandingImages(String oldJson, String newJson) {
        Set<String> oldFilenames = extractLandingImageFilenames(oldJson);
        Set<String> newFilenames = extractLandingImageFilenames(newJson);

        // Delete files that were in the previous config but are no longer in the new config
        for (String oldName : oldFilenames) {
            if (!newFilenames.contains(oldName)) {
                deleteLandingImageFile(oldName);
            }
        }

        // Also clean up orphan files in uploads/landing/ older than 15 minutes that are not in active config
        cleanUpOrphanFiles(newFilenames);
    }

    private void cleanUpOrphanFiles(Set<String> activeFilenames) {
        String cleanUploadDir = StringUtils.hasText(uploadDir) ? uploadDir : "uploads";
        Path landingDir = Paths.get(cleanUploadDir, "landing");
        if (!Files.exists(landingDir) || !Files.isDirectory(landingDir)) {
            return;
        }

        long thresholdMillis = Instant.now().minus(Duration.ofMinutes(15)).toEpochMilli();
        try (Stream<Path> stream = Files.list(landingDir)) {
            stream.filter(Files::isRegularFile).forEach(file -> {
                String fileName = file.getFileName().toString();
                if (!activeFilenames.contains(fileName)) {
                    try {
                        long lastModified = Files.getLastModifiedTime(file).toMillis();
                        if (lastModified < thresholdMillis) {
                            Files.deleteIfExists(file);
                            log.info("Deleted orphan landing image from disk: {}", file);
                        }
                    } catch (IOException e) {
                        log.warn("Failed to inspect or delete orphan landing image: {}", fileName, e);
                    }
                }
            });
        } catch (IOException e) {
            log.warn("Failed to list files in landing directory for orphan cleanup", e);
        }
    }

    private void deleteLandingImageFile(String filename) {
        try {
            String cleanUploadDir = StringUtils.hasText(uploadDir) ? uploadDir : "uploads";
            Path filePath = Paths.get(cleanUploadDir, "landing", filename);
            if (Files.exists(filePath)) {
                Files.deleteIfExists(filePath);
                log.info("Deleted replaced landing image from disk: {}", filePath);
            }
        } catch (Exception e) {
            log.warn("Failed to delete landing image: {}", filename, e);
        }
    }

    @Override
    public String uploadLandingImage(MultipartFile file) {
        FileUploadUtil.validateLandingImage(file);
        try {
            return FileUploadUtil.saveFile(uploadDir, "landing", file);
        } catch (IOException e) {
            log.error("Lỗi tải lên ảnh landing page", e);
            throw new BadRequestException("Không thể lưu file ảnh: " + e.getMessage());
        }
    }

    @Override
    public HomepageConfigDto getDefaultHomepageConfig() {
        // 1. Hero default
        HomepageConfigDto.HeroConfig hero = HomepageConfigDto.HeroConfig.builder()
                .badge("Trường Công nghệ Thông tin và Truyền thông - HaUI")
                .headline("Câu lạc bộ Nghệ thuật iStar")
                .subtitle("Nơi hội tụ những tài năng nghệ thuật — từ âm nhạc, rap, vũ đạo đến truyền thông và tổ chức sự kiện. Cùng nhau cháy hết mình trên mọi sân khấu.")
                .imageUrl("")
                .primaryButtonText("Ứng tuyển ngay")
                .primaryButtonUrl("/apply")
                .secondaryButtonText("Tìm hiểu thêm")
                .secondaryButtonUrl("/#about")
                .build();

        // 2. About default
        List<String> paragraphs = new ArrayList<>();
        paragraphs.add("Câu lạc bộ iStar được thành lập vào năm 2013, trực thuộc trường Công nghệ Thông tin & Truyền thông — Đại học Công nghiệp Hà Nội. iStar là ngôi nhà chung cho những bạn trẻ yêu nghệ thuật, nơi mỗi cá nhân được tỏa sáng theo cách riêng của mình.");
        paragraphs.add("Trải qua hơn 10 năm hoạt động, iStar đã tổ chức và tham gia hàng trăm sự kiện lớn nhỏ trong và ngoài trường, từ các đêm nhạc hội, cuộc thi tài năng đến các chương trình thiện nguyện. Câu lạc bộ liên tục phát triển cả về quy mô lẫn chất lượng, trở thành một trong những CLB nghệ thuật hàng đầu tại HaUI.");
        paragraphs.add("Với phương châm “Tỏa sáng theo cách của bạn”, iStar không chỉ là nơi rèn luyện kỹ năng nghệ thuật mà còn là môi trường để các thành viên phát triển bản thân, xây dựng tình bạn và tạo nên những kỷ niệm đẹp trong thời sinh viên.");

        HomepageConfigDto.AboutConfig about = HomepageConfigDto.AboutConfig.builder()
                .badge("Về chúng tôi")
                .title("Nơi nghệ thuật gặp gỡ đam mê")
                .paragraphs(paragraphs)
                .imageLarge(AboutImageDto.builder().url("").label("Đêm nhạc hội").icon("Mic2").build())
                .imageSmall1(AboutImageDto.builder().url("").label("Hoạt động").icon("Heart").build())
                .imageSmall2(AboutImageDto.builder().url("").label("Tập thể").icon("Users").build())
                .build();

        // 3. Departments default
        List<DepartmentItemDto> depts = new ArrayList<>();
        depts.add(DepartmentItemDto.builder()
                .id("dept-1")
                .icon("Music")
                .name("Âm nhạc")
                .description("Trau dồi kỹ năng thanh nhạc, nhạc cụ và biểu diễn. Tạo ra những giai điệu chạm đến trái tim khán giả.")
                .gradient("from-[#255798] to-[#4d8ee8]")
                .glowColor("rgba(37, 87, 152, 0.2)")
                .build());
        depts.add(DepartmentItemDto.builder()
                .id("dept-2")
                .icon("Mic")
                .name("Rap")
                .description("Sáng tác lời rap, freestyle và biểu diễn trên sân khấu. Thể hiện cá tính qua từng câu từ mạnh mẽ.")
                .gradient("from-[#EC4899] to-[#F472B6]")
                .glowColor("rgba(236, 72, 153, 0.15)")
                .build());
        depts.add(DepartmentItemDto.builder()
                .id("dept-3")
                .icon("Footprints")
                .name("Vũ đạo")
                .description("Khám phá đa dạng thể loại dance từ K-pop, hip-hop đến contemporary. Biến cơ thể thành ngôn ngữ nghệ thuật.")
                .gradient("from-[#F59E0B] to-[#FBBF24]")
                .glowColor("rgba(245, 158, 11, 0.15)")
                .build());
        depts.add(DepartmentItemDto.builder()
                .id("dept-4")
                .icon("Megaphone")
                .name("Truyền thông và Tổ chức sự kiện")
                .description("Lên kế hoạch, tổ chức sự kiện và xây dựng hình ảnh CLB. Sáng tạo nội dung và kết nối cộng đồng.")
                .gradient("from-[#10B981] to-[#34D399]")
                .glowColor("rgba(16, 185, 129, 0.15)")
                .build());

        HomepageConfigDto.DepartmentSectionConfig departments = HomepageConfigDto.DepartmentSectionConfig.builder()
                .badge("Các ban hoạt động")
                .title("Bốn ban — Một iStar")
                .subtitle("Mỗi ban mang một màu sắc riêng, nhưng tất cả đều hướng đến mục tiêu chung: tỏa sáng trên sân khấu nghệ thuật.")
                .items(depts)
                .build();

        // 4. Achievements default
        List<AchievementItemDto> achievements = new ArrayList<>();
        achievements.add(AchievementItemDto.builder()
                .id("ach-1")
                .year("2024")
                .title("Đêm nhạc kỷ niệm 10 năm thành lập")
                .description("Quy tụ hơn 1.000 khán giả cùng nhiều thế hệ thành viên iStar qua các thời kỳ.")
                .imageUrl("")
                .build());
        achievements.add(AchievementItemDto.builder()
                .id("ach-2")
                .year("2023")
                .title("Giải Nhất — Cuộc thi Vũ đạo Sinh viên HN")
                .description("Đại diện xuất sắc của HaUI tại sân chơi vũ đạo thủ đô.")
                .imageUrl("")
                .build());
        achievements.add(AchievementItemDto.builder()
                .id("ach-3")
                .year("2022")
                .title("CLB xuất sắc tiêu biểu — HaUI")
                .description("Được nhà trường vinh danh CLB hoạt động xuất sắc nhất năm.")
                .imageUrl("")
                .build());
        achievements.add(AchievementItemDto.builder()
                .id("ach-4")
                .year("2021")
                .title("Giải Đặc biệt — Liên hoan Văn nghệ HaUI")
                .description("Giải thưởng cao nhất dành cho tiết mục tổng hợp nghệ thuật.")
                .imageUrl("")
                .build());

        HomepageConfigDto.AchievementSectionConfig achievementSection = HomepageConfigDto.AchievementSectionConfig.builder()
                .badge("Thành tích nổi bật")
                .title("Những dấu ấn rực rỡ")
                .subtitle("Hành trình hơn 10 năm với hàng chục giải thưởng lớn nhỏ, minh chứng cho tài năng và sự cống hiến của các thế hệ thành viên iStar.")
                .items(achievements)
                .build();

        return HomepageConfigDto.builder()
                .hero(hero)
                .about(about)
                .departments(departments)
                .achievements(achievementSection)
                .build();
    }
}
