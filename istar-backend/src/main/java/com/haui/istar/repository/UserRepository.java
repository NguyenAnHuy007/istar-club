package com.haui.istar.repository;

import com.haui.istar.model.User;
import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsernameAndIsDeletedFalse(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    long countByPosition(Position position);

    long countByPositionAndIdNot(Position position, Long id);

    long countByPositionAndDepartment(Position position, Department department);

    long countByPositionAndDepartmentAndIdNot(Position position, Department department, Long id);

    @Query("SELECT DISTINCT u.course FROM User u WHERE u.course IS NOT NULL AND u.isDeleted = false ORDER BY u.course DESC")
    List<String> findDistinctCourses();

    List<User> findByGeneration_Id(Long generationId);
}
