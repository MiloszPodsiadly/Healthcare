package com.xelerit.milosz.podsiadly.backend.goals.controller;

import com.xelerit.milosz.podsiadly.backend.goals.dto.TodayDashboardDto;
import com.xelerit.milosz.podsiadly.backend.goals.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboard;

    public DashboardController(DashboardService dashboard) { this.dashboard = dashboard; }

    @GetMapping("/today")
    public TodayDashboardDto today(){
        return dashboard.today();
    }
}