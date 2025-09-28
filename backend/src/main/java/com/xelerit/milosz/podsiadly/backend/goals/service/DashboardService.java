package com.xelerit.milosz.podsiadly.backend.goals.service;


import com.xelerit.milosz.podsiadly.backend.goals.domain.DailyGoal;
import com.xelerit.milosz.podsiadly.backend.goals.domain.GoalType;
import com.xelerit.milosz.podsiadly.backend.goals.dto.TodayDashboardDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final HabitService habits;
    private final GoalService goals;

    public TodayDashboardDto today() {
        var map = goals.myGoalsByType();
        return new TodayDashboardDto(
                LocalDate.now().toString(),
                metric(GoalType.STEPS, "steps", map),
                metric(GoalType.WATER, "ml", map),
                metric(GoalType.SLEEP, "min", map),
                metric(GoalType.MOOD,  "score", map)
        );
    }

    private TodayDashboardDto.Metric metric(GoalType type, String unit, Map<GoalType, DailyGoal> map){
        Integer goal = map.get(type) != null ? map.get(type).getTargetValue() : null;
        return new TodayDashboardDto.Metric(habits.sumToday(type), goal, unit);
    }
}