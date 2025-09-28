package com.xelerit.milosz.podsiadly.backend.goals.dto;

import com.xelerit.milosz.podsiadly.backend.goals.domain.GoalType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record QuickAddRequest(
        @NotNull GoalType type,
        @NotNull @Min(1) Integer value
) {}
