package com.haui.istar.model;

import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_departments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "department"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDepartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Department department;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private Position position = Position.MEMBER;
}
