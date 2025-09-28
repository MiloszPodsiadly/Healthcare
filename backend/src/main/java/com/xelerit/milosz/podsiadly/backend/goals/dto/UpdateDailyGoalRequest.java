package com.xelerit.milosz.podsiadly.backend.goals.dto;

import com.xelerit.milosz.podsiadly.backend.goals.domain.Unit;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateDailyGoalRequest(
        @NotNull @Min(1) Integer targetValue,
        @NotNull Unit unit
) {}
