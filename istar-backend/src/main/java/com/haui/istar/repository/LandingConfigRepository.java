package com.haui.istar.repository;

import com.haui.istar.model.LandingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LandingConfigRepository extends JpaRepository<LandingConfig, Long> {

    Optional<LandingConfig> findByConfigKey(String configKey);
}
