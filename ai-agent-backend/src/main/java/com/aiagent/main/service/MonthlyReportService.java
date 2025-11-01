package com.aiagent.main.service;

import com.aiagent.main.entity.MonthlyReport;
import com.aiagent.main.entity.TrainingLog;
import com.aiagent.main.repository.MonthlyReportRepository;
import com.aiagent.main.repository.TrainingLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MonthlyReportService {

    @Autowired
    private MonthlyReportRepository monthlyReportRepository;

    @Autowired
    private TrainingLogRepository trainingLogRepository;

    private final ObjectMapper objectMapper;

    public MonthlyReportService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<MonthlyReport> getReportsByUserId(Long userId) {
        return monthlyReportRepository.findByUserIdOrderByReportMonthDesc(userId);
    }

    public Optional<MonthlyReport> getReportById(Long id) {
        return monthlyReportRepository.findById(id);
    }

    public List<MonthlyReport> getAllReports() {
        return monthlyReportRepository.findAll();
    }

    public Optional<MonthlyReport> getReportByUserIdAndMonth(Long userId, LocalDate reportMonth) {
        return monthlyReportRepository.findByUserIdAndReportMonth(userId, reportMonth);
    }

    public MonthlyReport createOrUpdateMonthlyReport(Long userId, LocalDate reportMonth,
                                                     Integer totalSessions, Integer totalDurationMinutes,
                                                     Integer totalCaloriesBurned, Double goalAchievementPercentage,
                                                     Integer currentStreakDays, String weeklyActivityData, String topExercises) {
        Optional<MonthlyReport> existingReport = monthlyReportRepository.findByUserIdAndReportMonth(userId, reportMonth);
        
        MonthlyReport report;
        if (existingReport.isPresent()) {
            report = existingReport.get();
            report.setGeneratedAt(LocalDateTime.now());
        } else {
            report = new MonthlyReport();
            report.setUserId(userId);
            report.setReportMonth(reportMonth);
            report.setGeneratedAt(LocalDateTime.now());
        }
        
        report.setTotalSessions(totalSessions);
        report.setTotalDurationMinutes(totalDurationMinutes);
        report.setTotalCaloriesBurned(totalCaloriesBurned);
        report.setGoalAchievementPercentage(goalAchievementPercentage);
        report.setCurrentStreakDays(currentStreakDays);
        report.setWeeklyActivityData(weeklyActivityData);
        report.setTopExercises(topExercises);
        
        return monthlyReportRepository.save(report);
    }

    public MonthlyReport updateAiInsights(Long reportId, String aiInsights) {
        MonthlyReport report = monthlyReportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Monthly report not found"));
        
        report.setAiInsights(aiInsights);
        return monthlyReportRepository.save(report);
    }

    public MonthlyReport updateReportData(Long reportId, String reportData) {
        MonthlyReport report = monthlyReportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Monthly report not found"));
        
        report.setReportData(reportData);
        return monthlyReportRepository.save(report);
    }

    public void deleteReport(Long id) {
        monthlyReportRepository.deleteById(id);
    }

    /**
     * Generate monthly report from TrainingLog data for a specific month
     */
    @Transactional(readOnly = true)
    public MonthlyReport generateMonthlyReportFromTrainingLogs(Long userId, LocalDate reportMonth) {
        LocalDate monthStart = reportMonth.withDayOfMonth(1);
        LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

        List<TrainingLog> logs = trainingLogRepository.findByUserIdAndDateRange(userId, monthStart, monthEnd);

        if (logs.isEmpty()) {
            return createOrUpdateMonthlyReport(userId, reportMonth, 0, 0, 0, 0.0, 0, "[]", "[]");
        }

        // Calculate total sessions (total number of workouts, not unique dates)
        int totalSessions = logs.size();

        // Calculate total minutes and calories
        int totalMinutes = logs.stream()
                .mapToInt(log -> log.getDurationMinutes() != null ? log.getDurationMinutes() : 0)
                .sum();
        int totalCalories = logs.stream()
                .mapToInt(log -> log.getCaloriesBurned() != null ? log.getCaloriesBurned() : 0)
                .sum();

        // Calculate current streak (consecutive days with workouts up to report month end)
        int currentStreak = calculateCurrentStreak(userId, monthEnd);

        // Calculate weekly activity
        String weeklyActivityData = calculateWeeklyActivity(logs, monthStart, monthEnd);

        // Calculate top exercises
        String topExercises = calculateTopExercises(logs);

        // Calculate adherence rate (assuming 4 workouts per week as baseline, ~16 per month)
        double goalWorkouts = 16.0;
        double adherenceRate = Math.min(100.0, (totalSessions / goalWorkouts) * 100.0);

        return createOrUpdateMonthlyReport(
                userId, reportMonth, totalSessions, totalMinutes, totalCalories,
                adherenceRate, currentStreak, weeklyActivityData, topExercises
        );
    }

    private int calculateCurrentStreak(Long userId, LocalDate upToDate) {
        LocalDate checkDate = upToDate;
        int streak = 0;

        while (checkDate.isAfter(upToDate.minusYears(1))) {
            List<TrainingLog> dayLogs = trainingLogRepository.findByUserIdAndDateRange(
                    userId, checkDate, checkDate);
            if (dayLogs.isEmpty()) {
                break;
            }
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }

    private String calculateWeeklyActivity(List<TrainingLog> logs, LocalDate monthStart, LocalDate monthEnd) {
        Map<Integer, WeeklyActivity> weekMap = new HashMap<>();
        LocalDate currentDate = monthStart;

        int weekNum = 1;
        while (!currentDate.isAfter(monthEnd)) {
            final LocalDate weekStart = currentDate;
            final LocalDate weekEnd = weekStart.plusDays(6).isAfter(monthEnd) ? monthEnd : weekStart.plusDays(6);

            // Count all workouts in this week (not just unique dates)
            int workouts = (int) logs.stream()
                    .filter(log -> !log.getWorkoutDate().isBefore(weekStart) && !log.getWorkoutDate().isAfter(weekEnd))
                    .count();
            int minutes = logs.stream()
                    .filter(log -> !log.getWorkoutDate().isBefore(weekStart) && !log.getWorkoutDate().isAfter(weekEnd))
                    .mapToInt(log -> log.getDurationMinutes() != null ? log.getDurationMinutes() : 0)
                    .sum();

            weekMap.put(weekNum, new WeeklyActivity("Week " + weekNum, workouts, minutes));
            weekNum++;
            currentDate = weekStart.plusDays(7);
        }

        try {
            List<WeeklyActivity> activities = new ArrayList<>(weekMap.values());
            return objectMapper.writeValueAsString(activities);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private String calculateTopExercises(List<TrainingLog> logs) {
        Map<String, Integer> exerciseCounts = logs.stream()
                .collect(Collectors.groupingBy(
                        TrainingLog::getExerciseName,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        int totalExercises = logs.size();

        List<Map<String, Object>> topExercises = exerciseCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> ex = new HashMap<>();
                    ex.put("name", entry.getKey());
                    ex.put("count", entry.getValue());
                    ex.put("percentage", totalExercises > 0 ? Math.round((entry.getValue() * 100.0 / totalExercises)) : 0);
                    return ex;
                })
                .collect(Collectors.toList());

        try {
            return objectMapper.writeValueAsString(topExercises);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private static class WeeklyActivity {
        @SuppressWarnings("unused")
        public String week;
        @SuppressWarnings("unused")
        public int workouts;
        @SuppressWarnings("unused")
        public int minutes;

        public WeeklyActivity(String week, int workouts, int minutes) {
            this.week = week;
            this.workouts = workouts;
            this.minutes = minutes;
        }
    }
}
