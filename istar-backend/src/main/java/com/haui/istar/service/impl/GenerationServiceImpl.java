package com.haui.istar.service.impl;

import com.haui.istar.dto.generation.CreateGenerationRequest;
import com.haui.istar.dto.generation.GenerationDto;
import com.haui.istar.exception.BadRequestException;
import com.haui.istar.exception.ResourceNotFoundException;
import com.haui.istar.model.Generation;
import com.haui.istar.model.User;
import com.haui.istar.repository.GenerationRepository;
import com.haui.istar.repository.UserRepository;
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
    private final UserRepository userRepository;

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
                .build();

        Generation saved = generationRepository.save(generation);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public GenerationDto updateGeneration(Long id, CreateGenerationRequest request) {
        Generation generation = generationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gen với id: " + id));

        if (Boolean.TRUE.equals(generation.getIsDeleted())) {
            throw new BadRequestException("Không thể cập nhật gen đã bị xóa");
        }

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
        if (Boolean.TRUE.equals(generation.getIsDeleted())) {
            throw new ResourceNotFoundException("Gen đã bị xóa");
        }
        return mapToDto(generation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GenerationDto> getAllGenerations() {
        return generationRepository.findAll(Sort.by(Sort.Direction.DESC, "yearJoined"))
                .stream()
                .filter(gen -> !Boolean.TRUE.equals(gen.getIsDeleted()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GenerationDto> getAllGenerations(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "yearJoined"));
        return generationRepository.findByIsDeletedFalse(pageable).map(this::mapToDto);
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
    public void softDeleteGeneration(Long id) {
        Generation generation = generationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gen với id: " + id));

        if (Boolean.TRUE.equals(generation.getIsDeleted())) {
            throw new BadRequestException("Gen đã bị xóa rồi");
        }

        generation.setIsDeleted(true);
        generationRepository.save(generation);

        List<User> users = userRepository.findByGeneration_Id(id);

        if (!users.isEmpty()) {
            users.forEach(user -> user.setIsDeleted(true));
            userRepository.saveAll(users);
        }
    }

    private GenerationDto mapToDto(Generation generation) {
        return GenerationDto.builder()
                .id(generation.getId())
                .name(generation.getName())
                .yearJoined(generation.getYearJoined())
                .description(generation.getDescription())
                .isDeleted(generation.getIsDeleted())
                .build();
    }
}
