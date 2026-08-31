package com.haui.istar.repository.specification;

import com.haui.istar.dto.application.AdminApplicationSearchCriteria;
import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import jakarta.persistence.criteria.Join;
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
                Join<Application, ApplicationDepartment> appDeptJoin = root.join("applicationDepartments");
                predicates.add(cb.equal(appDeptJoin.get("department"), criteria.getDepartment()));
            }


            if (criteria.getStatus() != null) {
                // Chúng ta vẫn có status trên Application cho luồng phỏng vấn chung (hoặc bạn có thể dùng status của ApplicationDepartment)
                // Hiện tại tôi vẫn đang dùng ApplicationStatus trên cả hai. Hãy check trên bảng gốc Application.
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            }
            
            // TODO: Thêm filter cho Recruitment nếu có trong Criteria

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

            predicates.add(cb.equal(root.get("isDeleted"), false));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
