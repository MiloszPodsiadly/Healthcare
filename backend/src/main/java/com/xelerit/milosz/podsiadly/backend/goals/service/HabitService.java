package com.xelerit.milosz.podsiadly.backend.goals.service;


import com.xelerit.milosz.podsiadly.backend.goals.domain.GoalType;
import com.xelerit.milosz.podsiadly.backend.goals.domain.HabitEntry;
import com.xelerit.milosz.podsiadly.backend.goals.repository.HabitEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
@Service
@Transactional
@RequiredArgsConstructor
public class HabitService {

    private final HabitEntryRepository entries;
    private final CurrentUserService current;

    public HabitEntry quickAdd(GoalType type, int value){
        var e = HabitEntry.builder()
                .userId(current.currentUserId())
                .type(type)
                .value(value)
                .day(LocalDate.now().toString())
                .build();
        return entries.save(e);
    }

    public int sumToday(GoalType type){
        return entries.sumForDay(current.currentUserId(), type, LocalDate.now().toString());
    }
}
