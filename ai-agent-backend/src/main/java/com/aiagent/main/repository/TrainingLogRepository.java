package com.aiagent.main.repository;

import com.aiagent.main.entity.TrainingLog;
import com.aiagent.main.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TrainingLogRepository extends JpaRepository<TrainingLog, Long> {

    // Find all logs by user
    List<TrainingLog> findByUserOrderByWorkoutDateDesc(User user);

    // Find logs by user and workout date
    List<TrainingLog> findByUserAndWorkoutDate(User user, LocalDate workoutDate);

    // Find logs by user within date range
    @Query("SELECT tl FROM TrainingLog tl WHERE tl.user.id = :userId AND tl.workoutDate BETWEEN :startDate AND :endDate ORDER BY tl.workoutDate DESC")
    List<TrainingLog> findByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);

    // Find logs by user and exercise name
    List<TrainingLog> findByUserAndExerciseNameOrderByWorkoutDateDesc(User user, String exerciseName);

    // Count logs by user
    Long countByUser(User user);

    // Find most recent log for a user
    TrainingLog findFirstByUserOrderByWorkoutDateDesc(User user);
}

