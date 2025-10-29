package com.aiagent.main.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class WorkoutSet {

    private Integer setIndex;    // 第几组，从1开始
    private Integer reps;        // 次数
    private Double weight;       // 负重，单位千克
    private Integer restSeconds; // 本组结束后的休息（秒）

    public WorkoutSet() {}

    public WorkoutSet(Integer setIndex, Integer reps, Double weight, Integer restSeconds) {
        this.setIndex = setIndex;
        this.reps = reps;
        this.weight = weight;
        this.restSeconds = restSeconds;
    }

    public Integer getSetIndex() {
        return setIndex;
    }

    public void setSetIndex(Integer setIndex) {
        this.setIndex = setIndex;
    }

    public Integer getReps() {
        return reps;
    }

    public void setReps(Integer reps) {
        this.reps = reps;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public void setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
    }
}
