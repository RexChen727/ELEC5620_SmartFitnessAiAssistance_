package com.aiagent.main.repository;

import com.aiagent.main.entity.WeeklyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyPlanRepository extends JpaRepository<WeeklyPlan, Long> {

    @Query("SELECT wp FROM WeeklyPlan wp WHERE wp.user.id = :userId ORDER BY wp.startDate ASC")
    List<WeeklyPlan> findByUserIdOrderByStartDateDesc(Long userId);

    @Query("SELECT wp FROM WeeklyPlan wp WHERE wp.user.id = :userId AND wp.startDate <= :date AND wp.endDate >= :date")
    Optional<WeeklyPlan> findCurrentPlan(Long userId, LocalDate date);

    @Query("SELECT wp FROM WeeklyPlan wp WHERE wp.user.id = :userId AND wp.startDate >= :startDate AND wp.endDate <= :endDate")
    List<WeeklyPlan> findByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT wp FROM WeeklyPlan wp WHERE wp.user.id = :userId AND " +
           "wp.startDate <= :endDate AND wp.endDate >= :startDate")
    List<WeeklyPlan> findOverlappingPlans(Long userId, LocalDate startDate, LocalDate endDate);
    
    // JpaRepository already provides findById - we can use it directly
}
