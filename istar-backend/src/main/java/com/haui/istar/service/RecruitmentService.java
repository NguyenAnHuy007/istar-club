package com.haui.istar.service;

import com.haui.istar.dto.recruitment.CreateRecruitmentRequest;
import com.haui.istar.dto.recruitment.RecruitmentDto;
import org.springframework.data.domain.Page;

public interface RecruitmentService {
    Page<RecruitmentDto> getAllRecruitments(int page, int size);
    RecruitmentDto getRecruitmentById(Long id);
    RecruitmentDto createRecruitment(CreateRecruitmentRequest request);
    RecruitmentDto updateRecruitment(Long id, CreateRecruitmentRequest request);
    void closeRecruitment(Long id);
    void softDeleteRecruitment(Long id);
    RecruitmentDto getActiveRecruitment();
}
