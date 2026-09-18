package com.haui.istar.repository.specification;

import com.haui.istar.dto.application.AdminApplicationSearchCriteria;
import com.haui.istar.model.Application;
import com.haui.istar.model.ApplicationDepartment;
import com.haui.istar.model.enums.ApplicationStatus;

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

            if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                String kw = "%" + criteria.getKeyword().trim().toLowerCase() + "%";
                Predicate kwEmail = cb.like(cb.lower(root.get("email")), kw);
                Predicate kwFirst = cb.like(cb.lower(root.get("firstName")), kw);
                Predicate kwLast = cb.like(cb.lower(root.get("lastName")), kw);
                Predicate kwFullName = cb
                        .like(cb.lower(cb.concat(cb.concat(root.get("lastName"), " "), root.get("firstName"))), kw);
                Predicate kwFullNameRev = cb
                        .like(cb.lower(cb.concat(cb.concat(root.get("firstName"), " "), root.get("lastName"))), kw);
                Predicate kwPhone = cb.like(root.get("phoneNumber"), kw);
                predicates.add(cb.or(kwEmail, kwFirst, kwLast, kwFullName, kwFullNameRev, kwPhone));
            }

            if (criteria.getDepartment() != null || criteria.getAllowedDepartments() != null
                    || Boolean.TRUE.equals(criteria.getDeptNotInterviewedOnly())) {
                Join<Application, ApplicationDepartment> appDeptJoin = root.join("applicationDepartments");
                if (criteria.getDepartment() != null) {
                    predicates.add(cb.equal(appDeptJoin.get("department"), criteria.getDepartment()));
                }
                if (criteria.getAllowedDepartments() != null) {
                    if (criteria.getAllowedDepartments().isEmpty()) {
                        predicates.add(cb.disjunction());
                    } else {
                        predicates.add(appDeptJoin.get("department").in(criteria.getAllowedDepartments()));
                    }
                }
                if (Boolean.TRUE.equals(criteria.getDeptNotInterviewedOnly())) {
                    predicates.add(cb.notEqual(appDeptJoin.get("status"), ApplicationStatus.INTERVIEWED));
                }
                query.distinct(true);
            }

            if (criteria.getStatuses() != null && !criteria.getStatuses().isEmpty()) {
                predicates.add(root.get("status").in(criteria.getStatuses()));
            } else if (criteria.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            }

            if (criteria.getArea() != null) {
                predicates.add(cb.equal(root.get("area"), criteria.getArea()));
            }

            if (criteria.getRecruitmentId() != null) {
                predicates.add(cb.equal(root.get("recruitment").get("id"), criteria.getRecruitmentId()));
            }

            if (Boolean.TRUE.equals(criteria.getActiveRecruitmentOnly())) {
                predicates.add(cb.isTrue(root.get("recruitment").get("isActive")));
                predicates.add(cb.isFalse(root.get("recruitment").get("isDeleted")));
            }

            if (criteria.getBirthdayFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("birthday"), criteria.getBirthdayFrom()));
            }

            if (criteria.getBirthdayTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("birthday"), criteria.getBirthdayTo()));
            }

            if (criteria.getCreatedFrom() != null) {
                predicates
                        .add(cb.greaterThanOrEqualTo(root.get("createdAt"), criteria.getCreatedFrom().atStartOfDay()));
            }

            if (criteria.getCreatedTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), criteria.getCreatedTo().atTime(23, 59, 59)));
            }

            if (criteria.getSchool() != null && !criteria.getSchool().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("school")), "%" + criteria.getSchool().trim().toLowerCase() + "%"));
            }

            if (criteria.getCourse() != null && !criteria.getCourse().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("course")), "%" + criteria.getCourse().trim().toLowerCase() + "%"));
            }

            predicates.add(cb.equal(root.get("isDeleted"), false));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
