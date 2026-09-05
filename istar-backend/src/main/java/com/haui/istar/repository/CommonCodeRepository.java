package com.haui.istar.repository;

import com.haui.istar.model.CommonCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommonCodeRepository extends JpaRepository<CommonCode, Long> {

    List<CommonCode> findByCategoryAndIsActiveTrueOrderByOrderIndexAsc(String category);

    List<CommonCode> findByCategoryOrderByOrderIndexAsc(String category);

    Optional<CommonCode> findByCategoryAndCode(String category, String code);

    boolean existsByCategoryAndCode(String category, String code);
}
