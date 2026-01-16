package com.haui.istar.repository;

import com.haui.istar.model.Generation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GenerationRepository extends JpaRepository<Generation, Long> {

    Optional<Generation> findByName(String name);

    List<Generation> findByYearJoined(Integer yearJoined);

    List<Generation> findByIsActiveTrue();

    boolean existsByName(String name);
}
