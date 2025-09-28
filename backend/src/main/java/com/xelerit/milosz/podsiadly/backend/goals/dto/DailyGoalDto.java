package com.xelerit.milosz.podsiadly.backend.goals.dto;

import com.xelerit.milosz.podsiadly.backend.goals.domain.GoalType;
import com.xelerit.milosz.podsiadly.backend.goals.domain.Unit;

public record DailyGoalDto(
        Long id,
        GoalType type,
        Integer targetValue,
        Unit unit
) {}
