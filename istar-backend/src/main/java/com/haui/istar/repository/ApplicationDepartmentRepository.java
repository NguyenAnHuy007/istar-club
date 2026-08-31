package com.haui.istar.repository;

import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.enums.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationDepartmentRepository extends JpaRepository<ApplicationDepartment, Long> {
    List<ApplicationDepartment> findByApplicationId(Long applicationId);
    Optional<ApplicationDepartment> findByApplicationIdAndDepartment(Long applicationId, Department department);
    void deleteByApplicationId(Long applicationId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE ApplicationDepartment ad SET ad.status = :newStatus WHERE ad.id = :id AND ad.status = :expectedStatus")
    int updateStatusIfExpected(
            @org.springframework.data.repository.query.Param("id") Long id,
            @org.springframework.data.repository.query.Param("newStatus") com.haui.istar.model.enums.ApplicationStatus newStatus,
            @org.springframework.data.repository.query.Param("expectedStatus") com.haui.istar.model.enums.ApplicationStatus expectedStatus
    );
}
