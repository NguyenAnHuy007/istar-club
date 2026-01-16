package com.haui.istar.repository.specification;

import com.haui.istar.dto.application.AdminApplicationSearchCriteria;
import com.haui.istar.model.Application;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ApplicationSpecification {

    public static Specification<Application> withCriteria(AdminApplicationSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getEmail() != null && !criteria.getEmail().isEmpty()) {
                if (criteria.getEmail().contains("%")) {
                    predicates.add(cb.like(cb.lower(root.get("email")), criteria.getEmail().toLowerCase()));
                } else {
                    predicates.add(cb.equal(cb.lower(root.get("email")), criteria.getEmail().toLowerCase()));
                }
            }

            if (criteria.getFirstName() != null && !criteria.getFirstName().isEmpty()) {
                if (criteria.getFirstName().contains("%")) {
                    predicates.add(cb.like(cb.lower(root.get("firstName")), criteria.getFirstName().toLowerCase()));
                } else {
                    predicates.add(cb.equal(cb.lower(root.get("firstName")), criteria.getFirstName().toLowerCase()));
                }
            }

            if (criteria.getLastName() != null && !criteria.getLastName().isEmpty()) {
                if (criteria.getLastName().contains("%")) {
                    predicates.add(cb.like(cb.lower(root.get("lastName")), criteria.getLastName().toLowerCase()));
                } else {
                    predicates.add(cb.equal(cb.lower(root.get("lastName")), criteria.getLastName().toLowerCase()));
                }
            }

            if (criteria.getPhoneNumber() != null && !criteria.getPhoneNumber().isEmpty()) {
                if (criteria.getPhoneNumber().contains("%")) {
                    predicates.add(cb.like(root.get("phoneNumber"), criteria.getPhoneNumber()));
                } else {
                    predicates.add(cb.equal(root.get("phoneNumber"), criteria.getPhoneNumber()));
                }
            }

            if (criteria.getDepartment() != null) {
                predicates.add(cb.equal(root.get("department"), criteria.getDepartment()));
            }

            if (criteria.getSubDepartment() != null) {
                predicates.add(cb.equal(root.get("subDepartment"), criteria.getSubDepartment()));
            }

            if (criteria.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            }

            if (criteria.getBirthdayFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("birthday"), criteria.getBirthdayFrom()));
            }

            if (criteria.getBirthdayTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("birthday"), criteria.getBirthdayTo()));
            }

            if (criteria.getCreatedFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), criteria.getCreatedFrom().atStartOfDay()));
            }

            if (criteria.getCreatedTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), criteria.getCreatedTo().atTime(23, 59, 59)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
