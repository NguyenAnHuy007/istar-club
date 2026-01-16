package com.haui.istar.service.impl;

import com.haui.istar.dto.generation.CreateGenerationRequest;
import com.haui.istar.dto.generation.GenerationDto;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Generation;
import com.haui.istar.repository.GenerationRepository;
import com.haui.istar.service.GenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenerationServiceImpl implements GenerationService {

    private final GenerationRepository generationRepository;

    @Override
    @Transactional
    public GenerationDto createGeneration(CreateGenerationRequest request) {
        if (generationRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tên gen đã tồn tại: " + request.getName());
        }

        Generation generation = Generation.builder()
                .name(request.getName())
                .yearJoined(request.getYearJoined())
                .description(request.getDescription())
                .isActive(true)
                .build();

        Generation saved = generationRepository.save(generation);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public GenerationDto updateGeneration(Long id, CreateGenerationRequest request) {
        Generation generation = generationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gen với id: " + id));

        if (!generation.getName().equals(request.getName()) && generationRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tên gen đã tồn tại: " + request.getName());
        }

        generation.setName(request.getName());
        generation.setYearJoined(request.getYearJoined());
        generation.setDescription(request.getDescription());

        Generation updated = generationRepository.save(generation);
        return mapToDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public GenerationDto getGenerationById(Long id) {
        Generation generation = generationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gen với id: " + id));
        return mapToDto(generation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GenerationDto> getAllGenerations() {
        return generationRepository.findAll(Sort.by(Sort.Direction.DESC, "yearJoined"))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GenerationDto> getAllGenerations(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "yearJoined"));
        return generationRepository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    @Transactional
    public void deleteGeneration(Long id) {
        Generation generation = generationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gen với id: " + id));
        generationRepository.delete(generation);
    }

    @Override
    @Transactional
    public void activateGeneration(Long id) {
        Generation generation = generationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gen với id: " + id));
        generation.setIsActive(true);
        generationRepository.save(generation);
    }

    @Override
    @Transactional
    public void deactivateGeneration(Long id) {
        Generation generation = generationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gen với id: " + id));
        generation.setIsActive(false);
        generationRepository.save(generation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GenerationDto> getActiveGenerations() {
        return generationRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private GenerationDto mapToDto(Generation generation) {
        return GenerationDto.builder()
                .id(generation.getId())
                .name(generation.getName())
                .yearJoined(generation.getYearJoined())
                .description(generation.getDescription())
                .isActive(generation.getIsActive())
                .createdAt(generation.getCreatedAt())
                .updatedAt(generation.getUpdatedAt())
                .build();
    }
}
