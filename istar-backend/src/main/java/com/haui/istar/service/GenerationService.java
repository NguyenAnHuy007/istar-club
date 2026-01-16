package com.haui.istar.service;

import com.haui.istar.dto.generation.CreateGenerationRequest;
import com.haui.istar.dto.generation.GenerationDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface GenerationService {

    GenerationDto createGeneration(CreateGenerationRequest request);

    GenerationDto updateGeneration(Long id, CreateGenerationRequest request);

    GenerationDto getGenerationById(Long id);

    List<GenerationDto> getAllGenerations();

    Page<GenerationDto> getAllGenerations(int page, int size);

    void deleteGeneration(Long id);

    void activateGeneration(Long id);

    void deactivateGeneration(Long id);

    List<GenerationDto> getActiveGenerations();
}
