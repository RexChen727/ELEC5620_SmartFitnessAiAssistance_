package com.aiagent.main.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_logs")
public class WorkoutLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String exerciseName; // 项目名称：卧推、深蹲等

    @Column(nullable = false)
    private LocalDateTime startTime; // 开始时间

    @Column
    private LocalDateTime endTime; // 结束时间，可选

    @ElementCollection
    @CollectionTable(name = "workout_sets", joinColumns = @JoinColumn(name = "workout_log_id"))
    private List<WorkoutSet> sets = new ArrayList<>();

    // 聚合字段，便于报表/趋势快速查询
    private Integer totalSets;          // 组数
    private Integer durationSeconds;    // 总时长（秒）
    private Double totalVolume;         // 训练量 Σ(reps*weight)

    @Column(columnDefinition = "TEXT")
    private String notes;               // 备注

    public WorkoutLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getExerciseName() { return exerciseName; }
    public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public List<WorkoutSet> getSets() { return sets; }
    public void setSets(List<WorkoutSet> sets) { this.sets = sets; }

    public Integer getTotalSets() { return totalSets; }
    public void setTotalSets(Integer totalSets) { this.totalSets = totalSets; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public Double getTotalVolume() { return totalVolume; }
    public void setTotalVolume(Double totalVolume) { this.totalVolume = totalVolume; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
