package com.aiagent.main.repository;

import com.aiagent.main.entity.WeeklyPlanWorkout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeeklyPlanWorkoutRepository extends JpaRepository<WeeklyPlanWorkout, Long> {

    @Query("SELECT w FROM WeeklyPlanWorkout w WHERE w.weeklyPlan.id = :planId ORDER BY w.dayIndex ASC")
    List<WeeklyPlanWorkout> findByWeeklyPlanId(Long planId);

    @Query("SELECT w FROM WeeklyPlanWorkout w WHERE w.weeklyPlan.id = :planId AND w.dayIndex = :dayIndex ORDER BY w.id ASC")
    List<WeeklyPlanWorkout> findByWeeklyPlanIdAndDayIndex(Long planId, Integer dayIndex);

    void deleteByWeeklyPlanId(Long planId);
}
