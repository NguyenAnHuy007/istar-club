package com.haui.istar.repository.specification;

import com.haui.istar.dto.user.UserSearchCriteria;
import com.haui.istar.model.User;
import com.haui.istar.model.UserDepartment;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> buildSpecification(UserSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("id"), criteria.getId()));
            }

            if (criteria.getKeyword() != null && !criteria.getKeyword().isEmpty()) {
                String keyword = "%" + criteria.getKeyword().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("phoneNumber")), keyword)
                ));
            }

            if (criteria.getPosition() != null) {
                predicates.add(criteriaBuilder.equal(root.get("position"), criteria.getPosition()));
            }

            if (criteria.getDepartment() != null) {
                Join<User, UserDepartment> udJoin = root.join("userDepartments");
                predicates.add(criteriaBuilder.equal(udJoin.get("department"), criteria.getDepartment()));
            }


            if (criteria.getGenerationId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("generation").get("id"), criteria.getGenerationId()));
            }

            if (criteria.getCourse() != null && !criteria.getCourse().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("course"), criteria.getCourse()));
            }

            if (criteria.getIsActive() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), criteria.getIsActive()));
            }

            if (criteria.getIsDeleted() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isDeleted"), criteria.getIsDeleted()));
            } else {
                predicates.add(criteriaBuilder.equal(root.get("isDeleted"), false));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
