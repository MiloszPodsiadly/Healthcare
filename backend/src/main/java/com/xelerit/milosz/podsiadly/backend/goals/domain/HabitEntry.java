package com.xelerit.milosz.podsiadly.backend.goals.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name="habit_entries",
        indexes = {
                @Index(name="idx_habit_user_day", columnList = "user_id, type, day")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable=false, columnDefinition = "uuid")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=16)
    private GoalType type;

    /** np. 250 ml, 3000 steps, 420 minutes, mood=4 */
    @Column(nullable=false)
    private Integer value;

    /** Dzienna partycja do łatwej agregacji (UTC YYYY-MM-DD) */
    @Column(nullable=false, length=10)
    private String day;

    @Column(name="created_at", nullable=false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}

