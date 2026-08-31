package com.haui.istar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.haui.istar.model.Application;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIsDeletedFalse(String email);

    Optional<Application> findByIdAndIsDeletedFalse(Long id);

    List<Application> findByIsDeletedFalse();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Application a SET a.status = :newStatus, a.updatedAt = CURRENT_TIMESTAMP WHERE a.id = :id AND a.status = :expectedStatus AND a.isDeleted = false")
    int updateStatusIfExpected(
            @org.springframework.data.repository.query.Param("id") Long id,
            @org.springframework.data.repository.query.Param("newStatus") com.haui.istar.model.enums.ApplicationStatus newStatus,
            @org.springframework.data.repository.query.Param("expectedStatus") com.haui.istar.model.enums.ApplicationStatus expectedStatus
    );
}
