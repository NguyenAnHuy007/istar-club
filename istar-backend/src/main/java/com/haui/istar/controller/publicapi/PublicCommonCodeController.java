package com.haui.istar.controller.publicapi;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.common.CommonCodeDto;
import com.haui.istar.service.CommonCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/common-codes")
@RequiredArgsConstructor
public class PublicCommonCodeController {

    private final CommonCodeService commonCodeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommonCodeDto>>> getActiveCodes(
            @RequestParam(name = "category", defaultValue = "SCHOOL") String category) {
        List<CommonCodeDto> codes = commonCodeService.getActiveCodesByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh mục thành công", codes));
    }

    /**
     * API lấy tất cả các trường học / khoa trực thuộc HaUI
     * GET /api/public/common-codes/schools
     */
    @GetMapping("/schools")
    public ResponseEntity<ApiResponse<List<CommonCodeDto>>> getAllSchools() {
        List<CommonCodeDto> schools = commonCodeService.getAllSchools();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách trường học thành công", schools));
    }

    /**
     * API lấy tất cả các khóa học (sắp xếp giảm dần K21 -> K12)
     * GET /api/public/common-codes/courses
     */
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CommonCodeDto>>> getAllCourses() {
        List<CommonCodeDto> courses = commonCodeService.getAllCourses();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tất cả khóa học thành công", courses));
    }

    /**
     * API lấy 6 khóa học gần nhất (mặc định K16 đến K21)
     * GET /api/public/common-codes/recent-courses?limit=6
     */
    @GetMapping("/recent-courses")
    public ResponseEntity<ApiResponse<List<CommonCodeDto>>> getRecentCourses(
            @RequestParam(name = "limit", defaultValue = "6") int limit) {
        List<CommonCodeDto> courses = commonCodeService.getRecentCourses(limit);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách khóa gần nhất thành công", courses));
    }
}
