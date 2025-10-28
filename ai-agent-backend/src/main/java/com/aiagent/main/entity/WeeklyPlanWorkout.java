package com.aiagent.main.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "weekly_plan_workouts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyPlanWorkout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weekly_plan_id", nullable = false)
    private WeeklyPlan weeklyPlan;

    @Column(name = "day_index", nullable = false)
    private Integer dayIndex; // 0 = Monday, 6 = Sunday

    @Column(name = "workout_name", nullable = false)
    private String workoutName;

    @Column(name = "sets")
    private Integer sets;

    @Column(name = "reps")
    private Integer reps;

    @Column(name = "weight")
    private String weight;

    @Column(name = "duration")
    private String duration;

    @Column(name = "completed", nullable = false)
    private Boolean completed = false;

    @Column(name = "notes", length = 2000)
    private String notes;
}
