package com.xelerit.milosz.podsiadly.backend.goals.repository;

import com.xelerit.milosz.podsiadly.backend.goals.domain.DailyGoal;
import com.xelerit.milosz.podsiadly.backend.goals.domain.GoalType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailyGoalRepository extends JpaRepository<DailyGoal, Long> {
    List<DailyGoal> findByUserId(UUID userId);
    Optional<DailyGoal> findByUserIdAndType(UUID userId, GoalType type);
}
