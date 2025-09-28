package com.xelerit.milosz.podsiadly.backend.goals.dto;

public record TodayDashboardDto(
        String date,
        Metric steps,
        Metric water,
        Metric sleep,
        Metric mood
) {
    public record Metric(
            Integer value,
            Integer goal,
            String unit
    ) {}
}
