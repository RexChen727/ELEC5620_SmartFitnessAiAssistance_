package com.aiagent.main.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "report_month", nullable = false)
    private LocalDate reportMonth;

    @Column(name = "total_sessions")
    private Integer totalSessions;

    @Column(name = "total_duration_minutes")
    private Integer totalDurationMinutes;

    @Column(name = "total_calories_burned")
    private Integer totalCaloriesBurned;

    @Column(name = "goal_achievement_percentage")
    private Double goalAchievementPercentage;

    @Column(name = "report_data", columnDefinition = "TEXT")
    private String reportData;

    @Column(name = "ai_insights", columnDefinition = "TEXT")
    private String aiInsights;

    @Column(name = "current_streak_days")
    private Integer currentStreakDays;

    @Column(name = "weekly_activity_data", columnDefinition = "TEXT")
    private String weeklyActivityData;

    @Column(name = "top_exercises", columnDefinition = "TEXT")
    private String topExercises;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (generatedAt == null) {
            generatedAt = LocalDateTime.now();
        }
    }
}
