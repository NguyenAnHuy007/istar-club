package com.haui.istar.controller.admin;

import com.haui.istar.dto.common.ApiResponse;
import com.haui.istar.dto.generation.CreateGenerationRequest;
import com.haui.istar.dto.generation.GenerationDto;
import com.haui.istar.service.GenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/generations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminGenerationController {

    private final GenerationService generationService;

    /**
     * Tạo gen mới
     */
    @PostMapping
    public ResponseEntity<ApiResponse<GenerationDto>> createGeneration(@Valid @RequestBody CreateGenerationRequest request) {
        GenerationDto generation = generationService.createGeneration(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo gen thành công", generation));
    }

    /**
     * Cập nhật gen
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GenerationDto>> updateGeneration(
            @PathVariable Long id,
            @Valid @RequestBody CreateGenerationRequest request) {
        GenerationDto generation = generationService.updateGeneration(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật gen thành công", generation));
    }

    /**
     * Lấy thông tin gen theo id
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GenerationDto>> getGenerationById(@PathVariable Long id) {
        GenerationDto generation = generationService.getGenerationById(id);
        return ResponseEntity.ok(ApiResponse.success(generation));
    }

    /**
     * Lấy tất cả gen (không phân trang)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<GenerationDto>>> getAllGenerations() {
        List<GenerationDto> generations = generationService.getAllGenerations();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách gen thành công", generations));
    }

    /**
     * Lấy tất cả gen (có phân trang)
     */
    @GetMapping("/pageable")
    public ResponseEntity<ApiResponse<Page<GenerationDto>>> getAllGenerationsPageable(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<GenerationDto> generations = generationService.getAllGenerations(page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách gen thành công", generations));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> softDeleteGeneration(@PathVariable Long id) {
        generationService.softDeleteGeneration(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mềm gen thành công", null));
    }
}
