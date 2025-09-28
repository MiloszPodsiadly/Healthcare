package com.xelerit.milosz.podsiadly.backend.goals.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "daily_goals",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_daily_goal_user_type",
                columnNames = {"user_id","type"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable=false, columnDefinition = "uuid")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=16)
    private GoalType type;

    @Column(name="target_value", nullable=false)
    private Integer targetValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=16)
    private Unit unit;

    @Column(name="created_at", nullable=false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
