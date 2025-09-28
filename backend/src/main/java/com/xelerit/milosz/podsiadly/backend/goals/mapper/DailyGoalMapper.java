package com.xelerit.milosz.podsiadly.backend.goals.mapper;

import com.xelerit.milosz.podsiadly.backend.goals.domain.DailyGoal;
import com.xelerit.milosz.podsiadly.backend.goals.dto.DailyGoalDto;

import java.util.UUID;

public class DailyGoalMapper {

    private DailyGoalMapper() {}

    public static DailyGoalDto toDto(DailyGoal e) {
        if (e == null) {
            return null;
        }
        return new DailyGoalDto(
                e.getId(),
                e.getType(),
                e.getTargetValue(),
                e.getUnit()
        );
    }

    public static DailyGoal fromDto(DailyGoalDto dto, UUID userId) {
        if (dto == null) {
            return null;
        }
        return DailyGoal.builder()
                .id(dto.id())
                .userId(userId)
                .type(dto.type())
                .targetValue(dto.targetValue())
                .unit(dto.unit())
                .build();
    }
}
