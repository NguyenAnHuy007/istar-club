package com.haui.istar.repository;

import com.haui.istar.model.PermissionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionGroupRepository extends JpaRepository<PermissionGroup, Long> {
    Optional<PermissionGroup> findByCode(String code);
    List<PermissionGroup> findByCodeIn(Collection<String> codes);
}
