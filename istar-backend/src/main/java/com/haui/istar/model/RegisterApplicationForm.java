package com.haui.istar.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_forms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RegisterApplicationForm {
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

    @Column(length = 500)
    private String avatarUrl;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Department department;

    @Column(nullable = false, length = 1000)
    private String reasonDepartment;

    @Column(nullable = false, length = 1000)
    private String knowIStar;

    @Column(nullable = false, length = 1000)
    private String reasonIStarer;
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

    @Column(length = 500)
    private String cvUrl;
}
