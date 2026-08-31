package com.haui.istar.repository;

import com.haui.istar.model.Recruitment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecruitmentRepository extends JpaRepository<Recruitment, Long> {
    Page<Recruitment> findByIsDeletedFalse(Pageable pageable);
    Optional<Recruitment> findByIdAndIsDeletedFalse(Long id);
    Optional<Recruitment> findByIsActiveTrueAndIsDeletedFalse();
}
