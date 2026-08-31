package com.haui.istar.service.impl;

import com.haui.istar.dto.recruitment.CreateRecruitmentRequest;
import com.haui.istar.dto.recruitment.RecruitmentDto;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Recruitment;
import com.haui.istar.repository.RecruitmentRepository;
import com.haui.istar.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecruitmentServiceImpl implements RecruitmentService {

    private final RecruitmentRepository recruitmentRepository;

    @Override
    public Page<RecruitmentDto> getAllRecruitments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Recruitment> recruitments = recruitmentRepository.findByIsDeletedFalse(pageable);
        return recruitments.map(this::mapToDto);
    }

    @Override
    public RecruitmentDto getRecruitmentById(Long id) {
        Recruitment recruitment = recruitmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt tuyển"));
        return mapToDto(recruitment);
    }

    @Override
    @Transactional
    public RecruitmentDto createRecruitment(CreateRecruitmentRequest request) {
        // Đóng đợt tuyển cũ nếu có
        recruitmentRepository.findByIsActiveTrueAndIsDeletedFalse().ifPresent(old -> {
            old.setIsActive(false);
            recruitmentRepository.save(old);
        });

        Recruitment recruitment = Recruitment.builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(true)
                .build();

        return mapToDto(recruitmentRepository.save(recruitment));
    }

    @Override
    @Transactional
    public RecruitmentDto updateRecruitment(Long id, CreateRecruitmentRequest request) {
        Recruitment recruitment = recruitmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt tuyển"));

        recruitment.setName(request.getName());
        recruitment.setStartDate(request.getStartDate());
        recruitment.setEndDate(request.getEndDate());

        return mapToDto(recruitmentRepository.save(recruitment));
    }

    @Override
    @Transactional
    public void closeRecruitment(Long id) {
        Recruitment recruitment = recruitmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt tuyển"));

        recruitment.setIsActive(false);
        recruitmentRepository.save(recruitment);
    }

    @Override
    @Transactional
    public void softDeleteRecruitment(Long id) {
        Recruitment recruitment = recruitmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt tuyển"));

        if (Boolean.TRUE.equals(recruitment.getIsActive())) {
            throw new BadRequestException("Không thể xóa đợt tuyển đang mở. Vui lòng đóng trước khi xóa.");
        }

        recruitment.setIsDeleted(true);
        recruitmentRepository.save(recruitment);
    }

    @Override
    public RecruitmentDto getActiveRecruitment() {
        return recruitmentRepository.findByIsActiveTrueAndIsDeletedFalse()
                .map(this::mapToDto)
                .orElse(null);
    }

    private RecruitmentDto mapToDto(Recruitment recruitment) {
        return RecruitmentDto.builder()
                .id(recruitment.getId())
                .name(recruitment.getName())
                .startDate(recruitment.getStartDate())
                .endDate(recruitment.getEndDate())
                .isActive(recruitment.getIsActive())
                .createdAt(recruitment.getCreatedAt())
                .updatedAt(recruitment.getUpdatedAt())
                .build();
    }
}
