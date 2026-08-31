package com.haui.istar.model;

import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Department;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "application_departments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"application_id", "department"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDepartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Department department;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    // Phỏng vấn
    @Column(name = "interview_score")
    private Double interviewScore;

    @Column(name = "interview_notes", length = 1000)
    private String interviewNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id")
    private User interviewer;

    @Version
    private Long version;
}
