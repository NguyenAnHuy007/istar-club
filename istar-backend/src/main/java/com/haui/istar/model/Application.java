package com.haui.istar.model;

import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.SubDepartment;
import com.haui.istar.model.enums.School;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    private LocalDate birthday;

    @Column(length = 255)
    private String address;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private School school;

    @Column(name = "major_class", length = 100)
    private String majorClass;

    @Column(length = 10)
    private String course; // K16, K17, K18...

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    @Builder.Default
    private SubDepartment subDepartment = SubDepartment.NONE;

    @Column(nullable = false, length = 1000)
    private String reasonDepartment;

    @Column(nullable = false, length = 1000)
    private String knowIStar;

    @Column(nullable = false, length = 1000)
    private String reasonIStarer;

    @Column(length = 500)
    private String cvUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
