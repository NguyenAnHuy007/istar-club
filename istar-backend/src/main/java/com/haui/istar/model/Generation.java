package com.haui.istar.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "generations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Generation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "year_joined", nullable = false)
    private Integer yearJoined;

    @Column(length = 500)
    private String description;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        if (yearJoined == null) {
            yearJoined = LocalDateTime.now().getYear();
        }
    }
}
