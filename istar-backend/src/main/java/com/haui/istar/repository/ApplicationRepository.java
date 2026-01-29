package com.haui.istar.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.haui.istar.model.Application;

public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application>{
    boolean existsByEmail(String email);
    @SuppressWarnings("NullableProblems")
    Optional<Application> findById(Long id);
}
