package com.haui.istar.service.impl;

import com.haui.istar.dto.common.CommonCodeDto;
import com.haui.istar.dto.common.CreateCommonCodeRequest;
import com.haui.istar.dto.common.UpdateCommonCodeRequest;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.CommonCode;
import com.haui.istar.repository.CommonCodeRepository;
import com.haui.istar.service.CommonCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommonCodeServiceImpl implements CommonCodeService {

    private final CommonCodeRepository commonCodeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CommonCodeDto> getActiveCodesByCategory(String category) {
        return commonCodeRepository.findByCategoryAndIsActiveTrueOrderByOrderIndexAsc(category)
                .stream()
                .map(CommonCodeDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommonCodeDto> getAllCodesByCategory(String category) {
        if (category != null && !category.trim().isEmpty()) {
            return commonCodeRepository.findByCategoryOrderByOrderIndexAsc(category)
                    .stream()
                    .map(CommonCodeDto::fromEntity)
                    .collect(Collectors.toList());
        }
        return commonCodeRepository.findAll()
                .stream()
                .map(CommonCodeDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommonCodeDto createCode(CreateCommonCodeRequest request) {
        String category = request.getCategory().trim().toUpperCase();
        String code = request.getCode().trim().toUpperCase();

        if (commonCodeRepository.existsByCategoryAndCode(category, code)) {
            throw new BadRequestException("Mã " + code + " đã tồn tại trong danh mục " + category);
        }

        CommonCode entity = CommonCode.builder()
                .category(category)
                .code(code)
                .name(request.getName().trim())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .isActive(true)
                .build();

        CommonCode saved = commonCodeRepository.save(entity);
        return CommonCodeDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public CommonCodeDto updateCode(Long id, UpdateCommonCodeRequest request) {
        CommonCode entity = commonCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã cấu hình với id: " + id));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            entity.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
        if (request.getOrderIndex() != null) {
            entity.setOrderIndex(request.getOrderIndex());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

        CommonCode saved = commonCodeRepository.save(entity);
        return CommonCodeDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteCode(Long id) {
        CommonCode entity = commonCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã cấu hình với id: " + id));
        commonCodeRepository.delete(entity);
    }

    @Override
    @Transactional
    public void toggleActive(Long id) {
        CommonCode entity = commonCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã cấu hình với id: " + id));
        entity.setIsActive(!Boolean.TRUE.equals(entity.getIsActive()));
        commonCodeRepository.save(entity);
    }
}
