package com.aiagent.main.repository;

import com.aiagent.main.entity.WorkoutLog;
import com.aiagent.main.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByUserAndStartTimeBetweenOrderByStartTimeAsc(User user, LocalDateTime start, LocalDateTime end);
    List<WorkoutLog> findByUserOrderByStartTimeAsc(User user);
}
