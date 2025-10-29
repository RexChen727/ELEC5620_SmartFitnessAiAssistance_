package com.aiagent.main.controller;

import com.aiagent.main.entity.WorkoutLog;
import com.aiagent.main.entity.User;
import com.aiagent.main.service.WorkoutLogService;
import com.aiagent.main.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class WorkoutLogController {

    @Autowired
    private WorkoutLogService workoutLogService;

    @Autowired
    private UserService userService;

    @GetMapping("")
    public ResponseEntity<List<WorkoutLog>> list(@RequestParam Long userId,
                                                 @RequestParam(required = false) String start,
                                                 @RequestParam(required = false) String end) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        if (start != null && end != null) {
            LocalDate s = LocalDate.parse(start);
            LocalDate e = LocalDate.parse(end);
            return ResponseEntity.ok(workoutLogService.getLogsByUserAndRange(user, s, e));
        }
        return ResponseEntity.ok(workoutLogService.getLogsByUser(user));
    }

    @GetMapping("/day")
    public ResponseEntity<List<WorkoutLog>> listByDay(@RequestParam Long userId,
                                                      @RequestParam String date) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        LocalDate d = LocalDate.parse(date);
        return ResponseEntity.ok(workoutLogService.getLogsByUserAndDate(user, d));
    }

    @PostMapping("")
    public ResponseEntity<WorkoutLog> create(@RequestBody Map<String, Object> body) {
        try {
            Long userId = ((Number)((Map<String, Object>)body.get("user")).get("id")).longValue();
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) return ResponseEntity.badRequest().build();

            WorkoutLog log = mapToWorkoutLog(body, userOpt.get());
            WorkoutLog saved = workoutLogService.save(log);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutLog> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Optional<WorkoutLog> existed = workoutLogService.findById(id);
            if (existed.isEmpty()) return ResponseEntity.notFound().build();
            WorkoutLog toUpdate = mapToWorkoutLog(body, existed.get().getUser());
            toUpdate.setId(id);
            WorkoutLog saved = workoutLogService.save(toUpdate);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workoutLogService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summary/month")
    public ResponseEntity<Map<String, Object>> monthlySummary(@RequestParam Long userId,
                                                              @RequestParam int year,
                                                              @RequestParam int month) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(workoutLogService.getMonthlySummary(userOpt.get(), year, month));
    }

    @GetMapping("/export")
    public ResponseEntity<?> export(@RequestParam Long userId,
                                    @RequestParam(defaultValue = "json") String format) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();

        if ("csv".equalsIgnoreCase(format)) {
            String csv = workoutLogService.exportCsv(user);
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=workout_logs.csv");
            headers.setContentType(MediaType.valueOf("text/csv; charset=utf-8"));
            return ResponseEntity.ok().headers(headers).body(csv);
        }
        // 默认JSON
        List<WorkoutLog> logs = workoutLogService.getLogsByUser(user);
        return ResponseEntity.ok(logs);
    }

    private WorkoutLog mapToWorkoutLog(Map<String, Object> body, User user) {
        WorkoutLog log = new WorkoutLog();
        log.setUser(user);
        log.setExerciseName(Objects.toString(body.get("exerciseName"), ""));

        DateTimeFormatter iso = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        if (body.get("startTime") != null) {
            String s = body.get("startTime").toString().replace("Z", "");
            log.setStartTime(LocalDateTime.parse(s, iso));
        }
        if (body.get("endTime") != null && !Objects.toString(body.get("endTime"), "").isEmpty()) {
            String e = body.get("endTime").toString().replace("Z", "");
            log.setEndTime(LocalDateTime.parse(e, iso));
        }
        if (body.get("durationSeconds") != null) {
            log.setDurationSeconds(((Number) body.get("durationSeconds")).intValue());
        }
        log.setNotes(Objects.toString(body.get("notes"), null));

        List<Map<String, Object>> sets = (List<Map<String, Object>>) body.getOrDefault("sets", new ArrayList<>());
        List<com.aiagent.main.entity.WorkoutSet> setList = new ArrayList<>();
        for (int i = 0; i < sets.size(); i++) {
            Map<String, Object> m = sets.get(i);
            com.aiagent.main.entity.WorkoutSet s = new com.aiagent.main.entity.WorkoutSet();
            if (m.get("setIndex") != null) s.setSetIndex(((Number) m.get("setIndex")).intValue());
            else s.setSetIndex(i + 1);
            if (m.get("reps") != null) s.setReps(((Number) m.get("reps")).intValue());
            if (m.get("weight") != null) s.setWeight(((Number) m.get("weight")).doubleValue());
            if (m.get("restSeconds") != null) s.setRestSeconds(((Number) m.get("restSeconds")).intValue());
            setList.add(s);
        }
        log.setSets(setList);
        return log;
    }
}
