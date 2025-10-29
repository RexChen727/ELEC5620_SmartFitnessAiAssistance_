package com.aiagent.main.service;

import com.aiagent.main.entity.WorkoutLog;
import com.aiagent.main.entity.WorkoutSet;
import com.aiagent.main.entity.User;
import com.aiagent.main.repository.WorkoutLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorkoutLogService {

    @Autowired
    private WorkoutLogRepository workoutLogRepository;

    public WorkoutLog save(WorkoutLog log) {
        // 自动计算聚合字段
        int totalSets = log.getSets() == null ? 0 : log.getSets().size();
        double totalVolume = 0.0;
        if (log.getSets() != null) {
            for (WorkoutSet set : log.getSets()) {
                int reps = set.getReps() == null ? 0 : set.getReps();
                double weight = set.getWeight() == null ? 0.0 : set.getWeight();
                totalVolume += reps * weight;
            }
        }
        log.setTotalSets(totalSets);
        log.setTotalVolume(totalVolume);

        if (log.getStartTime() != null && log.getEndTime() != null) {
            long seconds = java.time.Duration.between(log.getStartTime(), log.getEndTime()).getSeconds();
            log.setDurationSeconds((int) Math.max(0, seconds));
        } else if (log.getDurationSeconds() == null) {
            log.setDurationSeconds(0);
        }

        return workoutLogRepository.save(log);
    }

    public void delete(Long id) {
        workoutLogRepository.deleteById(id);
    }

    public Optional<WorkoutLog> findById(Long id) {
        return workoutLogRepository.findById(id);
    }

    public List<WorkoutLog> getLogsByUser(User user) {
        return workoutLogRepository.findByUserOrderByStartTimeAsc(user);
    }

    public List<WorkoutLog> getLogsByUserAndDate(User user, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        return workoutLogRepository.findByUserAndStartTimeBetweenOrderByStartTimeAsc(user, start, end);
    }

    public List<WorkoutLog> getLogsByUserAndRange(User user, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        return workoutLogRepository.findByUserAndStartTimeBetweenOrderByStartTimeAsc(user, start, end);
    }

    // 月度汇总：返回总训练次数、总训练量、不同项目的训练量以及每日训练量趋势
    public Map<String, Object> getMonthlySummary(User user, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        List<WorkoutLog> logs = getLogsByUserAndRange(user, start, end);

        int workoutsCount = logs.size();
        double totalVolume = logs.stream().mapToDouble(l -> Optional.ofNullable(l.getTotalVolume()).orElse(0.0)).sum();

        Map<String, Double> volumeByExercise = new HashMap<>();
        for (WorkoutLog log : logs) {
            String name = log.getExerciseName();
            double v = Optional.ofNullable(log.getTotalVolume()).orElse(0.0);
            volumeByExercise.merge(name, v, Double::sum);
        }

        // 每日趋势，按日期聚合训练量
        Map<String, Double> dailyTrend = logs.stream().collect(Collectors.groupingBy(
                l -> l.getStartTime().toLocalDate().toString(),
                TreeMap::new,
                Collectors.summingDouble(l -> Optional.ofNullable(l.getTotalVolume()).orElse(0.0))
        ));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("workoutsCount", workoutsCount);
        result.put("totalVolume", totalVolume);
        result.put("volumeByExercise", volumeByExercise);
        result.put("dailyTrend", dailyTrend);
        return result;
    }

    public String exportCsv(User user) {
        List<WorkoutLog> logs = getLogsByUser(user);
        StringBuilder sb = new StringBuilder();
        sb.append("id,userId,exerciseName,startTime,endTime,totalSets,totalVolume,durationSeconds,sets\n");
        for (WorkoutLog log : logs) {
            String setsStr = (log.getSets() == null) ? "" : log.getSets().stream()
                    .map(s -> String.format("#%d:%dreps@%.2fkg(%ds)",
                            Optional.ofNullable(s.getSetIndex()).orElse(0),
                            Optional.ofNullable(s.getReps()).orElse(0),
                            Optional.ofNullable(s.getWeight()).orElse(0.0),
                            Optional.ofNullable(s.getRestSeconds()).orElse(0)))
                    .collect(Collectors.joining("|"));
            sb.append(String.join(",",
                    String.valueOf(Optional.ofNullable(log.getId()).orElse(0L)),
                    String.valueOf(Optional.ofNullable(log.getUser()).map(User::getId).orElse(0L)),
                    escapeCsv(log.getExerciseName()),
                    String.valueOf(Optional.ofNullable(log.getStartTime()).orElse(null)),
                    String.valueOf(Optional.ofNullable(log.getEndTime()).orElse(null)),
                    String.valueOf(Optional.ofNullable(log.getTotalSets()).orElse(0)),
                    String.valueOf(Optional.ofNullable(log.getTotalVolume()).orElse(0.0)),
                    String.valueOf(Optional.ofNullable(log.getDurationSeconds()).orElse(0)),
                    escapeCsv(setsStr)
            ));
            sb.append("\n");
        }
        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\n") || value.contains("\"")) {
            return '"' + value.replace("\"", "\"\"") + '"';
        }
        return value;
    }
}
