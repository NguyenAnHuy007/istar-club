package com.haui.istar.repository;

import com.haui.istar.model.Generation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GenerationRepository extends JpaRepository<Generation, Long> {

    boolean existsByName(String name);

    Page<Generation> findByIsDeletedFalse(Pageable pageable);
}
