package com.aiagent.main.service;

import com.aiagent.main.entity.TrainingLog;
import com.aiagent.main.entity.User;
import com.aiagent.main.repository.TrainingLogRepository;
import com.aiagent.main.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class TrainingLogService {

    @Autowired
    private TrainingLogRepository trainingLogRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Save or update a training log
     */
    public TrainingLog saveTrainingLog(TrainingLog trainingLog) {
        log.info("Saving training log for user: {}", trainingLog.getUser().getId());
        return trainingLogRepository.save(trainingLog);
    }

    /**
     * Get all training logs for a user
     */
    public List<TrainingLog> getAllTrainingLogs(Long userId) {
        log.info("Fetching all training logs for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return trainingLogRepository.findByUserOrderByWorkoutDateDesc(user);
    }

    /**
     * Get training logs for a specific date
     */
    public List<TrainingLog> getTrainingLogsByDate(Long userId, LocalDate date) {
        log.info("Fetching training logs for user: {} on date: {}", userId, date);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return trainingLogRepository.findByUserAndWorkoutDate(user, date);
    }

    /**
     * Get training logs within a date range
     */
    public List<TrainingLog> getTrainingLogsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("Fetching training logs for user: {} between {} and {}", userId, startDate, endDate);
        return trainingLogRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    /**
     * Get training logs by exercise name
     */
    public List<TrainingLog> getTrainingLogsByExercise(Long userId, String exerciseName) {
        log.info("Fetching training logs for user: {} with exercise: {}", userId, exerciseName);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return trainingLogRepository.findByUserAndExerciseNameOrderByWorkoutDateDesc(user, exerciseName);
    }

    /**
     * Get training log by ID
     */
    public Optional<TrainingLog> getTrainingLogById(Long id) {
        return trainingLogRepository.findById(id);
    }

    /**
     * Delete training log by ID
     */
    public void deleteTrainingLog(Long id) {
        log.info("Deleting training log with id: {}", id);
        trainingLogRepository.deleteById(id);
    }

    /**
     * Get training statistics for a user
     */
    public long getTotalWorkouts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return trainingLogRepository.countByUser(user);
    }

    /**
     * Get most recent training log for a user
     */
    public Optional<TrainingLog> getMostRecentTrainingLog(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        TrainingLog log = trainingLogRepository.findFirstByUserOrderByWorkoutDateDesc(user);
        return Optional.ofNullable(log);
    }
}

