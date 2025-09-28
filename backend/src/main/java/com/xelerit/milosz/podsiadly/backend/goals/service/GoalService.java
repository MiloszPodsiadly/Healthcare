// GoalService.java
package com.xelerit.milosz.podsiadly.backend.goals.service;

import com.xelerit.milosz.podsiadly.backend.goals.domain.DailyGoal;
import com.xelerit.milosz.podsiadly.backend.goals.domain.GoalType;
import com.xelerit.milosz.podsiadly.backend.goals.domain.Unit;
import com.xelerit.milosz.podsiadly.backend.goals.dto.CreateDailyGoalRequest;
import com.xelerit.milosz.podsiadly.backend.goals.dto.UpdateDailyGoalRequest;
import com.xelerit.milosz.podsiadly.backend.goals.repository.DailyGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class GoalService {
    private final DailyGoalRepository goals;
    private final CurrentUserService current;

    public List<DailyGoal> listMyGoals() {
        return goals.findByUserId(current.currentUserId());
    }

    public DailyGoal upsert(CreateDailyGoalRequest req){
        var uid = current.currentUserId();
        var g = goals.findByUserIdAndType(uid, req.type())
                .orElseGet(DailyGoal::new);
        g.setUserId(uid);
        g.setType(req.type());
        g.setTargetValue(req.targetValue());
        g.setUnit(req.unit());
        return goals.save(g);
    }

    public DailyGoal update(Long id, UpdateDailyGoalRequest req){
        var g = goals.findById(id).orElseThrow();
        if(!g.getUserId().equals(current.currentUserId())) throw new IllegalArgumentException("Forbidden");
        g.setTargetValue(req.targetValue());
        g.setUnit(req.unit());
        return goals.save(g);
    }

    public void delete(Long id){
        var g = goals.findById(id).orElseThrow();
        if(!g.getUserId().equals(current.currentUserId())) throw new IllegalArgumentException("Forbidden");
        goals.delete(g);
    }

    public Map<GoalType, DailyGoal> myGoalsByType(){
        var map = new EnumMap<GoalType, DailyGoal>(GoalType.class);
        for (var g : listMyGoals()) map.put(g.getType(), g);
        return map;
    }
}