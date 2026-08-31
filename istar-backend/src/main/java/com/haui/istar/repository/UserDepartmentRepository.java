package com.haui.istar.repository;

import com.haui.istar.model.UserDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDepartmentRepository extends JpaRepository<UserDepartment, Long> {
    List<UserDepartment> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
