package com.haui.istar.repository;

import com.haui.istar.model.User;
import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.stereotype.Repository;

import jakarta.persistence.QueryHint;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsernameAndIsDeletedFalse(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // --- Pessimistic Lock queries để tránh Race Condition ---
    // Dùng SELECT ... FOR UPDATE: lock các row có position tương ứng
    // trong suốt transaction hiện tại, đảm bảo không có 2 thread cùng
    // đếm và tạo chức vụ vượt giới hạn đồng thời.

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
    @Query("SELECT COUNT(u) FROM User u WHERE u.position = :position AND u.isDeleted = false")
    long countByPositionForUpdate(Position position);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
    @Query("SELECT COUNT(u) FROM User u WHERE u.position = :position AND u.id <> :excludeId AND u.isDeleted = false")
    long countByPositionExcludingForUpdate(Position position, Long excludeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
    @Query("SELECT COUNT(u) FROM User u WHERE u.position = :position AND u.department = :department AND u.isDeleted = false")
    long countByPositionAndDepartmentForUpdate(Position position, Department department);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
    @Query("SELECT COUNT(u) FROM User u WHERE u.position = :position AND u.department = :department AND u.id <> :excludeId AND u.isDeleted = false")
    long countByPositionAndDepartmentExcludingForUpdate(Position position, Department department, Long excludeId);

    @Query("SELECT DISTINCT u.course FROM User u WHERE u.course IS NOT NULL AND u.isDeleted = false ORDER BY u.course DESC")
    List<String> findDistinctCourses();

    List<User> findByGeneration_Id(Long generationId);
}
