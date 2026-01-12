package com.haui.istar.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.haui.istar.model.RegisterApplicationForm;

public interface RegisterApplicationRepository extends JpaRepository<RegisterApplicationForm, Long>, JpaSpecificationExecutor<RegisterApplicationForm>{
    boolean existsByEmail(String email);
    Optional<RegisterApplicationForm> findById(Long id);
}
