package com.aiagent.main.controller;

import com.aiagent.main.entity.MonthlyReport;
import com.aiagent.main.service.MonthlyReportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/monthly-reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
@Slf4j
public class MonthlyReportController {

    @Autowired
    private MonthlyReportService monthlyReportService;

    @GetMapping
    public ResponseEntity<List<MonthlyReport>> getAllReports() {
        try {
            List<MonthlyReport> reports = monthlyReportService.getAllReports();
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<MonthlyReport> getReportById(@PathVariable Long id) {
        try {
            return monthlyReportService.getReportById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MonthlyReport>> getMonthlyReportsByUserId(@PathVariable Long userId) {
        try {
            List<MonthlyReport> reports = monthlyReportService.getReportsByUserId(userId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/user/{userId}/month/{year}/{month}")
    public ResponseEntity<?> getMonthlyReportByUserAndMonth(
            @PathVariable Long userId,
            @PathVariable Integer year,
            @PathVariable Integer month,
            @RequestParam(required = false, defaultValue = "true") Boolean refresh) {
        try {
            LocalDate reportMonth = LocalDate.of(year, month, 1);
            
            // Always regenerate from TrainingLog to ensure data is up-to-date
            MonthlyReport generatedReport = monthlyReportService.generateMonthlyReportFromTrainingLogs(userId, reportMonth);
            return ResponseEntity.ok(generatedReport);
        } catch (Exception e) {
            log.error("Error fetching monthly report for user {} in {}/{}", userId, year, month, e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("details", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> createMonthlyReport(@RequestBody MonthlyReport monthlyReport) {
        try {
            MonthlyReport createdReport = monthlyReportService.createOrUpdateMonthlyReport(
                monthlyReport.getUserId(),
                monthlyReport.getReportMonth(),
                monthlyReport.getTotalSessions(),
                monthlyReport.getTotalDurationMinutes(),
                monthlyReport.getTotalCaloriesBurned(),
                monthlyReport.getGoalAchievementPercentage(),
                monthlyReport.getCurrentStreakDays(),
                monthlyReport.getWeeklyActivityData(),
                monthlyReport.getTopExercises()
            );
            return ResponseEntity.ok(createdReport);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/{reportId}/ai-insights")
    public ResponseEntity<?> updateAiInsights(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> request) {
        try {
            String aiInsights = request.get("aiInsights");
            MonthlyReport updatedReport = monthlyReportService.updateAiInsights(reportId, aiInsights);
            return ResponseEntity.ok(updatedReport);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/{reportId}/report-data")
    public ResponseEntity<?> updateReportData(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> request) {
        try {
            String reportData = request.get("reportData");
            MonthlyReport updatedReport = monthlyReportService.updateReportData(reportId, reportData);
            return ResponseEntity.ok(updatedReport);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        try {
            monthlyReportService.deleteReport(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/statistics/user/{userId}")
    public ResponseEntity<Map<String, Object>> getMonthlyStatistics(@PathVariable Long userId) {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Use current month as default statistics period
            LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
            Optional<MonthlyReport> report = monthlyReportService.getReportByUserIdAndMonth(userId, currentMonth);
            
            if (report.isPresent()) {
                MonthlyReport r = report.get();
                stats.put("totalWorkouts", r.getTotalSessions());
                stats.put("totalMinutes", r.getTotalDurationMinutes());
                stats.put("caloriesBurned", r.getTotalCaloriesBurned());
                stats.put("currentStreak", r.getCurrentStreakDays());
                stats.put("adherenceRate", r.getGoalAchievementPercentage());
                
                // Parse JSON fields here if needed in the future
                if (r.getWeeklyActivityData() != null && !r.getWeeklyActivityData().isEmpty()) {
                    // TODO: parse JSON string
                }
                if (r.getTopExercises() != null && !r.getTopExercises().isEmpty()) {
                    // TODO: parse JSON string
                }
            } else {
                // Default empty statistics
                stats.put("totalWorkouts", 0);
                stats.put("totalMinutes", 0);
                stats.put("caloriesBurned", 0);
                stats.put("currentStreak", 0);
                stats.put("adherenceRate", 0.0);
            }
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching monthly statistics for user {}", userId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("details", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/generate/user/{userId}/month/{year}/{month}")
    public ResponseEntity<?> generateReportFromTrainingLogs(
            @PathVariable Long userId,
            @PathVariable Integer year,
            @PathVariable Integer month) {
        try {
            LocalDate reportMonth = LocalDate.of(year, month, 1);
            MonthlyReport report = monthlyReportService.generateMonthlyReportFromTrainingLogs(userId, reportMonth);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("details", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(error);
        }
    }

    private Map<String, Object> createDefaultReport(Long userId, LocalDate reportMonth) {
        Map<String, Object> defaultReport = new HashMap<>();
        defaultReport.put("userId", userId);
        defaultReport.put("reportMonth", reportMonth);
        defaultReport.put("totalSessions", 0);
        defaultReport.put("totalDurationMinutes", 0);
        defaultReport.put("totalCaloriesBurned", 0);
        defaultReport.put("goalAchievementPercentage", 0.0);
        return defaultReport;
    }
}
