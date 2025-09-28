package com.xelerit.milosz.podsiadly.backend.goals.controller;

import com.xelerit.milosz.podsiadly.backend.goals.domain.GoalType;
import com.xelerit.milosz.podsiadly.backend.goals.dto.QuickAddRequest;
import com.xelerit.milosz.podsiadly.backend.goals.service.HabitService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/habits")
public class HabitsController {

    private final HabitService habits;

    public HabitsController(HabitService habits) {
        this.habits = habits;
    }

    @PostMapping(consumes = "application/json", produces = "application/json")
    public ResponseEntity<Long> quickAdd(@RequestBody @Validated QuickAddRequest req) {
        var saved = habits.quickAdd(req.type(), req.value());
        return ResponseEntity
                .created(URI.create("/api/habits/" + saved.getId()))
                .body(saved.getId());
    }

    // Shortcut dla wody 250 ml
    @PostMapping("/water/250")
    public ResponseEntity<Long> water250() {
        var saved = habits.quickAdd(GoalType.WATER, 250);
        return ResponseEntity
                .created(URI.create("/api/habits/" + saved.getId()))
                .body(saved.getId());
    }
}