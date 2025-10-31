package com.aiagent.main.service;

import com.aiagent.main.entity.MonthlyReport;
import com.aiagent.main.repository.MonthlyReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MonthlyReportService {

    @Autowired
    private MonthlyReportRepository monthlyReportRepository;

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
}
