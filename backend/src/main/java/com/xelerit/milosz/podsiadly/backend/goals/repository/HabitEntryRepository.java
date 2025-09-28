package com.xelerit.milosz.podsiadly.backend.goals.repository;

import com.xelerit.milosz.podsiadly.backend.goals.domain.GoalType;
import com.xelerit.milosz.podsiadly.backend.goals.domain.HabitEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface HabitEntryRepository extends JpaRepository<HabitEntry, Long> {

    @Query("select coalesce(sum(h.value),0) from HabitEntry h where h.userId=:userId and h.type=:type and h.day=:day")
    Integer sumForDay(UUID userId, GoalType type, String day);


}
