package com.xelerit.milosz.podsiadly.backend.goals.controller;


import com.xelerit.milosz.podsiadly.backend.goals.dto.CreateDailyGoalRequest;
import com.xelerit.milosz.podsiadly.backend.goals.dto.DailyGoalDto;
import com.xelerit.milosz.podsiadly.backend.goals.dto.UpdateDailyGoalRequest;
import com.xelerit.milosz.podsiadly.backend.goals.mapper.DailyGoalMapper;
import com.xelerit.milosz.podsiadly.backend.goals.service.GoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/goals/daily")
public class GoalsController {

    private final GoalService service;

    public GoalsController(GoalService service) {
        this.service = service;
    }

    @GetMapping(produces = "application/json")
    public ResponseEntity<List<DailyGoalDto>> list() {
        var list = service.listMyGoals().stream()
                .map(DailyGoalMapper::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping(consumes = "application/json", produces = "application/json")
    public ResponseEntity<DailyGoalDto> upsert(@RequestBody @Validated CreateDailyGoalRequest req) {
        var saved = service.upsert(req);
        return ResponseEntity
                .created(URI.create("/api/goals/daily/" + saved.getId()))
                .body(DailyGoalMapper.toDto(saved));
    }

    @PutMapping(value = "/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<DailyGoalDto> update(@PathVariable Long id,
                                               @RequestBody @Validated UpdateDailyGoalRequest req) {
        var saved = service.update(id, req);
        return ResponseEntity.ok(DailyGoalMapper.toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
