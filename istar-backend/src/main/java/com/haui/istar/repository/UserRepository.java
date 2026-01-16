package com.haui.istar.repository;

import com.haui.istar.model.User;
import com.haui.istar.model.enums.Area;
import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;
import com.haui.istar.model.enums.Role;
import com.haui.istar.model.enums.SubDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Query methods cho Position
    long countByPosition(Position position);

    long countByPositionAndIdNot(Position position, Long id);

    long countByPositionAndDepartment(Position position, Department department);

    long countByPositionAndDepartmentAndIdNot(Position position, Department department, Long id);

    List<User> findByPosition(Position position);

    List<User> findByPositionAndDepartment(Position position, Department department);

    // Query methods cho Area
    long countByArea(Area area);

    List<User> findByArea(Area area);

    List<User> findByPositionAndArea(Position position, Area area);

    // Query methods cho Department và SubDepartment
    List<User> findByDepartment(Department department);

    List<User> findByDepartmentAndSubDepartment(Department department, SubDepartment subDepartment);

    // Query methods cho Role
    List<User> findByRole(Role role);

    // Query methods cho Generation
    List<User> findByGeneration(com.haui.istar.model.Generation generation);

    List<User> findByGenerationId(Long generationId);

    long countByGenerationId(Long generationId);
}

