package com.haui.istar.repository.specification;

import com.haui.istar.dto.user.UserSearchCriteria;
import com.haui.istar.model.User;
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

            if (criteria.getUsername() != null && !criteria.getUsername().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("username")),
                        "%" + criteria.getUsername().toLowerCase() + "%"
                ));
            }

            if (criteria.getEmail() != null && !criteria.getEmail().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")),
                        "%" + criteria.getEmail().toLowerCase() + "%"
                ));
            }

            if (criteria.getPhoneNumber() != null && !criteria.getPhoneNumber().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        root.get("phoneNumber"),
                        "%" + criteria.getPhoneNumber() + "%"
                ));
            }

            if (criteria.getFirstName() != null && !criteria.getFirstName().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("firstName")),
                        "%" + criteria.getFirstName().toLowerCase() + "%"
                ));
            }

            if (criteria.getLastName() != null && !criteria.getLastName().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("lastName")),
                        "%" + criteria.getLastName().toLowerCase() + "%"
                ));
            }

            if (criteria.getIsActive() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), criteria.getIsActive()));
            }

            if (criteria.getIsDeleted() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isDeleted"), criteria.getIsDeleted()));
            }

            if (criteria.getSubDepartment() != null) {
                predicates.add(criteriaBuilder.equal(root.get("subDepartment"), criteria.getSubDepartment()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
